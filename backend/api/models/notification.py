from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from backend.api.models import Property, Lead
from backend.compete.models import AlertLog
from .base import BaseModel
from .user import User

property_decorator = property


class Notification(BaseModel):
    TYPE_NEW_LEAD = 'NEW_LEAD'
    TYPE_NEW_TASK = 'NEW_TASK'
    TYPE_OVERDUE_TASK = 'OVERDUE_TASK'
    TYPE_TASK_DUE_TODAY = 'TASK_DUE_TODAY'
    TYPE_TEAM_MENTION = 'TEAM_MENTION'
    TYPE_EMAIL_BLAST_COMPLETED = 'EMAIL_BLAST_COMPLETED'
    TYPE_NEW_CALL = 'NEW_CALL'
    TYPE_NEW_SMS = 'NEW_SMS'
    TYPE_NEW_AGENT_REQUEST = 'NEW_AGENT_REQUEST'
    TYPE_BENCHMARK_ALERT = 'BENCHMARK_ALERT'
    TYPE_THRESHOLD_ALERT = 'THRESHOLD_ALERT'
    TYPE_CHOICES = ((TYPE_NEW_LEAD, 'New Lead'), (TYPE_NEW_TASK, 'New Task'), (TYPE_OVERDUE_TASK, 'Overdue Task'),
                    (TYPE_TASK_DUE_TODAY, 'Task due today'), (TYPE_TEAM_MENTION, 'Team Mention'),
                    (TYPE_EMAIL_BLAST_COMPLETED, 'Email blast completed'), (TYPE_NEW_CALL, 'New call recording'),
                    (TYPE_NEW_SMS, 'New incoming SMS'), (TYPE_NEW_AGENT_REQUEST, 'New agent request'),
                    (TYPE_BENCHMARK_ALERT, 'Benchmark Alert'), (TYPE_THRESHOLD_ALERT, 'Threshold Alert'),)

    user = models.ForeignKey(User, related_name='notifications', blank=True, null=True,
                             on_delete=models.SET_NULL)
    content = models.CharField(max_length=1024, null=True)
    property = models.ForeignKey(Property, related_name='notifications', null=True, on_delete=models.SET_NULL)
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    is_display = models.BooleanField(default=True)
    object_content_type = models.ForeignKey(
        ContentType, related_name='notification_object', blank=True, null=True, db_index=True, on_delete=models.PROTECT
    )
    object_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    object = GenericForeignKey('object_content_type', 'object_id')

    @property_decorator
    def redirect_url(self):
        if not self.object:
            return None
        if isinstance(self.object, Lead):
            return '/{}/leads/{}'.format(self.property.external_id, self.object.id)
        elif isinstance(self.object, AlertLog):
            alert_log = self.object
            return '/compete/alerts/{}/{}'.format(alert_log.alert.id, alert_log.id)
        else:
            if not self.object.lead:
                return None
            else:
                return '/{}/leads/{}'.format(self.property.external_id, self.object.lead.id)
