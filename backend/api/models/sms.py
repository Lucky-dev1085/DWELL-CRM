from django.db import models

from .base import BaseModel
from backend.api.models import Lead, Property, User
from backend.api.utils import is_same_phone_number

_property = property


class SMSContent(BaseModel):
    STATUS_ACCEPTED = 'accepted'
    STATUS_QUEUED = 'queued'
    STATUS_SENDING = 'sending'
    STATUS_SENT = 'sent'
    STATUS_FAILED = 'failed'
    STATUS_DELIVERED = 'delivered'
    STATUS_UNDELIVERED = 'undelivered'
    STATUS_RECEIVING = 'receiving'
    STATUS_RECEIVED = 'received'
    STATUS_READ = 'read'
    STATUS_CHOICES = (
        (STATUS_ACCEPTED, 'Accepted'), (STATUS_QUEUED, 'Queued'), (STATUS_SENDING, 'Sending'), (STATUS_SENT, 'Sent'),
        (STATUS_FAILED, 'Failed'), (STATUS_DELIVERED, 'Delivered'), (STATUS_UNDELIVERED, 'Un Delivered'),
        (STATUS_RECEIVING, 'Receiving'), (STATUS_RECEIVED, 'Received'), (STATUS_READ, 'Read'))

    lead = models.ForeignKey(Lead, related_name='sms', null=True, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='sms', null=True, on_delete=models.CASCADE)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    message = models.TextField()
    sender_number = models.CharField(max_length=32, blank=True, null=True)
    receiver_number = models.CharField(max_length=32, blank=True, null=True)
    agent = models.ForeignKey(User, related_name='sms_contents', null=True, blank=True, on_delete=models.SET_NULL)
    twilio_sid = models.CharField(max_length=64, null=True, blank=True)
    date = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return self.lead.first_name if self.lead else self.receiver_number

    @_property
    def is_team_message(self):
        return True if is_same_phone_number(self.property.sms_tracking_number, self.sender_number) else False
