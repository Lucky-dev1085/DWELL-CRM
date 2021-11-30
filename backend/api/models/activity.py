from django.db import models
from django.conf import settings
from .base import BaseModel
from .lead import Lead, Property
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Activity(BaseModel):
    LEAD_CREATED = 'LEAD_CREATED'
    TASK_CREATED = 'TASK_CREATED'
    TOUR_CREATED = 'TOUR_CREATED'
    TOUR_UPDATED = 'TOUR_UPDATED'
    TOUR_CANCELLED = 'TOUR_CANCELLED'
    NOTE_CREATED = 'NOTE_CREATED'
    EMAIL_CREATED = 'EMAIL_CREATED'
    LEAD_UPDATED = 'LEAD_UPDATED'
    TASK_COMPLETED = 'TASK_COMPLETED'
    TOUR_COMPLETED = 'TOUR_COMPLETED'
    LEAD_SHARED = 'LEAD_SHARED'
    # todo SMS_CREATED, LEAD_CHAT_HOBBES, EMAIL_CREATED activity can be removed
    LEAD_CHAT_HOBBES = 'LEAD_CHAT_HOBBES'
    SMS_CREATED = 'SMS_CREATED'
    TASK_UPDATED = 'TASK_UPDATED'
    TASK_DELETED = 'TASK_DELETED'
    LEAD_MERGED = 'LEAD_MERGED'
    ROOMMATE_CREATED = 'ROOMMATE_CREATED'
    ROOMMATE_UPDATED = 'ROOMMATE_UPDATED'
    ROOMMATE_DELETED = 'ROOMMATE_DELETED'

    TYPE_CHOICES = (
        (LEAD_CREATED, 'Lead created'),
        (TASK_CREATED, 'Task created'),
        (NOTE_CREATED, 'Note created'),
        (EMAIL_CREATED, 'Email created'),
        (LEAD_UPDATED, 'Lead updated'),
        (TASK_COMPLETED, 'Task completed'),
        (TOUR_CREATED, 'Tour created'),
        (TOUR_UPDATED, 'Tour updated'),
        (TOUR_CANCELLED, 'Tour cancelled'),
        (LEAD_SHARED, 'Lead shared'),
        (LEAD_CHAT_HOBBES, 'Chat with Hobbes'),
        (SMS_CREATED, 'SMS created'),
        (TASK_UPDATED, 'Task updated'),
        (TASK_DELETED, 'Task deleted'),
        (LEAD_MERGED, 'Lead merged'),
        (ROOMMATE_CREATED, 'Roommate created'),
        (ROOMMATE_UPDATED, 'Roommate updated'),
        (ROOMMATE_DELETED, 'Roommate deleted')
    )

    content = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='activities', blank=True, null=True,
                                on_delete=models.SET_NULL)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    lead = models.ForeignKey(Lead, related_name='activities', null=True, on_delete=models.CASCADE)

    object_content_type = models.ForeignKey(
        ContentType, related_name='object', blank=True, null=True, db_index=True, on_delete=models.PROTECT
    )
    object_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    # TODO should think about adding GenericRelation in the future
    object = GenericForeignKey('object_content_type', 'object_id')

    property = models.ForeignKey(Property, related_name='activities', null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name_plural = 'Activities'

    def __str__(self):
        return self.type
