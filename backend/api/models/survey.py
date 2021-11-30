from django.db import models

from backend.api.models import Competitor, Property
from .base import BaseModel


class Survey(BaseModel):
    CLASS_STUDIO = 'STUDIO'
    CLASS_ONE_BED = 'ONE_BED'
    CLASS_TWO_BED = 'TWO_BED'
    CLASS_THREE_BED = 'THREE_BED'
    CLASS_FOUR_BED = 'FOUR_BED'
    CLASS_ONE_BED_PENTHOUSE = 'ONE_BED_PENTHOUSE'
    CLASS_TWO_BED_PENTHOUSE = 'TWO_BED_PENTHOUSE'
    CLASS_THREE_BED_PENTHOUSE = 'THREE_BED_PENTHOUSE'
    CLASS_CHOICES = ((CLASS_STUDIO, 'Studio'), (CLASS_ONE_BED, '1 bed'), (CLASS_TWO_BED, '2 bed'),
                     (CLASS_THREE_BED, '3 bed'), (CLASS_ONE_BED_PENTHOUSE, '1 bed Penthouse'),
                     (CLASS_TWO_BED_PENTHOUSE, '2 bed Penthouse'), (CLASS_THREE_BED_PENTHOUSE, '3 bed Penthouse'),
                     (CLASS_FOUR_BED, '4 bed'))

    unit_type = models.CharField(max_length=64)
    unit_type_name = models.CharField(max_length=128)
    unit_class = models.CharField(max_length=32, choices=CLASS_CHOICES, blank=False, default=CLASS_STUDIO)
    market_rent = models.FloatField(default=0)
    effective_rent = models.FloatField(default=0)
    concession_amount = models.FloatField(default=0)
    competitor = models.ForeignKey(Competitor, related_name='surveys', on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='surveys', on_delete=models.CASCADE, null=True,
                                 blank=True)
    date = models.DateField(blank=True, null=True)
    is_first = models.BooleanField(default=False)

    class Meta:
        ordering = ('created',)

    def __str__(self):
        return '{} survey for competitor {}'.format(self.date.strftime('%Y-%m-%d'), self.competitor.name)
