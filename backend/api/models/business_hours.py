from django.utils import timezone

import pytz
from django.db import models
from simple_history.models import HistoricalRecords

from backend.api.models import Property
from .base import BaseModel


def get_start_time():
    return timezone.now().replace(
        hour=9, minute=0, second=0, microsecond=0, tzinfo=pytz.timezone('America/Phoenix'))


def get_end_time():
    return timezone.now().replace(
        hour=17, minute=30, second=0, microsecond=0, tzinfo=pytz.timezone('America/Phoenix'))


class BusinessHours(BaseModel):
    WEEKDAYS = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    property = models.ForeignKey(Property, related_name='business_hours', null=True, on_delete=models.CASCADE)
    weekday = models.IntegerField(choices=WEEKDAYS, default=0)
    start_time = models.TimeField(null=True, blank=True, default=get_start_time)
    end_time = models.TimeField(null=True, blank=True, default=get_end_time)
    is_workday = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        unique_together = ['property', 'weekday']
        verbose_name_plural = 'Business hours'

    def __str__(self):
        return '{} - {}'.format(self.property, self.weekday)
