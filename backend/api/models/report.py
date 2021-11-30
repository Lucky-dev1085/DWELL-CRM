from django.db import models
from django.contrib.postgres.fields import ArrayField

from backend.api.models import Property
from .base import BaseModel

_property = property


def default_followups():
    return [0, 0]


class Report(BaseModel):
    property = models.ForeignKey(Property, related_name='reports', null=True, on_delete=models.SET_NULL)
    date = models.DateField(blank=False, null=False)

    leads = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    leases = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    tours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    lost_leads = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)

    notes = models.JSONField(default=list, null=True, blank=True)
    emails = models.JSONField(default=list, null=True, blank=True)
    tasks = models.JSONField(default=list, null=True, blank=True)
    calls = models.IntegerField(default=0)
    agent_chats = models.IntegerField(default=0)

    lead_response_time_business = models.JSONField(default=list, null=True, blank=True)
    lead_response_time_non_business = models.JSONField(default=list, null=True, blank=True)
    sign_lease_time = models.JSONField(default=list, null=True, blank=True)
    followups_number = models.JSONField(default=list, null=True, blank=True)
    followups_2_hours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=default_followups)
    followups_24_hours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=default_followups)
    followups_48_hours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=default_followups)
    followups_more_48_hours = ArrayField(
        models.IntegerField(default=0), null=True, blank=True, default=default_followups
    )

    prospect_calls = models.IntegerField(default=0)
    call_time = models.IntegerField(default=0)
    call_answered = models.IntegerField(default=0)
    call_missed = models.IntegerField(default=0)
    call_busy = models.IntegerField(default=0)
    call_failed = models.IntegerField(default=0)
    call_score = models.JSONField(default=list, null=True, blank=True)
    introduction_score = models.JSONField(default=list, null=True, blank=True)
    qualifying_score = models.JSONField(default=list, null=True, blank=True)
    amenities_score = models.JSONField(default=list, null=True, blank=True)
    closing_score = models.JSONField(default=list, null=True, blank=True)
    overall_score = models.JSONField(default=list, null=True, blank=True)
    agents_call_score = models.JSONField(default=list, null=True, blank=True)

    # for operation reports
    expected_move_ins = models.IntegerField(default=0)
    notice_to_vacates = models.IntegerField(default=0)

    # tours reports
    in_person_tours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    virtual_tours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    guided_virtual_tours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    facetime_tours = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)

    in_person_tours_leases = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    virtual_tours_leases = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    guided_virtual_tours_leases = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)
    facetime_tours_leases = ArrayField(models.IntegerField(default=0), null=True, blank=True, default=list)

    # chat report
    chat_conversations = models.IntegerField(default=0)
    agent_chat_conversations = models.IntegerField(default=0)
    repeat_chat_conversations = models.IntegerField(default=0)

    view_photos_count = models.IntegerField(default=0)
    schedule_tour_count = models.IntegerField(default=0)
    reschedule_tour_count = models.IntegerField(default=0)
    cancel_tour_count = models.IntegerField(default=0)
    check_prices_count = models.IntegerField(default=0)

    visitor_chat_engagement = models.IntegerField(default=0)
    tours_scheduled = models.IntegerField(default=0)
    guests_created = models.IntegerField(default=0)

    hobbes_chat_conversations = models.IntegerField(default=0)
    hobbes_answered_questions = models.IntegerField(default=0)
    question_count = models.IntegerField(default=0)

    sources = models.JSONField(default=list, null=True, blank=True)

    #site reports
    site_visitor_data = models.JSONField(default=list, null=True, blank=True)
    conversion_data = models.JSONField(default=list, null=True, blank=True)
    source_behavior_data = models.JSONField(default=list, null=True, blank=True)
    demographics_data = models.JSONField(default=list, null=True, blank=True)
    devices_data = models.JSONField(default=list, null=True, blank=True)
    seo_score_data = models.JSONField(default=list, null=True, blank=True)
    acquisition_channels_data = models.JSONField(default=list, null=True, blank=True)

    class Meta:
        unique_together = ['date', 'property']

    def __str__(self):
        return '{} report for {} property'.format(self.date.strftime('%Y-%m-%d'), self.property.name)
