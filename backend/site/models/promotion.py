from django.db import models
from django.contrib.postgres.fields import ArrayField

from backend.api.models import BaseModel, Property, FloorPlan
from backend.compete.models import UnitType


class Promotion(BaseModel):
    LESS_THAN = 'Less than'
    MORE_THAN = 'More than'
    EXACT = 'Exactly'
    ALL = 'All months'
    LEASE_DURATION_MODIFIER_OPTIONS = [
        (EXACT, 'Exactly'),
        (MORE_THAN, 'More than'),
        (LESS_THAN, 'Less than'),
        (ALL, 'All months'),
    ]

    property = models.ForeignKey(Property, related_name='promotion', on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    promotion_text = models.TextField()
    promotion_title = models.CharField(max_length=64, default='Exclusive Offer')
    promotion_html = models.CharField(max_length=512)
    restriction = models.TextField(null=True, blank=True)
    button_label = models.CharField(max_length=64, default='Select A Unit')
    is_active = models.BooleanField(default=False)
    image = models.CharField(max_length=256)
    seo_title = models.CharField(max_length=256, blank=True, null=True)
    seo_description = models.CharField(max_length=512, blank=True, null=True)
    floor_plans = models.ManyToManyField(FloorPlan, related_name='promotions', blank=True)
    dollar_value = models.IntegerField(blank=True, null=True)
    lease_duration_modifier = models.CharField(
        max_length=20,
        choices=LEASE_DURATION_MODIFIER_OPTIONS,
        default=MORE_THAN
    )
    lease_duration = models.IntegerField(default=12)
    unit_types = ArrayField(
        models.CharField(max_length=128, choices=UnitType.UNIT_TYPE_CHOICES), default=list
    )

    def __str__(self):
        return self.property.domain

    def save(self, **kwargs):
        super(Promotion, self).save(kwargs)
        if self.is_active:
            self.property.promotion.exclude(pk=self.pk).update(is_active=False)
