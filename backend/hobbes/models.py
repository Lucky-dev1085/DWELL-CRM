from django.db import models
from django.db.models import Count, FloatField, Q
from django.contrib.postgres.fields import ArrayField

from backend.api.models import BaseModel, Property, ChatProspect, ChatConversation

_property = property


class HumanFirstSyncState(BaseModel):
    is_succeed = models.BooleanField(default=True)
    date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f'Check on {self.date}'


class SynonymMapping(BaseModel):
    name = models.CharField(max_length=256, unique=True)
    synonyms = ArrayField(models.CharField(max_length=256), null=True, blank=True)

    def __str__(self):
        return self.name


class AmenityCategory(BaseModel):
    name = models.CharField(max_length=256, unique=True)
    synonyms = ArrayField(models.CharField(max_length=256), null=True, blank=True)
    is_supported = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Amenity Categories'

    def __str__(self):
        return self.name


class Amenity(BaseModel):
    name = models.CharField(max_length=512, unique=True)
    name_in_hobbes = models.CharField(max_length=256, null=True, blank=True)
    category = models.ForeignKey(AmenityCategory, related_name='amenities', on_delete=models.SET_NULL, null=True)
    is_supported = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Amenities'

    def __str__(self):
        return self.name


class HobbesAutoTestQuestion(BaseModel):
    question = models.CharField(max_length=256, unique=True)
    intent = models.CharField(max_length=256, null=True, blank=True)
    entities = models.JSONField(default=dict, blank=True)
    positive_answer = models.CharField(max_length=256, null=True, blank=True)
    negative_answer = models.CharField(max_length=256, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.question


class HobbesAutoTestResult(BaseModel):
    property = models.ForeignKey(
        Property, related_name='hobbes_auto_test_results', null=True, on_delete=models.SET_NULL
    )
    is_succeed = models.BooleanField(default=True)
    date = models.DateTimeField(blank=True, null=True)
    file = models.FileField(blank=True, null=True, upload_to='hobbes_check_export/')


class ChatReport(BaseModel):
    STATUS_PENDING = 'PENDING'
    STATUS_PROGRESS = 'PROGRESS'
    STATUS_COMPLETED = 'COMPLETED'

    EVALUATION_STATUSES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROGRESS, 'In progress'),
        (STATUS_COMPLETED, 'Completed'),
    )

    session_date = models.DateField()
    status = models.CharField(choices=EVALUATION_STATUSES, default=STATUS_PENDING, max_length=32)

    property = models.ForeignKey(
        Property, related_name='chat_conversations_evaluation_report', null=True, on_delete=models.SET_NULL
    )

    def get_count_of_messages(self, message_type=ChatConversation.TYPE_BOT, *args, **messages_filter):
        return ChatConversation.objects.filter(

            prospect__report=self, type=message_type, **messages_filter
        ).count()

    def get_count_of_messages_status(self, **kwargs):
        return ChatReportMessage.objects.filter(conversation__report=self, message__type=ChatConversation.TYPE_BOT,
                                                **kwargs).exclude(status=None, support_status=None).count()

    def get_stats_of_messages_status(self, **messages_filter):
        where = Q(**messages_filter)
        aggregate = ChatReportMessage.objects \
            .filter(
            conversation__report=self, message__type=ChatConversation.TYPE_BOT
        ).aggregate(
            count=Count('id', where),
            total=Count('id', ~Q(status=None) | ~Q(support_status=None), output_field=FloatField()),
        )
        if aggregate.get('total'):
            aggregate['percent'] = aggregate['count'] * 100 / aggregate['total']
        aggregate['percent'] = round(aggregate.get('percent', 0), 1)
        return aggregate

    def get_stats_of_conversations(self):
        aggregate = self.chats.aggregate(
            total=Count('id', distinct=True),
            correct=Count(
                'report_messages',
                Q(report_messages__message__type=ChatConversation.TYPE_BOT)
                and Q(report_messages__status=ChatReportMessage.STATUS_CORRECT),
                output_field=FloatField()
            ),
            total_bot=Count('report_messages', Q(report_messages__message__type=ChatConversation.TYPE_BOT),
                            output_field=FloatField())
        )

        if aggregate['total_bot']:
            aggregate['avg'] = aggregate['correct'] * 100 / aggregate['total_bot']

        aggregate['avg'] = round(aggregate.get('avg', 0), 1)

        return aggregate

    @_property
    def conversations(self):
        return ChatProspect.objects.filter(id__in=self.chats.values_list('conversation__id', flat=True))

    class Meta:
        ordering = ['session_date']


class ChatReportConversation(BaseModel):
    reviewed = models.BooleanField(default=False)

    report = models.ForeignKey(ChatReport, related_name='chats', on_delete=models.CASCADE)
    conversation = models.ForeignKey(ChatProspect, related_name='report_chats', on_delete=models.CASCADE)

    @_property
    def messages(self):
        return ChatConversation.objects.filter(id__in=self.report_messages.values_list('message__id', flat=True))

    class Meta:
        ordering = ['created']


class ChatReportMessage(BaseModel):
    STATUS_CORRECT = 'CORRECT'
    STATUS_INCORRECT = 'INCORRECT'

    SUPPORT_STATUS_SUPPORTED = 'SUPPORTED'
    SUPPORT_STATUS_NOT_SUPPORTED = 'NOT_SUPPORTED'

    MESSAGES_STATUSES = (
        (STATUS_CORRECT, 'Correct'),
        (STATUS_INCORRECT, 'Incorrect'),
    )

    MESSAGES_SUPPORT_STATUSES = (
        (SUPPORT_STATUS_SUPPORTED, 'Supported'),
        (SUPPORT_STATUS_NOT_SUPPORTED, 'Not supported'),
    )

    status = models.CharField(choices=MESSAGES_STATUSES, max_length=32, null=True)
    support_status = models.CharField(choices=MESSAGES_SUPPORT_STATUSES, max_length=32, null=True)

    conversation = models.ForeignKey(ChatReportConversation, related_name='report_messages', on_delete=models.CASCADE)
    message = models.ForeignKey(ChatConversation, related_name='report_messages', on_delete=models.CASCADE)

    class Meta:
        ordering = ['created']
