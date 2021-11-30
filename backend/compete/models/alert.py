from django.db import models
from django.contrib.postgres.fields import ArrayField
from backend.api.models import BaseModel
from backend.compete.models import Property, Market, Submarket, UnitType
from backend.api.models import User

_property = property


class Alert(BaseModel):
    BENCHMARK = 'BENCHMARK'
    THRESHOLD = 'THRESHOLD'
    ALERT_TYPE_CHOICES = ((BENCHMARK, 'Benchmark'), (THRESHOLD, 'Threshold'))

    PREVIOUS_DAY = 'PREVIOUS_DAY'
    LAST_WEEK = 'LAST_WEEK'
    LAST_4_WEEKS = 'LAST_4_WEEKS'
    BASELINE_CHOICES = (
        (PREVIOUS_DAY, 'Previous Day'), (LAST_WEEK, 'Last Week'), (LAST_4_WEEKS, 'Last 4 Weeks')
    )

    RENT = 'RENT'
    OCCUPANCY = 'OCCUPANCY'
    CONCESSION = 'CONCESSION'
    CONDITION_SUBJECT_CHOICES = (
        (RENT, 'Rent'), (OCCUPANCY, 'Occupancy'), (CONCESSION, 'Concession')
    )

    INCREASES = 'INCREASES'
    DECREASES = 'DECREASES'
    INCREASES_OR_DECREASES = 'INCREASES_OR_DECREASES'
    CONDITION_TYPE_CHOICES = (
        (INCREASES, 'Increases'), (DECREASES, 'Decreases'), (INCREASES_OR_DECREASES, 'Increases or Decreases')
    )

    TRACK_ASSETS_IN_MARKETS = 'ASSETS_IN_MARKETS'
    TRACK_ASSETS_IN_SUB_MARKETS = 'ASSETS_IN_SUB_MARKETS'
    TRACK_CUSTOM_ASSETS = 'CUSTOM_ASSETS'
    TRACK_ASSETS_CHOICES = ((TRACK_ASSETS_IN_MARKETS, 'All assets in markets'),
                            (TRACK_ASSETS_IN_SUB_MARKETS, 'All assets in sub markets'),
                            (TRACK_CUSTOM_ASSETS, 'Custom set of assets'))
    STATUS_CHOICES = (('ACTIVE', 'Active'), ('INACTIVE', 'In active'))

    name = models.CharField(max_length=128)
    type = models.CharField(choices=ALERT_TYPE_CHOICES, default=BENCHMARK, max_length=32)

    baseline = models.CharField(choices=BASELINE_CHOICES, max_length=32, null=True, blank=True)
    condition_subject = models.CharField(choices=CONDITION_SUBJECT_CHOICES, max_length=32, null=True, blank=True)
    condition_type = models.CharField(choices=CONDITION_TYPE_CHOICES, max_length=32, null=True, blank=True)
    condition_value = models.FloatField(null=True, blank=True)
    condition_unit_types = ArrayField(models.CharField(
        choices=UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),), max_length=32, null=True, blank=True
    ), default=list, blank=True)

    track_assets_mode = models.CharField(choices=TRACK_ASSETS_CHOICES, default=TRACK_ASSETS_IN_MARKETS, max_length=32)
    status = models.CharField(choices=STATUS_CHOICES, default='ACTIVE', max_length=16)
    properties = models.ManyToManyField(Property, related_name='alerts', blank=True)
    markets = models.ManyToManyField(Market, related_name='alerts', blank=True)
    submarkets = models.ManyToManyField(Submarket, related_name='alerts', blank=True)
    user = models.ForeignKey(User, related_name='alerts', on_delete=models.CASCADE)

    class Meta:
        unique_together = ['name', 'user']

    def __str__(self):
        return self.name

    @property
    def overall_properties(self):
        if self.track_assets_mode == Alert.TRACK_ASSETS_IN_MARKETS:
            return Property.objects.filter(
                submarket__in=Submarket.objects.filter(market__in=self.markets.all())
            )
        elif self.track_assets_mode == Alert.TRACK_ASSETS_IN_SUB_MARKETS:
            submarkets = self.submarkets.filter(is_mtr_group=False).values_list('id', flat=True)
            mtr_submarkets = Submarket.objects.filter(
                mtr_group__in=self.submarkets.filter(is_mtr_group=True)
            ).values_list('id', flat=True)
            return Property.objects.filter(submarket__in=list(submarkets) + list(mtr_submarkets))
        else:
            return self.properties.all()


class AlertLog(BaseModel):
    alert = models.ForeignKey(Alert, related_name='logs', on_delete=models.CASCADE)
    start = models.DateField(blank=True, null=True)
    end = models.DateField(blank=True, null=True)
    sent_on = models.DateTimeField()
    condition_subject = models.CharField(choices=Alert.CONDITION_SUBJECT_CHOICES, max_length=32, null=True, blank=True)
    baseline = models.CharField(choices=Alert.BASELINE_CHOICES, max_length=32, null=True, blank=True)
    condition_unit_types = ArrayField(models.CharField(
        choices=UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),), max_length=32, null=True, blank=True
    ), default=list)

    def __str__(self):
        return f'{self.alert.name} set on: {str(self.sent_on.date())}'


class AlertLogDetail(BaseModel):
    alert_log = models.ForeignKey(AlertLog, related_name='log_details', on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='alert_log_details', on_delete=models.CASCADE,
                                 null=True, blank=True)

    occupancy = models.FloatField(null=True, blank=True)
    occupancy_last_day = models.FloatField(null=True, blank=True)
    occupancy_last_week = models.FloatField(null=True, blank=True)
    occupancy_last_4_weeks = models.FloatField(null=True, blank=True)

    concession_amount = models.FloatField(null=True, blank=True)
    concession_amount_last_day = models.FloatField(null=True, blank=True)
    concession_amount_last_week = models.FloatField(null=True, blank=True)
    concession_amount_last_4_weeks = models.FloatField(null=True, blank=True)

    concession_avg_rent_percent = models.FloatField(null=True, blank=True)
    concession_avg_rent_percent_last_day = models.FloatField(null=True, blank=True)
    concession_avg_rent_percent_last_week = models.FloatField(null=True, blank=True)
    concession_avg_rent_percent_last_4_weeks = models.FloatField(null=True, blank=True)

    is_offering_concession = models.BooleanField(default=False)


class AlertUnitRentLog(BaseModel):
    alert_log_detail = models.ForeignKey(AlertLogDetail, related_name='alert_unit_rent_logs', on_delete=models.CASCADE)
    unit_type = models.CharField(
        choices=UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),), max_length=32, null=True, blank=True
    )
    average_rent = models.FloatField(null=True, blank=True)
    average_rent_last_day = models.FloatField(null=True, blank=True)
    average_rent_last_week = models.FloatField(null=True, blank=True)
    average_rent_last_4_weeks = models.FloatField(null=True, blank=True)

    average_rent_per_sqft = models.FloatField(null=True, blank=True)
    average_rent_per_sqft_last_day = models.FloatField(null=True, blank=True)
    average_rent_per_sqft_last_week = models.FloatField(null=True, blank=True)
    average_rent_per_sqft_last_4_weeks = models.FloatField(null=True, blank=True)
