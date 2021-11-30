from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Notification
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import NotificationListSerializer
from backend.api.views import PropertyLevelViewSet


class NotificationView(PropertyLevelViewSet):
    serializer_class = NotificationListSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        dwell_notification_ids = Notification.objects.filter(
            property=self.request.property, user=self.request.user, is_display=True
        ).values_list('id', flat=True)

        compete_notification_ids = Notification.objects.filter(
            user=self.request.user, is_display=True,
            type__in=[Notification.TYPE_BENCHMARK_ALERT, Notification.TYPE_THRESHOLD_ALERT]
        ).values_list('id', flat=True)

        notification_ids = list(dwell_notification_ids) + list(compete_notification_ids)

        return Notification.objects.filter(id__in=notification_ids).order_by('-created')

    @action(methods=['POST'], detail=False)
    def read_all(self, request, **kwargs):
        self.get_queryset().update(is_read=True)
        return Response(dict(success=True), status=201)

    @action(methods=['POST'], detail=False)
    def clear_all(self, request, **kwargs):
        self.get_queryset().update(is_display=False)
        return Response(dict(success=True), status=201)

    @action(methods=['POST'], detail=False)
    def bulk_clear(self, request, **kwargs):
        notifications = self.get_queryset().filter(pk__in=request.data['ids'])
        ids = list(notifications.values_list('id', flat=True))
        notifications.update(is_display=False)
        return Response(dict(success=True, ids=ids), status=201)
