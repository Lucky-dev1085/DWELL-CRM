import pytz
import json

from django.http import HttpResponse
from django.views.generic import UpdateView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication

from backend.api import views
from backend.api.models import Property, EmailLabel, PhoneNumber, Calendar
from backend.api.permissions import PropertyAccessAuthorized, DwellAuthorized, SitePropertyListAuthorized
from backend.api.serializer import PropertySerializer, UnitSerializer, PublicFloorPlanSerializer,\
    PropertyDetailSerializer
from backend.api.views.pagination import CustomResultsSetPagination
from backend.api.form import PropertyForm


class PropertyView(views.BaseViewSet):
    serializer_class = PropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'client_id']
    ordering = ('-created',)
    ordering_fields = ('created',)
    permission_classes = [PropertyAccessAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        user = self.request.user

        return user.properties.filter(user.properties_queryset() & Q(is_deleted=False))

    def list(self, request, *args, **kwargs):
        context = {'request': self.request}
        queryset = self.filter_queryset(self.get_queryset()).order_by('name')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True,  context=context)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True,  context=context)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, permission_classes=[DwellAuthorized])
    def available_units(self, request, **kwargs):
        serializer = UnitSerializer(request.property.units.filter(not_used_for_marketing=False), many=True)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=False, permission_classes=[])
    def status(self, request, **kwargs):
        domain = self.request.META.get('HTTP_X_DOMAIN')
        try:
            property = dict(PropertySerializer(Property.objects.get(domain=domain)).data)
            return Response(
                dict(
                    status=property['status'],
                    name=property['name'],
                    tracking_number=property['tracking_number'],
                    target_number=property['phone_number'],
                    is_released=property['is_released'],
                    bedroom_types=property['bedroom_types']
                ),
                status=200
            )
        except Property.DoesNotExist:
            raise NotFound()

    @action(methods=['GET'], detail=False, permission_classes=[])
    def public_floor_plans(self, request, **kwargs):
        domain = self.request.META.get('HTTP_X_DOMAIN')
        try:
            property = Property.objects.get(domain=domain)
            serializer = PublicFloorPlanSerializer(property.floor_plans.all(), many=True)
            return Response(serializer.data, status=200)
        except Property.DoesNotExist:
            raise NotFound()

    @action(methods=['GET'], detail=False, permission_classes=[DwellAuthorized])
    def current_property(self, request, **kwargs):
        if request.property == 'call-rescores':
            return Response(dict(external_id=request.property, name='Call Rescores'), status=200)
        context = {'request': self.request}
        property = get_object_or_404(self.get_queryset(), pk=request.property.pk)
        serializer = PropertyDetailSerializer(property, context=context)
        return Response(serializer.data, status=200)

    @action(methods=['PUT'], detail=False, permission_classes=[DwellAuthorized])
    def update_nylas_sync_settings(self, request, **kwargs):
        property = Property.objects.get(pk=request.property.pk)
        if request.data.get('nylas_sync_option'):
            property.nylas_sync_option = request.data.get('nylas_sync_option')
        if request.data.get('nylas_status'):
            property.nylas_status = request.data.get('nylas_status')
        if request.data.get('nylas_label'):
            label = EmailLabel.objects.get(pk=request.data.get('nylas_label'))
            if request.data.get('selected'):
                property.nylas_selected_labels.add(label)
            else:
                property.nylas_selected_labels.remove(label)

        if request.data.get('calendar_sync_option'):
            property.calendar_sync_option = request.data.get('calendar_sync_option')
        if request.data.get('nylas_calendar'):
            calendar = Calendar.objects.get(pk=request.data.get('nylas_calendar'))
            if request.data.get('selected_calendar'):
                property.nylas_selected_calendars.add(calendar)
            else:
                property.nylas_selected_calendars.remove(calendar)
        property.save()
        context = {'request': self.request}
        serializer = PropertySerializer(property, context=context)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=False, authentication_classes=[SessionAuthentication],
            permission_classes=[IsAuthenticated, IsAdminUser])
    def filtered_sms_property(self, request, **kwargs):
        # We will filter the property according to the type selected at phone number page from admin panel.
        # If the phone type is tracking than all the properties are to be returned or if the type is SMS than all the
        # properties with no sms tracking number are to be returned. If we are at edit page then the response should
        # have first element as the object's property.
        instance_property = Property.objects.none()
        property = Property.objects.all()
        if 'id' in request.GET:
            instance_property = Property.objects.filter(pk=request.GET['id'])
        if request.GET['type'] == PhoneNumber.TYPE_SMS:
            property = property.exclude(id__in=[id for id in
                                                PhoneNumber.objects.filter(type=PhoneNumber.TYPE_SMS).values_list(
                                                    'property', flat=True)])
        if len(instance_property) > 0 and not instance_property[0].sms_tracking_number:
            property = instance_property.union(property)
        serializer = self.serializer_class(property.order_by('name'), many=True)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=False, permission_classes=[SitePropertyListAuthorized])
    def property_domains(self, request, **kwargs):
        return Response(dict(success=True, domains=Property.objects.all().values_list('domain', flat=True)), status=200)

    @action(methods=['POST'], detail=False, permission_classes=[DwellAuthorized])
    def submit_calls_score_state(self, request, **kwargs):
        from backend.api.tasks.reports.get_reports_data import generate_call_scoring_reports
        generate_call_scoring_reports.delay(
            timezone.now().astimezone(tz=pytz.timezone('America/Phoenix')).date()
        )
        # from backend.api.tasks import send_call_scoring_report_email
        # todo fix incorrect logic & test / disable spam email to support
        # send_call_scoring_report_email.delay()
        return Response(dict(success=True), status=200)


class PropertyAdminView(RetrieveAPIView):
    serializer_class = PropertySerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, IsAdminUser)
    queryset = Property.objects.all()


class PropertyAdminUpdateView(UpdateView):
    model = Property
    template_name = 'ajax_property_update.html'
    form_class = PropertyForm

    def get_success_url(self):
        pass

    def post(self, request, *args, **kwargs):
        super(PropertyAdminUpdateView, self).post(request, **kwargs)
        return HttpResponse(json.dumps({'status': True}), content_type='application/json',
                            status=200)
