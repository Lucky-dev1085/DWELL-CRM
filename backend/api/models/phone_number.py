from django.db import models
from django.db.models import Q

from .base import BaseModel
from backend.api.models import ProspectSource, Property
from backend.api.twilio_utils import purchase_twilio_number, twilio_release_number


class PhoneNumber(BaseModel):
    TYPE_SMS = 'SMS'
    TYPE_TRACKING = 'TRACKING'
    TYPE_CHOICES = ((TYPE_SMS, 'SMS'), (TYPE_TRACKING, 'Tracking'))

    property = models.ForeignKey(Property, related_name='phone_numbers', on_delete=models.CASCADE, null=True)
    phone_number = models.CharField(max_length=32, blank=True, null=True)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default=TYPE_TRACKING)
    source = models.ForeignKey(ProspectSource, related_name='phone_numbers', null=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    twilio_sid = models.CharField(max_length=64, null=True, blank=True)

    def __str__(self):
        return self.phone_number

    def save(self, **kwargs):
        old_phone_number = None
        if not PhoneNumber.objects.filter(pk=self.pk).filter(Q(twilio_sid=None) | Q(phone_number=self.phone_number)):
            # We will purchase the twilio phone number if phone number is changed or twilio sid is not set
            # (for the case previous save was failed accidentally)
            if self.type == PhoneNumber.TYPE_SMS:
                friendly_name = f'SMS number for {self.property.name}'
                is_sms_number = True
            else:
                friendly_name = f'Tracking number for {self.property.name} on {self.source.name}'
                is_sms_number = False
            phone_number = purchase_twilio_number(self.phone_number, is_sms_number, friendly_name)
            if phone_number:
                if old_phone_number:
                    twilio_release_number(old_phone_number.twilio_sid)
                self.twilio_sid = phone_number.sid
        super(PhoneNumber, self).save(kwargs)
