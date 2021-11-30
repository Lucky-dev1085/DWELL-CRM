from django.db import models
from backend.api.models import Property
from .base import BaseModel
from django.contrib.postgres.fields import ArrayField


class EmailTemplate(BaseModel):
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

    TOUR_CONFIRMATION = 'TOUR_CONFIRMATION'
    IN_PERSON_TOUR_CONFIRMATION = 'IN_PERSON_TOUR_CONFIRMATION'
    FACETIME_TOUR_CONFIRMATION = 'FACETIME_TOUR_CONFIRMATION'
    SELF_GUIDED_TOUR_CONFIRMATION = 'SELF_GUIDED_TOUR_CONFIRMATION'
    GUIDED_VIRTUAL_TOUR_CONFIRMATION = 'GUIDED_VIRTUAL_TOUR_CONFIRMATION'
    FIRST_FOLLOWUP = 'FIRST_FOLLOWUP'
    SECOND_FOLLOWUP = 'SECOND_FOLLOWUP'
    THIRD_FOLLOWUP = 'THIRD_FOLLOWUP'
    FINAL_FOLLOWUP = 'FINAL_FOLLOWUP'
    RECEIVED_APPLICATION = 'RECEIVED_APPLICATION'
    GENERIC = 'GENERIC'
    NEW_PROSPECT_WELCOME = 'NEW_PROSPECT_WELCOME'
    TYPE_CHOICES = ((TOUR_CONFIRMATION, 'Tour Confirmation'), (GENERIC, 'Generic'),
                    (FIRST_FOLLOWUP, 'First Followup'), (SECOND_FOLLOWUP, 'Second Followup'),
                    (THIRD_FOLLOWUP, 'Third Followup'), (FINAL_FOLLOWUP, 'Final Followup'),
                    (RECEIVED_APPLICATION, 'Received Application'),
                    (IN_PERSON_TOUR_CONFIRMATION, 'In-Person Tour Confirmation'),
                    (FACETIME_TOUR_CONFIRMATION, 'Facetime Tour Confirmation'),
                    (SELF_GUIDED_TOUR_CONFIRMATION, 'Self-Guided Tour Confirmation'),
                    (GUIDED_VIRTUAL_TOUR_CONFIRMATION, 'Guided Virtual Tour Confirmation'),
                    (NEW_PROSPECT_WELCOME, 'New Prospect Welcome Email'))

    name = models.CharField(max_length=128)
    subject = models.CharField(max_length=512)
    text = models.TextField(null=True, blank=True)
    property = models.ForeignKey(Property, related_name='email_templates', null=True, on_delete=models.SET_NULL)
    variables = ArrayField(models.CharField(max_length=128, blank=True), null=True, blank=True)
    subject_variables = ArrayField(models.CharField(max_length=128, blank=True), null=True, blank=True)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, default=GENERIC)

    class Meta:
        unique_together = ['property', 'name']

    def __str__(self):
        return self.name
