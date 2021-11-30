import phonenumbers

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords

from .base import BaseModel
from .property import Property, Unit, FloorPlan, ProspectSource, ProspectLostReason, ReasonForMoving, \
    PetType, PetWeight, PriceRange
from .user import User
from .authentication import VendorAuth

_property = property


class Lead(BaseModel):
    LEAD_ACTIVE = 'ACTIVE'
    LEAD_CLOSED = 'CLOSED'
    LEAD_LOST = 'LOST'
    LEAD_DELETED = 'DELETED'
    LEAD_TEST = 'TEST'
    STATUS_CHOICES = ((LEAD_ACTIVE, 'Active'), (LEAD_CLOSED, 'Closed'), (LEAD_LOST, 'Lost'),
                      (LEAD_DELETED, 'Deleted'), (LEAD_TEST, 'Test'))

    STAGE_INQUIRY = 'INQUIRY'
    STAGE_CONTACT_MADE = 'CONTACT_MADE'
    STAGE_TOUR_SET = 'TOUR_SET'
    STAGE_TOUR_COMPLETED = 'TOUR_COMPLETED'
    STAGE_WAITLIST = 'WAITLIST'
    STAGE_APPLICATION_PENDING = 'APPLICATION_PENDING'
    STAGE_APPLICATION_COMPLETE = 'APPLICATION_COMPLETE'

    NOT_SET = 'NOT_SET'
    FIRST_FOLLOWUP = 'FIRST_FOLLOWUP'
    SECOND_FOLLOWUP = 'SECOND_FOLLOWUP'
    THIRD_FOLLOWUP = 'THIRD_FOLLOWUP'
    FINAL_FOLLOWUP = 'FINAL_FOLLOWUP'
    RECEIVED_APPLICATION = 'RECEIVED_APPLICATION'

    STAGE_CHOICES = ((STAGE_INQUIRY, 'Inquiry'), (STAGE_CONTACT_MADE, 'Contact made'), (STAGE_TOUR_SET, 'Tour set'),
                     (STAGE_TOUR_COMPLETED, 'Tour completed'), (STAGE_WAITLIST, 'Waitlist'),
                     (STAGE_APPLICATION_PENDING, 'Application pending'),
                     (STAGE_APPLICATION_COMPLETE, 'Application complete'))

    ORIGIN_CHOICES = (('WEB', 'Web'), ('MOBILE', 'Mobile'), ('PHONE', 'Phone'), ('WALK_IN', 'Walk In'),
                      ('UNKNOWN', 'Unknown'))
    MOVING_REASON_CHOICES = (('EMPLOYMENT', 'Employment'), ('FAMILY', 'Family'), ('OTHER', 'Other'))
    CONTACT_METHOD_CHOICES = (('EMAIL', 'Email'), ('PHONE', 'Phone'), ('TEXT', 'Text'))
    CONTACT_TIME_CHOICES = (('MORNING', 'Morning'), ('AFTERNOON', 'Afternoon'), ('EVENING', 'Evening'))
    PET_TYPE_CHOICES = (('DOG', 'Dog'), ('CAT', 'Cat'), ('BIRD', 'Bird'),)
    WASHER_DRYER_METHOD = (('IN_UNIT', 'In Unit'), ('HOOK_UP_ONLY', 'Hook up only'), ('ON_PREMISE', 'On premise'),
                           ('NONE', 'None'))
    RESMAN_SYNC_CHOICES = (('SUCCESS', 'Success'), ('FAILURE', 'Failure'), ('NOT_STARTED', 'Not Started'),
                           ('SYNCING', 'Syncing'),)
    REMINDER_STEP_CHOICES = ((NOT_SET, 'Not Set'), (FIRST_FOLLOWUP, 'First Followup'),
                             (SECOND_FOLLOWUP, 'Second Followup'), (THIRD_FOLLOWUP, 'Third Followup'),
                             (FINAL_FOLLOWUP, 'Final Followup'), (RECEIVED_APPLICATION, 'Received Application'))

    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    email = models.EmailField(max_length=64, blank=True, null=True)
    secondary_email = models.EmailField(max_length=64, blank=True, null=True)
    phone_number = models.CharField(max_length=32, blank=True, null=True, validators=[RegexValidator('\d+')])
    secondary_phone_number = models.CharField(max_length=32, blank=True, null=True, validators=[RegexValidator('\d+')])
    source = models.ForeignKey(ProspectSource, related_name='leads', blank=True, null=True, on_delete=models.SET_NULL)
    last_source = models.ForeignKey(ProspectSource, related_name='last_source_leads', blank=True, null=True,
                                    on_delete=models.SET_NULL)
    lost_reason = models.ForeignKey(ProspectLostReason, related_name='leads', blank=True, null=True,
                                    on_delete=models.SET_NULL)
    origin = models.CharField(max_length=32, blank=True, null=True, choices=ORIGIN_CHOICES)
    move_in_date = models.DateField(blank=True, null=True)
    desired_rent = models.FloatField(blank=True, null=True)
    lease_term = models.IntegerField(blank=True, null=True)
    moving_reason = models.ForeignKey(ReasonForMoving, related_name='leads', blank=True, null=True,
                                      on_delete=models.SET_NULL)
    best_contact_method = models.CharField(max_length=32, blank=True, null=True, choices=CONTACT_METHOD_CHOICES)
    best_contact_time = models.CharField(max_length=32, blank=True, null=True, choices=CONTACT_TIME_CHOICES)
    occupants = models.IntegerField(blank=True, null=True)
    beds = models.FloatField(blank=True, null=True)
    baths = models.FloatField(blank=True, null=True)
    pets = models.IntegerField(blank=True, null=True)
    pet_type = models.ForeignKey(PetType, related_name='leads', blank=True, null=True, on_delete=models.SET_NULL)
    price_range = models.ForeignKey(PriceRange, related_name='leads', blank=True, null=True, on_delete=models.SET_NULL)
    res_man_pet_weight = models.CharField(max_length=16, blank=True, null=True)
    real_page_pet_weight = models.ForeignKey(PetWeight, related_name='leads', blank=True, null=True,
                                             on_delete=models.SET_NULL)
    vehicles = models.IntegerField(blank=True, null=True)
    washer_dryer_method = models.CharField(max_length=16, blank=True, null=True, choices=WASHER_DRYER_METHOD)
    units = models.ManyToManyField(Unit, related_name='leads', blank=True)
    floor_plan = models.ManyToManyField(FloorPlan, related_name='leads', blank=True)
    property = models.ForeignKey(Property, related_name='leads', on_delete=models.SET_NULL, null=True)
    stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default=STAGE_INQUIRY, blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, blank=True, null=True, default=LEAD_ACTIVE)
    pms_sync_date = models.DateTimeField(blank=True, null=True)
    pms_sync_status = models.CharField(max_length=16, choices=RESMAN_SYNC_CHOICES, default='NOT_STARTED',
                                       blank=True, null=True)
    pms_sync_condition_lack_reason = models.CharField(max_length=64, null=True, blank=True)
    resman_person_id = models.CharField(max_length=64, null=True, blank=True)
    resman_prospect_id = models.CharField(max_length=64, null=True, blank=True)
    resman_prospect_lost = models.BooleanField(default=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='leads', blank=True, null=True,
                              on_delete=models.SET_NULL)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='actor_leads', blank=True, null=True,
                              on_delete=models.SET_NULL)
    # Celery task id of reminder emails.
    followup_reminder_async_id = models.CharField(max_length=64, blank=True, null=True)
    confirmation_reminder_async_id = models.CharField(max_length=64, blank=True, null=True)
    application_complete_email_sent = models.BooleanField(default=False)
    confirmation_sms_reminder_async_id = models.CharField(max_length=64, blank=True, null=True)

    closed_status_date = models.DateTimeField(blank=True, null=True)
    tour_completed_date = models.DateTimeField(blank=True, null=True)
    lost_status_date = models.DateTimeField(blank=True, null=True)

    last_followup_date = models.DateTimeField(blank=True, null=True)
    # this is different concept of activity timeline
    last_activity_date = models.DateTimeField(blank=True, null=True)
    last_twilio_backup_date = models.DateTimeField(blank=True, null=True)
    source_lead = models.ForeignKey('self', related_name='shared_leads', on_delete=models.SET_NULL, null=True)
    history = HistoricalRecords()
    is_from_external_vendor = models.BooleanField(default=False)
    vendor = models.ForeignKey(VendorAuth, related_name='leads', on_delete=models.SET_NULL, null=True, blank=True)
    acquisition_date = models.DateTimeField(auto_now_add=True)
    resman_changed_field = ArrayField(models.CharField(max_length=32, blank=True), default=list)
    real_page_guest_card_id = models.CharField(max_length=64, null=True, blank=True)
    real_page_customer_id = models.CharField(max_length=64, null=True, blank=True)
    smart_rent_id = models.IntegerField(null=True, blank=True)
    last_reactivated_date = models.DateTimeField(blank=True, null=True)
    last_stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default=STAGE_INQUIRY, blank=True, null=True)
    is_deleted_by_merging = models.BooleanField(default=False)

    def __str__(self):
        return str(self.first_name) if self.first_name else ''

    class Meta:
        unique_together = ('property', 'resman_prospect_id')

    @_property
    def name(self):
        return '%s %s' % (self.first_name, self.last_name)

    @_property
    def next_task(self):
        from .task import Task
        next_task = self.tasks.filter(status='OPEN').exclude(type__in=Task.TOUR_TYPES.keys()).order_by('due_date').first()
        next_tour = self.tasks.filter(status='OPEN').filter(type__in=Task.TOUR_TYPES.keys()).order_by('tour_date').first()
        if next_task and next_tour and next_task.due_date and next_tour.tour_date:
            return next_task if next_task.due_date <= next_tour.tour_date.date() else next_tour
        elif next_task and next_task.due_date:
            return next_task
        elif next_tour and next_tour.tour_date:
            return next_tour
        return None

    @_property
    def page_url(self):
        return f'{settings.CRM_HOST}/{self.property.external_id}/leads/{self.pk}'

    @_property
    def days_to_move_in(self):
        return (self.move_in_date - timezone.now().date()).days if self.move_in_date else None

    @_property
    def status_label(self):
        return self.get_status_display() if self.status != Lead.LEAD_CLOSED else 'Leased'

    @_property
    def acquisition_history(self):
        data = self.history.exclude(last_source=None).order_by('acquisition_date') \
            .values_list('acquisition_date', 'last_source__name').distinct()
        first_source = self.history.order_by('updated').first().source

        history = [dict(date=str(self.created), source=first_source.name)] if first_source else []
        history += [dict(date=str(record[0]), source=record[1]) for record in data]

        return history if len(history) > 1 else None

    def pms_sync(self, owner_updated=False):
        if not settings.ALLOW_PMS_SYNC:
            self.pms_sync_status = 'NOT_STARTED'
            self.save()
            return
        from backend.api.tasks import resman_sync, real_page_sync
        if self.property.resman_property_id:
            return lambda: resman_sync.delay(self.pk, owner_updated)
        if self.property.real_page_site_id:
            return lambda: real_page_sync.delay(self.pk)

    def sync_activity(self, object_id, event_type):
        if not settings.ALLOW_PMS_SYNC:
            self.pms_sync_status = 'NOT_STARTED'
            self.save()
            return
        from backend.api.tasks import sync_res_man_activity, sync_real_page_activity
        if self.property.resman_property_id:
            if self.resman_prospect_id:
                return lambda: sync_res_man_activity.delay(object_id, event_type)
            else:
                return lambda: sync_res_man_activity.apply_async((object_id, event_type), countdown=30)
        if self.property.real_page_site_id:
            if self.real_page_customer_id:
                return lambda: sync_real_page_activity.delay(object_id, event_type)
            else:
                return lambda: sync_real_page_activity.apply_async((object_id, event_type), countdown=30)

    def save(self, **kwargs):
        if self.phone_number:
            try:
                self.phone_number = phonenumbers.format_number(phonenumbers.parse(str(self.phone_number), 'US'),
                                                               phonenumbers.PhoneNumberFormat.NATIONAL)
            except phonenumbers.phonenumberutil.NumberParseException:
                pass

        # last_followup_date
        followed_up_stage_list = [Lead.STAGE_CONTACT_MADE, Lead.STAGE_APPLICATION_COMPLETE,
                                  Lead.STAGE_APPLICATION_PENDING, Lead.STAGE_TOUR_SET, Lead.STAGE_TOUR_COMPLETED]
        if self.stage in followed_up_stage_list:
            old_lead = Lead.objects.filter(pk=self.pk).first()
            if old_lead and old_lead.stage != self.stage:
                self.last_followup_date = timezone.now()
        super(Lead, self).save(kwargs)


