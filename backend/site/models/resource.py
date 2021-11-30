from django.contrib.postgres.fields import ArrayField
from django.db import models

from backend.api.models import BaseModel, Property


class Resource(BaseModel):
    WEB_ASSETS = 'WEB_ASSETS'
    COMMUNICATION = 'COMMUNICATION'
    MARKETING = 'MARKETING'
    GUIDES = 'GUIDES'
    CALENDAR = 'CALENDAR'

    SECTION_CHOICES = ((WEB_ASSETS, 'WEB_ASSETS'), (COMMUNICATION, 'COMMUNICATION'), (MARKETING, 'MARKETING'),
                       (GUIDES, 'GUIDES'), (CALENDAR, 'CALENDAR'))

    property = models.ForeignKey(Property, related_name='resource', on_delete=models.CASCADE)
    section = models.CharField(max_length=32, choices=SECTION_CHOICES)
    values = ArrayField(models.JSONField(), default=list)

    def __str__(self):
        return self.property.domain
