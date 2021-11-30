from django.contrib.postgres.fields import ArrayField
from django.db import models

from backend.api.models import Lead, Property
from .base import BaseModel


class EmailLabel(BaseModel):
    external_id = models.CharField(max_length=64)
    name = models.CharField(max_length=128)
    property = models.ForeignKey(Property, related_name='email_labels', on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class EmailMessage(BaseModel):
    nylas_message_id = models.CharField(max_length=255, unique=True)
    property = models.ForeignKey(Property, related_name='email_messages', on_delete=models.CASCADE, null=True)
    subject = models.CharField(max_length=255, blank=True)
    sender_name = models.CharField(max_length=255, blank=True)
    sender_email = models.CharField(max_length=255, blank=True)
    receiver_name = models.CharField(max_length=255, blank=True)
    receiver_email = models.CharField(max_length=255, blank=True)
    snippet = models.CharField(max_length=255, blank=True)
    body = models.TextField(null=True, blank=True)
    date = models.DateTimeField(blank=True, null=True)
    labels = models.ManyToManyField(EmailLabel, related_name='email_messages')
    is_unread = models.BooleanField(default=True)
    lead = models.ForeignKey(Lead, related_name='email_messages', null=True, blank=True, on_delete=models.SET_NULL)
    is_replied_to = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_guest_card_email = models.BooleanField(default=False)
    cc = ArrayField(models.CharField(max_length=255, blank=True), null=True, blank=True)

    def __str__(self):
        return self.subject


class EmailAttachment(BaseModel):
    external_id = models.CharField(max_length=64)
    attachment = models.FileField(upload_to='email_attachments', max_length=255)
    name = models.CharField(max_length=255, default='attachment', null=True, blank=True)
    size = models.IntegerField(default=0)
    content_type = models.CharField(max_length=255, default='image/jpeg')
    email_message = models.ForeignKey(EmailMessage, related_name='attachments', on_delete=models.CASCADE)
