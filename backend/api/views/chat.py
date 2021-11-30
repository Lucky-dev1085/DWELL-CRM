from django.utils import timezone
from datetime import timedelta

from rest_framework import filters
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404

from backend.api import views
from backend.api.permissions import ProspectAccessAuthorized, PublicProspectAccessAuthorized, PublicConversationAccessAuthorized, \
    LeadLevelAccessAuthorized, DwellAuthorized
from backend.api.serializer import ChatProspectSerializer, ChatConversationSerializer, AgentRequestSerializer
from backend.api.models import ChatConversation, ChatProspect, AgentRequest
from backend.api.tasks import push_object_saved, push_typing
from backend.api.utils import get_pusher_socket_id
from backend.api.views import PropertyLevelViewSet
from .pagination import CustomResultsSetPagination
from .mixin import PusherMixin


class ChatProspectView(PusherMixin, PropertyLevelViewSet):
    serializer_class = ChatProspectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['lead__first_name', 'lead__last_name', 'lead__email', 'lead__phone_number', 'last_visit_page']
    pagination_class = CustomResultsSetPagination

    @action(methods=['POST'], detail=True)
    def read_all(self, request, **kwargs):
        prospect = get_object_or_404(ChatProspect.objects.filter(
            property__in=request.user.properties.all()), pk=kwargs.get('pk')
        )
        prospect.conversations.update(is_read=True, is_shown_in_modal=True)
        serializer = ChatProspectSerializer(prospect)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def send_typing_state(self, request, **kwargs):
        type = request.data.get('type')
        if type:
            if type == 'PROSPECT':
                prospect = get_object_or_404(ChatProspect.objects.filter(external_id=kwargs.get('pk')))
            else:
                prospect = get_object_or_404(ChatProspect.objects.filter(pk=kwargs.get('pk')))
            if prospect and prospect.active_agent:
                agent = prospect.active_agent
                socket_id = get_pusher_socket_id(request)
                push_typing(prospect.id, prospect.external_id, agent.id, request.data.get('is_typing'), type, socket_id)
        return Response(dict(success=True), status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def show_modal_message(self, request, **kwargs):
        prospect = get_object_or_404(ChatProspect.objects.filter(
            property__in=request.user.properties.all()), pk=kwargs.get('pk')
        )
        prospect.conversations.update(is_shown_in_modal=True)
        serializer = ChatProspectSerializer(prospect)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_permissions(self):
        methods = ['create', 'partial_update', 'send_typing_state']
        if self.action in methods and not self.request.user.is_authenticated:
            return PublicProspectAccessAuthorized(),
        return LeadLevelAccessAuthorized(),

    def get_object(self):
        if not self.request.user.is_authenticated:
            return get_object_or_404(self.get_queryset(), external_id=self.request.parser_context['kwargs'].get('pk'))
        return super().get_object()

    def get_queryset(self):
        properties = self.request.GET.getlist('properties[]')
        if not properties:
            properties = [self.request.property.id]
        prospect_ids = ChatConversation.objects.filter(
            property_id__in=properties, prospect__is_in_group=True, created__gte=timezone.now() - timedelta(days=30)
        ).order_by('prospect').distinct().values_list('prospect', flat=True)
        queryset = ChatProspect.objects.filter(pk__in=prospect_ids)
        if getattr(self.request, 'lead', None):
            return queryset.filter(lead=self.request.lead)
        return queryset

    def partial_update(self, request, *args, **kwargs):
        response = super(ChatProspectView, self).partial_update(request, *args, **kwargs)

        prospect = self.get_object()
        socket_id = get_pusher_socket_id(request) if request else None
        push_object_saved.delay(prospect.id, prospect.__class__.__name__, False, socket_id)
        return response


class ChatConversationView(PusherMixin, views.BaseViewSet):
    serializer_class = ChatConversationSerializer
    permission_classes = [ProspectAccessAuthorized]
    queryset = ChatConversation.objects.all()

    def get_queryset(self):
        return ChatConversation.objects.filter(prospect=self.request.prospect).order_by('-date')

    def perform_create(self, serializer):
        return serializer.save(property=self.request.property, prospect=self.request.prospect)

    def perform_update(self, serializer):
        return serializer.save(property=self.request.property, prospect=self.request.prospect)

    def get_permissions(self):
        if self.action in ['create', 'partial_update'] and not self.request.user.is_authenticated:
            return PublicConversationAccessAuthorized(),
        return ProspectAccessAuthorized(),


class AgentRequestView(PusherMixin, views.BaseViewSet):
    serializer_class = AgentRequestSerializer
    permission_classes = [DwellAuthorized]
    queryset = AgentRequest.objects.all()

    def get_queryset(self):
        return AgentRequest.objects.filter(user=self.request.user, property=self.request.property).order_by('-date')
