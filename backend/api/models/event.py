from django.db import models

from backend.api.models import Property, Calendar, Task, DemoTour
from .base import BaseModel


class Event(BaseModel):
    external_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(null=True, blank=True)
    time = models.DateTimeField(blank=True, null=True)
    owner = models.CharField(max_length=255, blank=True, null=True)
    participants = models.JSONField(default=list, null=True, blank=True)
    status = models.CharField(max_length=16, blank=True)
    property = models.ForeignKey(Property, related_name='events', on_delete=models.CASCADE, null=True)
    calendar = models.ForeignKey(Calendar, related_name='events', on_delete=models.CASCADE, null=True)
    tour = models.ForeignKey(Task, related_name='events', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.title


class DemoEvent(BaseModel):
    external_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(null=True, blank=True)
    time = models.DateTimeField(blank=True, null=True)
    owner = models.CharField(max_length=255, blank=True, null=True)
    participants = models.JSONField(default=list, null=True, blank=True)
    status = models.CharField(max_length=16, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    demo = models.OneToOneField(DemoTour, related_name='event', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.title
