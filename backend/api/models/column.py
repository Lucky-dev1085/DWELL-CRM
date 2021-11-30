from django.db import models

from backend.api.models import Property
from .base import BaseModel


class Column(BaseModel):
    property = models.ForeignKey(Property, related_name='column', null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255, blank=False)
    position = models.IntegerField(blank=False, null=False)
    is_visible = models.BooleanField(default=True)

    class Meta:
        unique_together = ['property', 'name']
