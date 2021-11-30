from django.db import models

from .lead import Lead
from .base import BaseModel
from .property import Property


class Conversion(BaseModel):
    APPLY_NOW = 'APPLY_NOW'
    SCHEDULE_A_TOUR = 'SCHEDULE_A_TOUR'
    CONTACT_US = 'CONTACT_US'
    JOIN_WAITLIST = 'JOIN_WAITLIST'
    PHONE_CALL = 'PHONE_CALL'
    TYPE_CHOICES = ((APPLY_NOW, 'Apply Now'), (SCHEDULE_A_TOUR, 'Schedule a tour'), (CONTACT_US, 'Contact Us'),
                    (JOIN_WAITLIST, 'Join Waitlist'), (PHONE_CALL, 'Phone Call'))

    email = models.CharField(max_length=128, blank=True, null=True)
    phone_number = models.CharField(max_length=128, blank=True, null=True)
    first_name = models.CharField(max_length=128, blank=True, null=True)
    last_name = models.CharField(max_length=128, blank=True, null=True)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES, blank=False)
    unit_id = models.CharField(max_length=128, blank=True, null=True)
    current_resident = models.BooleanField(default=False)

    lead = models.ForeignKey(Lead, related_name='leads', null=True, on_delete=models.SET_NULL)
    property = models.ForeignKey(Property, related_name='conversions', null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.email) if self.email else ''
