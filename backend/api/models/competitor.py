from django.db import models

from backend.api.models import Property
from .base import BaseModel


class Competitor(BaseModel):
    name = models.CharField(max_length=128)
    address_line_1 = models.CharField(blank=True, max_length=256)
    address_line_2 = models.CharField(blank=True, max_length=256)
    city = models.CharField(blank=True, max_length=128)
    state = models.CharField(blank=True, max_length=128)
    zip_code = models.CharField(blank=True, max_length=16)
    phone_number = models.CharField(blank=True, max_length=32)
    fax_number = models.CharField(blank=True, max_length=32)
    property = models.ForeignKey(Property, related_name='competitors', on_delete=models.CASCADE, null=True,
                                 blank=True)

    class Meta:
        ordering = ('created',)
        unique_together = ['property', 'name']

    def __str__(self):
        return self.name
