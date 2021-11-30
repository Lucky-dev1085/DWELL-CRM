import uuid

from django.db import models, transaction
from datetime import datetime, timedelta
from django.db.models import Q

from backend.api.models import Property, User
from .base import BaseModel
from .lead import Lead
from .conversion import Conversion
from .task import Task

_property = property


class ChatProspect(BaseModel):
    property = models.ForeignKey(Property, related_name='chat_prospects', null=True, on_delete=models.SET_NULL)
    external_id = models.UUIDField(max_length=64, unique=True, default=uuid.uuid4)
    last_visit_page = models.CharField(max_length=64, null=True, blank=True)
    lead = models.ForeignKey(Lead, related_name='chat_prospects', null=True, on_delete=models.SET_NULL)
    guest_card = models.ForeignKey(Lead, related_name='chat_prospects_for_guest', null=True, on_delete=models.SET_NULL)
    conversion = models.ForeignKey(Conversion, related_name='chat_prospects', null=True, on_delete=models.SET_NULL)
    is_archived = models.BooleanField(default=False)
    is_mute = models.BooleanField(default=False)
    task = models.ForeignKey(Task, related_name='chat_prospects', null=True, on_delete=models.SET_NULL)
    is_chat_open = models.BooleanField(default=False)
    is_waiting_agent = models.BooleanField(default=False)
    is_in_group = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)
    number = models.IntegerField(null=True)
    source = models.CharField(
        choices=(('SITE', 'Standalone Website'), ('MT', 'Mark-Taylor'), ), max_length=24, default='SITE'
    )
    unloaded_time = models.DateTimeField(blank=True, null=True)
    tour_scheduling_in_progress = models.BooleanField(default=False)

    class Meta:
        ordering = ('created',)

    @_property
    def active_agent(self):
        """
        The active agent in live session period. Session timeouts after 10 minutes agent did not respond.
        :return:
        """
        active_session_start = datetime.now() - timedelta(minutes=10)
        conversation = self.conversations.exclude(agent=None) \
            .exclude(date__lte=active_session_start).order_by('-date').first()
        active_agent = conversation.agent if conversation else None
        return active_agent if active_agent and active_agent.is_available else None

    @_property
    def name(self):
        if self.lead:
            name = self.lead.name
        elif self.task and self.task.lead:
            name = self.task.lead.name
        elif self.guest_card:
            name = self.guest_card.name
        else:
            name = None
        return name

    @_property
    def name_label(self):
        if self.lead:
            name_label = self.lead.name
        elif self.task and self.task.lead:
            name_label = f'{self.task.lead.name}'
        elif self.guest_card:
            name_label = self.guest_card.name
        else:
            name_label = f'Prospect #{self.number}'
        return name_label

    @_property
    def last_conversation(self):
        last_conversation = self.conversations.exclude(
            Q(type__in=[ChatConversation.TYPE_JOINED, ChatConversation.TYPE_AGENT_REQUEST,
                        ChatConversation.TYPE_DATA_CAPTURE]) |
            Q(message__contains='unit-form') | Q(is_form_message=True)).order_by('-date').first()
        return last_conversation

    @_property
    def last_prospect_conversation(self):
        last_conversation = self.conversations.filter(
            type=ChatConversation.TYPE_PROSPECT).order_by('-date').first() or self.conversations.order_by(
            'date').first()
        return last_conversation

    def __str__(self):
        return 'prospect: %s' % self.number

    def save(self, *args, **kwargs):
        if not self.pk:
            with transaction.atomic():
                prospects = ChatProspect.objects.filter(property=self.property).order_by('-created')
                if not prospects.count():
                    self.number = 1
                else:
                    last_number = prospects.select_for_update(nowait=False).first().number
                    self.number = last_number % 999 + 1
                super(ChatProspect, self).save(*args, **kwargs)
                return
        super(ChatProspect, self).save(*args, **kwargs)


