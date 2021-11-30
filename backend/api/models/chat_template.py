from django.db import models
from backend.api.models import Property
from .base import BaseModel
from django.contrib.postgres.fields import ArrayField


class ChatTemplate(BaseModel):
    VARIABLE_CHOICES = {
        'lead_full_name': 'Lead full name',
        'lead_first_name': 'Lead first name',
        'lead_owner': 'Lead owner',
        'property_address': 'Property address',
        'property_name': 'Property name',
        'property_phone_number': 'Property phone number',
        'property_website': 'Property website',
        'tour_time': 'Tour time',
        'property_website_link': 'Property website link',
        'virtual_tour_link': 'Virtual tour link',
    }

    name = models.CharField(max_length=128)
    text = models.TextField(max_length=8192, null=True, blank=True)
    property = models.ForeignKey(Property, related_name='chats_templates', null=True, on_delete=models.SET_NULL)
    variables = ArrayField(models.CharField(max_length=128, blank=True), null=True, blank=True)

    class Meta:
        unique_together = ['property', 'name']

    def __str__(self):
        return self.name
