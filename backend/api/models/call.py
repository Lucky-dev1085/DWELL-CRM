import phonenumbers

from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone

from backend.api.models import Lead, Property
from .base import BaseModel

_property = property


class Call(BaseModel):
    CALL_CATEGORY_PROSPECT = 'PROSPECT'
    CALL_CATEGORY_NON_PROSPECT = 'NON PROSPECT'
    CALL_CATEGORY_CHOICES = ((CALL_CATEGORY_PROSPECT, 'Prospect'), (CALL_CATEGORY_NON_PROSPECT, 'Non Prospect'))

    CALL_RESULT_CONNECTED = 'connected'
    CALL_RESULT_NO_ANSWER = 'no-answer'
    CALL_RESULT_BUSY = 'busy'
    CALL_RESULT_FAILED = 'failed'
    CALL_RESULT_QUEUED = 'queued'
    CALL_RESULT_RINGING = 'ringing'
    CALL_RESULT_IN_PROGRESS = 'in-progress'
    CALL_RESULT_COMPLETED = 'completed'
    CALL_RESULT_CHOICES = (
        (CALL_RESULT_CONNECTED, 'Connected'), (CALL_RESULT_NO_ANSWER, 'No Answer'), (CALL_RESULT_BUSY, 'Busy'),
        (CALL_RESULT_FAILED, 'Failed'), (CALL_RESULT_QUEUED, 'Queued'), (CALL_RESULT_RINGING, 'Ringing'),
        (CALL_RESULT_IN_PROGRESS, 'In Progress'), (CALL_RESULT_COMPLETED, 'Completed'))

    property = models.ForeignKey(Property, related_name='calls', on_delete=models.CASCADE, null=True)

    source = models.CharField(max_length=128)
    prospect_phone_number = models.CharField(max_length=32, blank=True, null=True)
    duration = models.IntegerField(default=0)
    recording = models.FileField(blank=True, null=True, upload_to='call_recording')
    call_id = models.CharField(max_length=64, null=True, blank=True)
    transcription = models.TextField(null=True, blank=True)
    is_transcribed = models.BooleanField(default=False)
    date = models.DateTimeField(blank=True, null=True)

    lead = models.ForeignKey(Lead, related_name='calls', null=True, blank=True, on_delete=models.SET_NULL)
    is_archived = models.BooleanField(default=False)
    is_removed = models.BooleanField(default=False)
    call_start_time = models.DateTimeField(blank=True, null=True)
    tracking_number = models.CharField(max_length=32, blank=True, null=True)
    target_number = models.CharField(max_length=32, blank=True, null=True)
    call_result = models.CharField(max_length=16, choices=CALL_RESULT_CHOICES, default=CALL_RESULT_COMPLETED)
    call_category = models.CharField(max_length=16, choices=CALL_CATEGORY_CHOICES, default=CALL_CATEGORY_PROSPECT)
    recording_url = models.URLField(null=True, blank=True)

    class Meta:
        unique_together = ['property', 'call_id']

    def __str__(self):
        return '{} - {}'.format(self.date.strftime('%Y-%m-%d'), self.source)

    def save(self, **kwargs):
        if self.prospect_phone_number:
            try:
                self.prospect_phone_number = phonenumbers.format_number(
                    phonenumbers.parse(str(self.prospect_phone_number), 'US'), phonenumbers.PhoneNumberFormat.NATIONAL)
            except phonenumbers.phonenumberutil.NumberParseException:
                pass

        last_activity_date = None
        if self.pk:
            old_call = Call.objects.filter(pk=self.pk).first()
            if old_call.lead != self.lead and self.lead:
                last_activity_date = timezone.now()
        else:
            if self.lead:
                last_activity_date = timezone.now()

        if not self.pk:
            has_duplicated_call = Call.objects.filter(
                property=self.property, prospect_phone_number=self.prospect_phone_number,
                date__gte=self.date - timedelta(hours=24)
            ).count()

            if has_duplicated_call:
                self.call_category = self.CALL_CATEGORY_NON_PROSPECT

        super(Call, self).save(kwargs)

        if self.lead and last_activity_date:
            self.lead.last_activity_date = last_activity_date
            self.lead.save()

        if self.lead and not self.lead.phone_number:
            # If lead has not phone number when call is assigned to lead, we should add caller number into lead
            self.lead.phone_number = self.prospect_phone_number
            self.lead.save()