class LeadsFilter(BaseModel):
    TYPE_ALL = 'ALL'
    TYPE_ANY = 'ANY'
    FILTER_TYPE_CHOICES = ((TYPE_ALL, 'All'), (TYPE_ANY, 'Any'))

    name = models.CharField(max_length=64)
    property = models.ForeignKey(Property, related_name='leads_filters', on_delete=models.SET_NULL, null=True)
    filter_type = models.CharField(max_length=32, choices=FILTER_TYPE_CHOICES, default=TYPE_ALL)

    class Meta:
        unique_together = ['name', 'property']

    def __str__(self):
        return self.name


class LeadsFilterItem(BaseModel):
    OPERATOR_IS = 'IS'
    OPERATOR_IS_NOT = 'IS_NOT'
    OPERATOR_STARTS_WITH = 'STARTS_WITH'
    OPERATOR_ENDS_WITH = 'ENDS_WITH'
    OPERATOR_IS_BETWEEN = 'IS_BETWEEN'
    OPERATOR_IS_LESS_THAN = 'IS_LESS_THAN'
    OPERATOR_IS_GREATER_THAN = 'IS_GREATER_THAN'
    OPERATOR_IS_NOT_SET = 'IS_NOT_SET'
    OPERATOR_IS_ON_OR_BEFORE = 'IS_ON_OR_BEFORE'
    OPERATOR_IS_ON_OR_AFTER = 'IS_ON_OR_AFTER'
    OPERATOR_IS_ONE_OF = 'IS_ONE_OF'
    OPERATOR_IS_ON = 'IS_ON'

    OPERATOR_CHOICES = ((OPERATOR_IS, 'Is'), (OPERATOR_IS_NOT, 'Is not'), (OPERATOR_STARTS_WITH, 'Starts with'),
                        (OPERATOR_ENDS_WITH, 'Ends with'), (OPERATOR_IS_BETWEEN, 'Is between'),
                        (OPERATOR_IS_LESS_THAN, 'Is less than'), (OPERATOR_IS_GREATER_THAN, 'Is greater than'),
                        (OPERATOR_IS_NOT_SET, 'Is not set'), (OPERATOR_IS_ON_OR_BEFORE, 'Is on or before'),
                        (OPERATOR_IS_ON_OR_AFTER, 'Is on or after'), (OPERATOR_IS_ONE_OF, 'Is one of'),
                        (OPERATOR_IS_ON, 'Is on'))

    compare_field = models.CharField(max_length=32)
    compare_value = ArrayField(models.CharField(max_length=32, blank=True), default=list)
    compare_operator = models.CharField(max_length=32, choices=OPERATOR_CHOICES, default=OPERATOR_IS_ON)
    lead_filter = models.ForeignKey(LeadsFilter, related_name='filter_items', on_delete=models.CASCADE)

    def __str__(self):
        return '%s of filter - %s' % (self.compare_field, self.lead_filter.name)


class ILSEmail(BaseModel):
    email = models.CharField(max_length=64, blank=True, null=True)
    body = models.TextField(null=True, blank=True)
    lead = models.ForeignKey(Lead, related_name='ils_emails', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.email


class ActiveLeadsFilter(BaseModel):
    property = models.ForeignKey(Property, related_name='active_leads_filter', on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, related_name='active_leads_filter', on_delete=models.SET_NULL, null=True)
    lead_filter = models.ForeignKey(LeadsFilter, related_name='users', null=True, blank=True, on_delete=models.SET_NULL)
    lead_default_filter = models.CharField(max_length=32, blank=True, default='all_leads')
    is_default_filter = models.BooleanField(default=True)

    @_property
    def filter_id(self):
        if self.is_default_filter:
            return self.lead_default_filter
        else:
            return self.lead_filter.pk if self.lead_filter else None
