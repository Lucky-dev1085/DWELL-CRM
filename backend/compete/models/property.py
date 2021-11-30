from django.db import models
from django.contrib.postgres.fields import ArrayField
from backend.api.utils import hyphens
from backend.api.models import BaseModel, Property as DwellProperty
from .portfolio import Submarket

_property = property


class Property(BaseModel):
    TYPE_GARDEN_STYLE = 'GARDEN_STYLE'
    TYPE_SFR = 'SFR'
    TYPE_MID_RISE = 'MID_RISE'
    TYPE_HIGH_RISE = 'HIGH_RISE'
    TYPE_CHOICES = (
        (TYPE_GARDEN_STYLE, 'Garden Style'), (TYPE_SFR, 'SFR'),
        (TYPE_MID_RISE, 'Mid-Rise'), (TYPE_HIGH_RISE, 'High-Rise')
    )

    property = models.OneToOneField(
        DwellProperty, related_name='compete_property', null=True, blank=True, on_delete=models.SET_NULL,
        verbose_name='Dwell Property'
    )
    name = models.CharField(max_length=128, unique=True)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, blank=True, null=True)
    s3_name = models.CharField(max_length=128, null=True, blank=True)
    external_id = models.CharField(max_length=128, null=True, blank=True)
    address = models.CharField(max_length=512, null=True, blank=True)
    phone_number = models.CharField(max_length=512, null=True, blank=True)
    website = models.CharField(max_length=512, null=True, blank=True)
    units_count = models.IntegerField(null=True, blank=True)
    completed_units_count = models.IntegerField(null=True, blank=True)
    concession_description = models.CharField(max_length=512, null=True, blank=True)
    concession_amount = models.FloatField(null=True, blank=True)
    amenities = ArrayField(models.CharField(max_length=256, null=True, blank=True), default=list)
    communities = ArrayField(models.CharField(max_length=256, null=True, blank=True), default=list)
    competitors = models.ManyToManyField(
        'compete.Property', related_name='reserved_competitors'
    )
    submarket = models.ForeignKey(
        Submarket, related_name='properties', on_delete=models.SET_NULL, null=True, blank=True
    )
    mt_submarket = models.ForeignKey(
        Submarket, related_name='mt_properties', on_delete=models.SET_NULL, null=True, blank=True
    )
    average_rent = models.FloatField(null=True, blank=True)
    average_rent_per_sqft = models.FloatField(null=True, blank=True)
    occupancy = models.FloatField(null=True, blank=True)
    is_lease_up = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @_property
    def concession_avg_rent_percent(self):
        unit_rent_report = self.unit_rent_reports.filter(unit_type='COMBINED').order_by('-report__date').first()
        if unit_rent_report:
            combined_average_rent = unit_rent_report.blended_rent
        else:
            combined_average_rent = None
        return round(self.concession_amount / (12 * combined_average_rent) * 100, 2) \
            if self.concession_amount and combined_average_rent else None

    def save(self, *args, **kwargs):
        if not self.external_id:
            self.external_id = hyphens(self.name)

        super(Property, self).save(*args, **kwargs)


class UnitType(BaseModel):
    STUDIO = 'STUDIO'
    ONE_BEDROOM = 'ONE_BEDROOM'
    TWO_BEDROOM = 'TWO_BEDROOM'
    THREE_BEDROOM = 'THREE_BEDROOM'
    FOUR_BEDROOM = 'FOUR_BEDROOM'
    FIVE_BEDROOM = 'FIVE_BEDROOM'
    UNIT_TYPE_CHOICES = (
        (STUDIO, 'Studio'), (ONE_BEDROOM, '1 bedroom'), (TWO_BEDROOM, '2 bedroom'),
        (THREE_BEDROOM, '3 bedroom'), (FOUR_BEDROOM, '4 bedroom'), (FIVE_BEDROOM, '5 bedroom'),
    )

    property = models.ForeignKey(Property, related_name='unit_types', on_delete=models.CASCADE)
    beds = models.FloatField(null=True, blank=True)
    baths = models.FloatField(null=True, blank=True)
    average_rent = models.FloatField(null=True, blank=True)
    average_size = models.FloatField(null=True, blank=True)
    units_count = models.IntegerField(null=True, blank=True)
    name = models.CharField(choices=UNIT_TYPE_CHOICES, default=ONE_BEDROOM, max_length=16)

    def __str__(self):
        return self.name

    @_property
    def market_units(self):
        return self.units.filter(on_market=True)


class Unit(BaseModel):
    property = models.ForeignKey(Property, related_name='units', on_delete=models.CASCADE)
    unit_type = models.ForeignKey(UnitType, related_name='units', on_delete=models.CASCADE, null=True, blank=True)
    number = models.CharField(max_length=64, null=True, blank=True)
    floor_plan_name = models.CharField(max_length=128, null=True, blank=True)
    beds = models.FloatField(null=True, blank=True)
    baths = models.FloatField(null=True, blank=True)
    unit_size = models.FloatField(null=True, blank=True)
    rent = models.FloatField(null=True, blank=True)
    available_date = models.DateField(null=True, blank=True)
    on_market = models.BooleanField(default=True)

    class Meta:
        unique_together = ['property', 'number']

    def __str__(self):
        return str(self.number)

    @_property
    def avg_rent_per_sqft(self):
        return round(self.rent / self.unit_size, 2) if self.rent and self.unit_size else None


class UnitSession(BaseModel):
    property = models.ForeignKey(Property, related_name='unit_sessions', on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, related_name='unit_sessions', on_delete=models.CASCADE)
    start_listing_date = models.DateField()
    end_listing_date = models.DateField(null=True, blank=True)