class CallScoringQuestion(BaseModel):
    CATEGORY_INTRODUCTION_AND_LEAD_INFORMATION = 'INTRODUCTION_AND_LEAD_INFORMATION'
    CATEGORY_QUALIFYING_QUESTIONS = 'QUALIFYING_QUESTIONS'
    CATEGORY_AMENITIES_AND_BENEFITS = 'AMENITIES_AND_BENEFITS'
    CATEGORY_CLOSING = 'CLOSING'
    CATEGORY_OVERALL_IMPRESSION = 'OVERALL_IMPRESSION'
    CATEGORY_CHOICES = ((CATEGORY_INTRODUCTION_AND_LEAD_INFORMATION, 'Introduction & Lead Information'),
                        (CATEGORY_QUALIFYING_QUESTIONS, 'Qualifying Questions'),
                        (CATEGORY_AMENITIES_AND_BENEFITS, 'Amenities & Benefits'),
                        (CATEGORY_CLOSING, 'Closing'), (CATEGORY_OVERALL_IMPRESSION, 'Overall Impression'))

    STATUS_ACTIVE = 'ACTIVE'
    STATUS_INACTIVE = 'INACTIVE'
    STATUS_CHOICES = ((STATUS_ACTIVE, 'Active'), (STATUS_INACTIVE, 'Inactive'))

    category = models.CharField(max_length=64, choices=CATEGORY_CHOICES, blank=True, null=True,
                                default=CATEGORY_INTRODUCTION_AND_LEAD_INFORMATION)
    question = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, blank=True, null=True, default=STATUS_ACTIVE)
    weight = models.IntegerField(default=10, choices=((x, x) for x in range(0, 101)))
    order = models.IntegerField(default=1, choices=((x, x) for x in range(1, 101)))
    is_not_omitting = models.BooleanField(default=False)

    def __str__(self):
        return '{}'.format(self.question)


class ScoredCall(BaseModel):
    RESCORE_STATUS_CHOICES = (('NOT_REQUIRED', 'Not required'), ('REQUIRED', 'Required'), ('RESCORED', 'Rescored'))

    property = models.ForeignKey(Property, related_name='scored_calls', on_delete=models.CASCADE, null=True)
    call_date = models.DateField(blank=True, null=True)
    call = models.ForeignKey(Call, related_name='scored_calls', on_delete=models.CASCADE, null=True)
    questions = models.ManyToManyField(CallScoringQuestion, related_name='scored_calls', blank=True)
    omitted_questions = models.ManyToManyField(
        CallScoringQuestion, related_name='omitted_scored_calls', blank=True
    )
    call_scorer = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='scored_calls', blank=True, null=True, on_delete=models.SET_NULL
    )
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='agent_scored_calls', blank=True, null=True,
                              on_delete=models.SET_NULL)
    prev_score = models.FloatField(blank=True, null=True)
    rescore_status = models.CharField(choices=RESCORE_STATUS_CHOICES, default='NOT_REQUIRED', max_length=32)
    rescore_reason = models.TextField(blank=True, null=True)
    scored_at = models.DateTimeField(blank=True, null=True)

    @_property
    def score(self):
        questions = CallScoringQuestion.objects.all()
        overall_weights = sum(
            [question.weight for question in questions.exclude(pk__in=self.omitted_questions.all())]
        )
        call_weights = sum([question.weight for question in self.questions.all()])
        return round(call_weights * 100 / overall_weights, 1) if overall_weights != 0 else 0.0

    def __str__(self):
        return '{}'.format(self.call)

    def save(self, *args, **kwargs):
        if not self.pk and getattr(self, 'call'):
            self.call_date = self.call.date.date()
        super(ScoredCall, self).save(*args, **kwargs)
