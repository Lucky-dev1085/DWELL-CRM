from django.db import models

from backend.api.models import BaseModel
from backend.site.models import PageData


class StatusItem(BaseModel):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    SECOND_CHOICE = 'SECOND_CHOICE'
    IMPORTANCE_CHOICES = ((LOW, 'Low'), (MEDIUM, 'Medium'), (HIGH, 'High'))

    value = models.IntegerField()
    element = models.CharField(max_length=64)
    hint_text = models.CharField(max_length=64, blank=True, null=True)
    section = models.CharField(max_length=32, choices=PageData.SECTION_CHOICES)
    importance = models.CharField(max_length=32, choices=IMPORTANCE_CHOICES, default=LOW)
    visible_to_visitor = models.BooleanField()

    def __str__(self):
        return str(self.value)
