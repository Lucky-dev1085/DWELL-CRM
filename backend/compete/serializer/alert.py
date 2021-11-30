from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from backend.compete.models import Alert, AlertLog, AlertLogDetail, AlertUnitRentLog


class AlertUnitRentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertUnitRentLog
        exclude = ['created', 'updated', 'alert_log_detail']


class ThresholdAlertLogDetailSerializer(serializers.ModelSerializer):
    previous_value = serializers.SerializerMethodField()
    new_value = serializers.SerializerMethodField()
    movement = serializers.SerializerMethodField()
    property_name = serializers.CharField(source='property.name')
    is_lease_up_property = serializers.BooleanField(source='property.is_lease_up')
    condition_subject = serializers.CharField(source='alert_log.condition_subject')

    class Meta:
        model = AlertLogDetail
        fields = ['previous_value', 'new_value', 'condition_subject', 'property', 'id', 'property_name',
                  'is_lease_up_property', 'movement']

    @staticmethod
    def get_value(instance, is_previous_value=False):
        alert_log = instance.alert_log
        subject = alert_log.condition_subject.replace('RENT', 'AVERAGE_RENT') \
            .replace('CONCESSION', 'CONCESSION_AMOUNT').lower()
        if is_previous_value:
            baseline = alert_log.baseline.replace('PREVIOUS', 'LAST').lower()
            field = f'{subject}_{baseline}'
        else:
            field = subject
        if alert_log.condition_subject == 'RENT':
            rent_log = instance.alert_unit_rent_logs.first()
            if not rent_log:
                return None
            return getattr(rent_log, field, None)
        else:
            return getattr(instance, field, None)

    def get_previous_value(self, instance):
        return self.get_value(instance, True)

    def get_new_value(self, instance):
        return self.get_value(instance)

    def get_movement(self, instance):
        new_value = self.get_new_value(instance)
        previous_value = self.get_previous_value(instance)
        if new_value and previous_value:
            return new_value - previous_value
        return None


class AlertLogDetailSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name')
    is_lease_up_property = serializers.BooleanField(source='property.is_lease_up')
    average_rent = serializers.SerializerMethodField()
    average_rent_last_4_weeks = serializers.SerializerMethodField()
    average_rent_last_day = serializers.SerializerMethodField()
    average_rent_last_week = serializers.SerializerMethodField()
    average_rent_per_sqft = serializers.SerializerMethodField()
    average_rent_per_sqft_last_4_weeks = serializers.SerializerMethodField()
    average_rent_per_sqft_last_day = serializers.SerializerMethodField()
    average_rent_per_sqft_last_week = serializers.SerializerMethodField()

    class Meta:
        model = AlertLogDetail
        exclude = ['created', 'updated', 'alert_log']

    def get_alert_unit_rent_logs(self, instance):
        unit_type = self.context.get('request').GET.get('unit_type') or 'COMBINED'
        unit_rent_log = instance.alert_unit_rent_logs.filter(unit_type=unit_type).first()
        if not unit_rent_log:
            return {}
        return AlertUnitRentLogSerializer(unit_rent_log).data

    def get_average_rent(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent')

    def get_average_rent_last_4_weeks(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_last_4_weeks')

    def get_average_rent_last_day(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_last_day')

    def get_average_rent_last_week(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_last_week')

    def get_average_rent_per_sqft(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_per_sqft')

    def get_average_rent_per_sqft_last_4_weeks(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_per_sqft_last_4_weeks')

    def get_average_rent_per_sqft_last_day(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_per_sqft_last_day')

    def get_average_rent_per_sqft_last_week(self, instance):
        return self.get_alert_unit_rent_logs(instance).get('average_rent_per_sqft_last_week')


class AlertLogSerializer(serializers.ModelSerializer):
    log_details = AlertLogDetailSerializer(many=True)

    class Meta:
        model = AlertLog
        exclude = ['created', 'updated', 'alert']


class AlertCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[UniqueValidator(queryset=Alert.objects.all())])

    class Meta:
        model = Alert
        fields = ['name', 'type', 'track_assets_mode', 'status', 'properties', 'markets', 'submarkets',
                  'condition_unit_types']


class ThresholdAlertSerializer(AlertCreateSerializer):
    class Meta:
        model = Alert
        fields = AlertCreateSerializer.Meta.fields + \
                 ['baseline', 'condition_subject', 'condition_type', 'condition_value']


class BenchmarkSerializer(AlertCreateSerializer):
    class Meta:
        model = Alert
        fields = AlertCreateSerializer.Meta.fields


class AlertSerializer(serializers.ModelSerializer):
    geo = serializers.SerializerMethodField()
    tracked_assets = serializers.SerializerMethodField()
    last_sent = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        exclude = ['created', 'updated', 'user']

    def get_geo(self, instance):
        if instance.track_assets_mode == Alert.TRACK_ASSETS_IN_MARKETS:
            return instance.markets.values_list('name', flat=True)
        elif instance.track_assets_mode == Alert.TRACK_ASSETS_IN_SUB_MARKETS:
            return instance.submarkets.values_list('name', flat=True)
        else:
            return ['Custom']

    def get_tracked_assets(self, instance):
        return instance.overall_properties.count()

    def get_last_sent(self, instance):
        last_sent_log = instance.logs.order_by('-sent_on').first()
        return last_sent_log.sent_on if last_sent_log else None

    def get_logs(self, instance):
        return instance.logs.order_by('-sent_on').values('sent_on', 'id', 'start', 'end', 'condition_subject',
                                                         'baseline', 'condition_unit_types')


class AlertDetailSerializer(AlertSerializer):
    logs = AlertLogSerializer(many=True)


class AlertSubscriptionSerializer(serializers.ModelSerializer):
    logs = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = ['name', 'logs', 'id']

    def get_logs(self, instance):
        alert_log_ids = AlertLogDetail.objects.filter(
            alert_log__in=instance.logs.all(), property=self.context.get('property')
        ).distinct('alert_log').values_list('alert_log', flat=True)
        return instance.logs.filter(id__in=alert_log_ids).values('sent_on', 'id', 'start', 'end')
