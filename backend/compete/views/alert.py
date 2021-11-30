from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import ListModelMixin, DestroyModelMixin
from backend.compete.serializer import AlertSerializer, AlertLogDetailSerializer, ThresholdAlertSerializer, \
    BenchmarkSerializer, ThresholdAlertLogDetailSerializer, AlertLogSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from backend.compete.models import Alert, AlertLog, AlertUnitRentLog
from .mixin import SortableListModelMixin


class AlertView(SortableListModelMixin, ModelViewSet):
    serializer_class = AlertSerializer
    manual_ordering_fields = ['geo', 'tracked_assets', 'last_sent']

    def get_serializer_class(self):
        if self.action == 'create':
            if self.request.data.get('type') == Alert.THRESHOLD:
                return ThresholdAlertSerializer
            elif self.request.data.get('type') == Alert.BENCHMARK:
                return BenchmarkSerializer
            else:
                raise ValidationError('The given type is invalid.')
        return AlertSerializer

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user).order_by('-created')

    def perform_create(self, serializer, **kwargs):
        serializer.save(user=self.request.user)


class AlertLogView(ListModelMixin, DestroyModelMixin, GenericViewSet, SortableListModelMixin):
    serializer_class = AlertLogSerializer

    def get_queryset(self):
        return AlertLog.objects.filter(alert__user=self.request.user)


class AlertLogDetailsView(SortableListModelMixin, DestroyModelMixin, GenericViewSet):
    manual_ordering_fields = ['property_name', 'previous_value', 'new_value', 'movement', 'average_rent',
                              'average_rent_last_4_weeks', 'average_rent_last_day', 'average_rent_last_week',
                              'average_rent_per_sqft', 'average_rent_per_sqft_last_4_weeks',
                              'average_rent_per_sqft_last_day', 'average_rent_per_sqft_last_week']

    def get_queryset(self):
        alert_log = get_object_or_404(
            AlertLog.objects.filter(alert__user=self.request.user), pk=self.kwargs.get('alert_log_pk')
        )
        unit_type = self.request.GET.get('unit_type')
        if unit_type:
            if unit_type == 'COMBINED':
                unit_type = None
            all_ids = alert_log.log_details.values_list('id', flat=True)
            filtered_ids = AlertUnitRentLog.objects.filter(alert_log_detail__in=all_ids, unit_type=unit_type) \
                .values_list('alert_log_detail', flat=True)
            return alert_log.log_details.filter(id__in=filtered_ids)
        return alert_log.log_details.all()

    def get_serializer_class(self):
        alert_log = get_object_or_404(AlertLog.objects.all(), pk=self.kwargs.get('alert_log_pk'))
        if alert_log.alert.type == Alert.THRESHOLD:
            return ThresholdAlertLogDetailSerializer
        else:
            return AlertLogDetailSerializer

    def get_serializer_context(self):
        context = super(AlertLogDetailsView, self).get_serializer_context()
        context.update({'request': self.request})
        return context
