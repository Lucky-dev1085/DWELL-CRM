from django.db import models

from .base import BaseModel


class Holiday(BaseModel):
    date = models.DateField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name
