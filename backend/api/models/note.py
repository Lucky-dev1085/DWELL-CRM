from django.db import models
from django.conf import settings

from backend.api.models import Property
from .base import BaseModel
from .lead import Lead
from .user import User


class Note(BaseModel):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notes', blank=True, null=True,
                              on_delete=models.SET_NULL)
    lead = models.ForeignKey(Lead, related_name='notes', null=True, on_delete=models.CASCADE)
    text = models.TextField(null=True, blank=True)
    property = models.ForeignKey(Property, related_name='notes', null=True, on_delete=models.SET_NULL)
    mentions = models.ManyToManyField(User, related_name='mentioned_note', blank=True)
    is_follow_up = models.BooleanField(default=False)
    has_shared_lead_link = models.BooleanField(default=False)
    is_auto_generated = models.BooleanField(default=False)
