from django.db import models
from backend.api.models import BaseModel
from .property import Property, UnitType


class Report(BaseModel):
    property = models.ForeignKey(Property, related_name='reports', on_delete=models.CASCADE)
    occupancy = models.FloatField(null=True, blank=True)
    available_units = models.IntegerField(null=True, blank=True)
    total_units = models.IntegerField(null=True, blank=True)
    concession = models.FloatField(null=True, blank=True)
    concession_avg_rent_percent = models.FloatField(null=True, blank=True)
    date = models.DateField()

    def __str__(self):
        return f'{self.property.name} - {self.date}'


class UnitRentReport(BaseModel):
    property = models.ForeignKey(Property, related_name='unit_rent_reports', on_delete=models.CASCADE)
    report = models.ForeignKey(Report, related_name='unit_rent_reports', on_delete=models.CASCADE)
    unit_type = models.CharField(
        choices=UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'), ), max_length=32
    )
    rent_sum = models.FloatField(null=True, blank=True)
    sqft_sum = models.FloatField(null=True, blank=True)
    units_count = models.FloatField(null=True, blank=True)
    min_rent = models.FloatField(null=True, blank=True)
    max_rent = models.FloatField(null=True, blank=True)
    blended_rent = models.FloatField(null=True, blank=True)
