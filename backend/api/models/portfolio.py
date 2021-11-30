from django.db import models

from backend.api.models import Property
from .base import BaseModel


class Portfolio(BaseModel):
    TYPE_MARK_TAYLOR = 'MARK_TAYLOR'
    TYPE_ASSET_MANAGER = 'ASSET_MANAGER'
    TYPE_SUBMARKET = 'SUBMARKET'
    TYPE_CHOICES = ((TYPE_MARK_TAYLOR, 'Mark Taylor'), (TYPE_ASSET_MANAGER, 'Asset Manager'),
                    (TYPE_SUBMARKET, 'Submarket'))

    name = models.CharField(max_length=128)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    properties = models.ManyToManyField(Property, related_name='portfolios', blank=False)

    def __str__(self):
        return self.name