class ChatConversation(BaseModel):
    TYPE_AGENT = 'AGENT'
    TYPE_BOT = 'BOT'
    TYPE_PROSPECT = 'PROSPECT'
    TYPE_JOINED = 'JOINED'
    TYPE_AGENT_REQUEST = 'AGENT_REQUEST'
    TYPE_GREETING = 'GREETING'
    TYPE_DATA_CAPTURE = 'DATA_CAPTURE'
    TYPE_TEMPLATE = 'TEMPLATE'

    ACTION_VIEW_PHOTOS = 'VIEW_PHOTOS'
    ACTION_SCHEDULE_TOUR = 'SCHEDULE_TOUR'
    ACTION_RESCHEDULE_TOUR = 'RESCHEDULE_TOUR'
    ACTION_CANCEL_TOUR = 'CANCEL_TOUR'
    ACTION_CHECK_PRICES = 'CHECK_PRICES'
    ACTION_RESIDENT_ACCESS = 'RESIDENT_ACCESS'
    ACTION_QUESTION = 'QUESTION'

    QUESTION_RESULT_ANSWERED = 'ANSWERED'
    QUESTION_RESULT_NO_DATA = 'NO_DATA'
    QUESTION_RESULT_REPHRASED = 'REPHRASED'
    QUESTION_RESULT_FAILED = 'FAILED'

    TYPE_CHOICES = (
        (TYPE_AGENT, 'Agent message'),
        (TYPE_BOT, 'Bot message'),
        (TYPE_PROSPECT, 'Prospect message'),
        (TYPE_JOINED, 'Agent joined'),
        (TYPE_AGENT_REQUEST, 'Agent request'),
        (TYPE_GREETING, 'Greeting message'),
        (TYPE_DATA_CAPTURE, 'Data capture element'),
        (TYPE_TEMPLATE, 'Template'),
    )
    ACTION_CHOICES = (
        (ACTION_VIEW_PHOTOS, 'View photos'),
        (ACTION_SCHEDULE_TOUR, 'Schedule a tour'),
        (ACTION_RESCHEDULE_TOUR, 'Reschedule tour / edit tour'),
        (ACTION_CANCEL_TOUR, 'Cancel tour'),
        (ACTION_CHECK_PRICES, 'Check prices / availability'),
        (ACTION_RESIDENT_ACCESS, 'Resident access'),
        (ACTION_QUESTION, 'I have a question')
    )

    QUESTION_RESULT_CHOICES = ((QUESTION_RESULT_ANSWERED, 'Answered'), (QUESTION_RESULT_REPHRASED, 'Rephrased'),
                               (QUESTION_RESULT_FAILED, 'Failed'), (QUESTION_RESULT_NO_DATA, 'No data'))

    property = models.ForeignKey(Property, related_name='conversations', null=True, on_delete=models.SET_NULL)
    prospect = models.ForeignKey(ChatProspect, related_name='conversations', null=True, on_delete=models.CASCADE)
    external_id = models.UUIDField(max_length=64, unique=True, default=uuid.uuid4)
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(choices=TYPE_CHOICES, default=TYPE_BOT, max_length=32)
    action = models.CharField(choices=ACTION_CHOICES, max_length=32, blank=True, null=True)
    to_agent = models.BooleanField(default=False)
    agent = models.ForeignKey(User, related_name='conversations', null=True, on_delete=models.SET_NULL)
    message = models.TextField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_shown_in_modal = models.BooleanField(default=False)
    is_form_message = models.BooleanField(default=False)
    question_result = models.CharField(choices=QUESTION_RESULT_CHOICES, max_length=32, blank=True, null=True)
    hobbes_answer = models.JSONField(default=dict, null=True, blank=True)

    class Meta:
        ordering = ('date',)


class AgentRequest(BaseModel):
    property = models.ForeignKey(Property, related_name='agent_requests', null=True, on_delete=models.SET_NULL)
    prospect = models.ForeignKey(ChatProspect, related_name='agent_requests', null=True, on_delete=models.SET_NULL)
    user = models.ForeignKey(User, related_name='agent_requests', null=True, on_delete=models.SET_NULL)
    is_declined = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date = models.DateTimeField(null=True, blank=True)
