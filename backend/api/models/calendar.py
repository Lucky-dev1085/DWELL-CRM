from django.db import models

from backend.api.models import Property
from .base import BaseModel


class Calendar(BaseModel):
    external_id = models.CharField(max_length=64)
    name = models.CharField(max_length=128)
    property = models.ForeignKey(Property, related_name='calendars', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
