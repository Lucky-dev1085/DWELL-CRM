from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta

from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Task, Lead, Activity
from backend.api.permissions import LeadLevelAccessAuthorized, PublicTourAccessAuthorized
from backend.api.serializer import TaskDetailSerializer, TourDetailSerializer, TaskListSerializer, \
    PublicTourDetailSerializer
from backend.api.tasks.check_tasks_due_date import check_task_due_date
from backend.api.views import LeadLevelViewSet, BaseViewSet
from backend.api.views.mixin import PusherMixin
from backend.api.views.pagination import CustomResultsSetPagination
from backend.api.views.notification_creation import task_notification


class TaskView(PusherMixin, LeadLevelViewSet):
    serializer_class = TaskListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    permission_classes = [LeadLevelAccessAuthorized]
    pagination_class = CustomResultsSetPagination
    queryset = Task.objects.all()

    def get_queryset(self):
        queryset = super(TaskView, self).get_queryset()
        if self.detail:
            return queryset
        ids = queryset.filter(
            is_cancelled=False, created__gte=timezone.now() - timedelta(days=30)
        ).order_by('-created').values_list('id', flat=True)
        return Task.objects.filter(
            Q(pk__in=ids),
            ~Q(lead__status__in=[Lead.LEAD_TEST, Lead.LEAD_DELETED, Lead.LEAD_LOST])).order_by('-created')

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        tour_type = self.request.data.get('type') \
            if self.request.data.get('type') and self.action == 'create' else self.get_object().type
        return TourDetailSerializer if tour_type in [Task.TYPE_TOUR,
                                                     Task.TYPE_VIRTUAL_TOUR,
                                                     Task.TYPE_GUIDED_VIRTUAL_TOUR,
                                                     Task.TYPE_IN_PERSON,
                                                     Task.TYPE_FACETIME,
                                                     Task.TYPE_SELF_GUIDED_TOUR] else TaskDetailSerializer

    @action(methods=['GET'], detail=False)
    def test_task_overdue_notification(self, request, **kwargs):
        task = Task.objects.filter(id=self.request.query_params.get('id')).first()
        if task:
            check_task_due_date(task)
        return Response(dict(success=True), status=status.HTTP_200_OK)

    def destroy(self, *args, **kwargs):
        instance = self.get_object()
        Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.TASK_DELETED,
                                content=instance.title, creator=instance.actor,
                                object=instance)
        return super().destroy(*args, **kwargs)


class PublicTourView(PusherMixin, BaseViewSet):
    serializer_class = PublicTourDetailSerializer
    permission_classes = [PublicTourAccessAuthorized]

    def get_queryset(self):
        return Task.objects.filter(type__in=Task.TOUR_TYPES.keys(), vendor=self.request.vendor, lead=self.request.lead)

    def perform_create(self, serializer):
        property = self.request.property
        owner = None
        tour_date = serializer.validated_data['tour_date']
        if hasattr(property, 'assign_lead_owner') and property.assign_lead_owner.is_enabled:
            date = tour_date if tour_date else timezone.now()
            weekday = date.astimezone(tz=property.timezone).strftime('%A').lower()
            owner = getattr(property.assign_lead_owner, weekday, None)

        instance = serializer.save(
            property=self.request.property, lead=self.request.lead, vendor=self.request.vendor, owner=owner
        )

        if isinstance(instance, Task):
            task_notification(self.request, instance)

    def perform_update(self, serializer):
        old_task = Task.objects.filter(pk=self.kwargs.get('pk')).first()
        instance = serializer.save(property=self.request.property, lead=self.request.lead, vendor=self.request.vendor)

        if isinstance(instance, Task):
            task_notification(self.request, instance, old_task)
