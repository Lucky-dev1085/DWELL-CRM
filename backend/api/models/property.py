import secrets
import phonenumbers

from datetime import datetime, timedelta
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.db import connection
from django.utils import timezone
from timezone_field import TimeZoneField
from simple_history.models import HistoricalRecords
from django.contrib.postgres.fields import ArrayField
from backend.api.utils import hyphens
from .base import BaseModel
from .client import Client
from .customer import Customer


def default_tour_types():
    return ['VIRTUAL_TOUR', 'GUIDED_VIRTUAL_TOUR', 'FACETIME', 'IN_PERSON', 'SELF_GUIDED_TOUR']


def default_bedroom_types():
    return ['ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM']


class Property(BaseModel):
    """
    Site Table
    """
    NYLAS_STATUS_READY_TO_CONNECT = 'READY_TO_CONNECT'
    NYLAS_STATUS_CONNECTED = 'CONNECTED'
    NYLAS_STATUS_SYNCING = 'SYNCING'
    NYLAS_STATUS_DISCONNECTED = 'DISCONNECTED'
    NYLAS_STATUS_AUTH_REQUIRED = 'AUTH_REQUIRED'
    NYLAS_STATUS_CHOICES = ((NYLAS_STATUS_READY_TO_CONNECT, 'Ready to connect'), (NYLAS_STATUS_CONNECTED, 'Connected'),
                            (NYLAS_STATUS_DISCONNECTED, 'Disconnected'), (NYLAS_STATUS_AUTH_REQUIRED, 'Auth Required'),
                            (NYLAS_STATUS_SYNCING, 'Syncing'))

    NYLAS_SYNC_OPTION_ALL = 'SYNC_ALL'
    NYLAS_SYNC_OPTION_LABELED = 'SYNC_LABELED'
    NYLAS_SYNC_CHOICES = ((NYLAS_SYNC_OPTION_ALL, 'Sync all'), (NYLAS_SYNC_OPTION_LABELED, 'Sync labeled'))

    STATUS_CHOICES = (('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'))
    PROPERTY_ID_LENGTH = 10

    TYPE_VIRTUAL_TOUR = 'VIRTUAL_TOUR'
    TYPE_GUIDED_VIRTUAL_TOUR = 'GUIDED_VIRTUAL_TOUR'
    TYPE_IN_PERSON = 'IN_PERSON'
    TYPE_FACETIME = 'FACETIME'
    TYPE_SELF_GUIDED_TOUR = 'SELF_GUIDED_TOUR'

    TOUR_TYPE_CHOICES = (
        (TYPE_VIRTUAL_TOUR, 'Virtual Tour'),
        (TYPE_GUIDED_VIRTUAL_TOUR, 'Guided Virtual Tour'), (TYPE_IN_PERSON, 'In-Person Tour'),
        (TYPE_FACETIME, 'Facetime Tour'), (TYPE_SELF_GUIDED_TOUR, 'Self-Guided Tour')
    )

    STUDIO = 'STUDIO'
    ONE_BEDROOM = 'ONE_BEDROOM'
    TWO_BEDROOM = 'TWO_BEDROOM'
    THREE_BEDROOM = 'THREE_BEDROOM'
    FOUR_BEDROOM = 'FOUR_BEDROOM'
    BEDROOM_TYPE_CHOICES = (
        (STUDIO, 'Studio'), (ONE_BEDROOM, '1 bedroom'), (TWO_BEDROOM, '2 bedroom'), (THREE_BEDROOM, '3 bedroom'),
        (FOUR_BEDROOM, '4 bedroom')
    )

    name = models.CharField(max_length=128, unique=True)
    name_on_lease_hawk = models.CharField(max_length=128, null=True, blank=True)
    domain = models.CharField(max_length=128, unique=True)
    external_id = models.CharField(max_length=128, blank=True)
    resman_property_id = models.CharField(max_length=128, blank=True)
    resman_account_id = models.CharField(max_length=128, blank=True)
    client = models.ForeignKey(Client,
                               related_name='properties',
                               on_delete=models.SET_NULL,
                               blank=True,
                               null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL,
                                related_name='created_properties',
                                on_delete=models.SET_NULL,
                                blank=True,
                                null=True)
    status = models.CharField(max_length=16,
                              choices=STATUS_CHOICES,
                              blank=False,
                              default='INACTIVE')
    # The original number was MST source tracking number but from now we use it as property target number since
    # we will use tracking number of Call/Tracking feature.
    # note - property number that's being used in an email template is property tracking number from now on.
    phone_number = models.CharField(blank=True, max_length=32, verbose_name='Property Target Number')
    town = models.CharField(blank=True, max_length=128)
    city = models.CharField(blank=True, max_length=128)
    country = models.CharField(blank=True, max_length=128)
    shared_email = models.EmailField('shared email', blank=True, unique=True, null=True)
    logo = models.ImageField(blank=True, upload_to='property_logo/', null=True, max_length=256)
    nylas_access_token = models.CharField(max_length=255, blank=True, null=True)
    nylas_account_id = models.CharField(max_length=255, blank=True, null=True)
    nylas_status = models.CharField(max_length=16, choices=NYLAS_STATUS_CHOICES, blank=True)
    nylas_sync_option = models.CharField(max_length=16, choices=NYLAS_SYNC_CHOICES, blank=False,
                                         default=NYLAS_SYNC_OPTION_ALL)
    nylas_selected_labels = models.ManyToManyField('EmailLabel', related_name='properties', blank=True)
    sent_email_count = models.IntegerField(default=0)
    is_email_blast_disabled = models.BooleanField(default=False)
    is_released = models.BooleanField(default=False)
    ping_dom_integrated = models.BooleanField(default=False)
    history = HistoricalRecords()
    nylas_last_connected_date = models.DateField(blank=True, null=True)
    is_calls_scoring_enabled = models.BooleanField(default=False)
    is_chat_reviewing_enabled = models.BooleanField(default=False)
    is_using_resman = models.BooleanField(default=True)

    # sync time from ResMan to Dwell
    last_pms_sync_time = models.DateTimeField(blank=True, null=True)

    calendar_sync_option = models.CharField(max_length=16, choices=NYLAS_SYNC_CHOICES, blank=False,
                                            default=NYLAS_SYNC_OPTION_ALL)
    nylas_selected_calendars = models.ManyToManyField('Calendar', related_name='properties', blank=True)
    client_external_id = models.CharField(max_length=32, blank=True)

    smart_rent_group_id = models.CharField(max_length=128, blank=True)
    tour_types = ArrayField(
        models.CharField(max_length=32, choices=TOUR_TYPE_CHOICES), default=default_tour_types, blank=True
    )
    bedroom_types = ArrayField(
        models.CharField(max_length=32, choices=BEDROOM_TYPE_CHOICES), default=default_bedroom_types
    )
    mark_taylor_base_url = models.CharField(max_length=255, blank=True)
    real_page_pmc_id = models.CharField(max_length=128, blank=True)
    real_page_site_id = models.CharField(max_length=128, blank=True)
    timezone = TimeZoneField(default='America/Phoenix')
    mst_property_email = models.EmailField('mst property email', blank=True, null=True)
    platform = models.CharField(
        choices=(('SITE_ONLY', 'Site Only',), ('DWELL_ONLY', 'Dwell Only'), ('BOTH', 'Site and Dwell'),),
        default='SITE_ONLY', max_length=16,
    )
    customer = models.ForeignKey(Customer, related_name='properties', blank=True, null=True, on_delete=models.CASCADE)
    agent_chat_enabled = models.BooleanField(default=False)
    is_booking_enabled = models.BooleanField(default=True)
    is_call_rescore_required_today = models.BooleanField(default=False)
    block_spam_calls_enabled = models.BooleanField(default=False)
    hobbes_enabled = models.BooleanField(default=False)
    is_text_me_feature_enabled = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Properties'

    def save(self, *args, **kwargs):
        should_sync_nylas = False
        is_created = not self.pk
        if not self.pk:
            self.name_on_lease_hawk = self.name
            if self.real_page_pmc_id:
                self.pull_real_page_initials()
            if self.resman_property_id:
                self.pull_resman_initials()
            self.client_external_id = secrets.token_hex(16)
        else:
            property = Property.objects.filter(pk=self.pk).first()
            if property.resman_account_id != self.resman_account_id and self.resman_account_id \
                    or property.resman_property_id != self.resman_property_id and self.resman_property_id:
                self.pull_resman_initials()

            if property.real_page_pmc_id != self.real_page_pmc_id and self.real_page_pmc_id \
                    or property.real_page_site_id != self.real_page_site_id and self.real_page_site_id:
                self.pull_real_page_initials()

            if property and property.nylas_status != self.nylas_status \
                    and self.nylas_status == Property.NYLAS_STATUS_SYNCING:
                should_sync_nylas = True

        if self.phone_number:
            try:
                self.phone_number = phonenumbers.format_number(phonenumbers.parse(str(self.phone_number), 'US'),
                                                               phonenumbers.PhoneNumberFormat.NATIONAL)
            except phonenumbers.phonenumberutil.NumberParseException:
                pass

        if not self.external_id:
            self.external_id = hyphens(self.name)

        super(Property, self).save(*args, **kwargs)

        if should_sync_nylas:
            from backend.api.tasks import sync_nylas_messages_task, sync_nylas_events_task
            sync_nylas_messages_task.delay(self.pk)
            sync_nylas_events_task.delay(self.pk)

        if is_created:
            self.generate_business_hours()
            self.generate_welcome_prospect_email_template()

    @property
    def has_contact_details(self):
        return bool(self.phone_number and self.city and self.town)

    @property
    def team_members(self):
        return self.users.filter(is_team_account=True).filter(
            Q(partly_owned_property=None) | Q(partly_owned_property=self))

    @property
    def tracking_number(self):
        from .phone_number import PhoneNumber
        phone = PhoneNumber.objects.filter(property=self, type=PhoneNumber.TYPE_TRACKING,
                                           source__name='Standalone Website').first()
        return phonenumbers.format_number(phonenumbers.parse(str(phone.phone_number), 'US'),
                                          phonenumbers.PhoneNumberFormat.NATIONAL) if phone else None

    @property
    def sms_tracking_number(self):
        from .phone_number import PhoneNumber
        phone = PhoneNumber.objects.filter(property=self, type=PhoneNumber.TYPE_SMS).first()
        return phonenumbers.format_number(phonenumbers.parse(str(phone.phone_number), 'US'),
                                          phonenumbers.PhoneNumberFormat.NATIONAL) if phone else None

    @property
    def last_2_weeks_eligible_calls(self):
        return self.calls.filter(
            call_category='PROSPECT', is_removed=False, duration__gte=120,
            date__gte=self.timezone.localize(datetime.combine(timezone.now(), datetime.min.time())) - timedelta(days=14)
        ).exclude(call_result='no-answer').exclude(recording=None)

    def pull_resman_initials(self):
        from backend.api.tasks import pull_res_man_floor_plans, pull_res_man_prospect_sources, \
            pull_res_man_lost_prospect_reasons, \
            pull_res_man_employees
        pull_res_man_floor_plans_delayed = lambda: pull_res_man_floor_plans.delay(self.pk)
        connection.on_commit(pull_res_man_floor_plans_delayed)

        pull_res_man_prospect_sources_delayed = lambda: pull_res_man_prospect_sources.delay(self.pk)
        connection.on_commit(pull_res_man_prospect_sources_delayed)

        pull_res_man_lost_prospect_reasons_delayed = lambda: pull_res_man_lost_prospect_reasons.delay(self.pk)
        connection.on_commit(pull_res_man_lost_prospect_reasons_delayed)

        pull_res_man_employees_delayed = lambda: pull_res_man_employees.delay(self.pk)
        connection.on_commit(pull_res_man_employees_delayed)

    def pull_real_page_initials(self):
        from backend.api.tasks import pull_real_page_floor_plans, pull_real_page_prospect_sources, \
            pull_real_page_lost_reason, pull_real_page_employees, pull_real_page_pet_types, \
            pull_real_page_reason_for_moving, pull_real_page_pet_weights, pull_real_page_price_ranges, \
            pull_real_page_relationship_types
        pull_real_page_floor_plans_delayed = lambda: pull_real_page_floor_plans.delay(self.pk)
        connection.on_commit(pull_real_page_floor_plans_delayed)

        pull_real_page_prospect_sources_delayed = lambda: pull_real_page_prospect_sources.delay(self.pk)
        connection.on_commit(pull_real_page_prospect_sources_delayed)

        pull_real_page_lost_prospect_reasons_delayed = lambda: pull_real_page_lost_reason.delay(self.pk)
        connection.on_commit(pull_real_page_lost_prospect_reasons_delayed)

        pull_real_page_employees_delayed = lambda: pull_real_page_employees.delay(self.pk)
        connection.on_commit(pull_real_page_employees_delayed)

        pull_real_page_pet_types_delayed = lambda: pull_real_page_pet_types.delay(self.pk)
        connection.on_commit(pull_real_page_pet_types_delayed)

        pull_real_page_reason_for_moving_delayed = lambda: pull_real_page_reason_for_moving.delay(self.pk)
        connection.on_commit(pull_real_page_reason_for_moving_delayed)

        pull_real_page_pet_weights_delayed = lambda: pull_real_page_pet_weights.delay(self.pk)
        connection.on_commit(pull_real_page_pet_weights_delayed)

        pull_real_page_price_ranges_delayed = lambda: pull_real_page_price_ranges.delay(self.pk)
        connection.on_commit(pull_real_page_price_ranges_delayed)

        pull_real_page_relationship_types_delayed = lambda: pull_real_page_relationship_types.delay(self.pk)
        connection.on_commit(pull_real_page_relationship_types_delayed)

    def generate_business_hours(self):
        from backend.api.models import BusinessHours
        for weekday in range(0, 7):
            BusinessHours.objects.create(property=self, weekday=weekday)

    def generate_welcome_prospect_email_template(self):
        from backend.api.models import EmailTemplate
        subject = '[=Property name=] Inquiry'
        text = 'Hi <span><span class="email-placeholder">[=Lead first name=]</span>&nbsp;,&nbsp;</span><br /><br />' \
               'Thank you for considering <span><span class="email-placeholder">[=Property name=]</span>&nbsp;</span> as your next home. ' \
               'I&rsquo;m excited to help you with your BIG decision to move and we would love for you to consider us home. ' \
               'We look forward to meeting you and learning about what is most important to you in your home search.<br /><br />' \
               'We will be in touch by email. If you would prefer a call or text, just reply to this email and let us know.<br /><br />' \
               'Talk soon'
        EmailTemplate.objects.update_or_create(
            property=self, type=EmailTemplate.NEW_PROSPECT_WELCOME,
            defaults=dict(
                name='New Prospect Welcome Email',
                subject=subject,
                text=text,
                variables=['lead_first_name', 'property_name']
            )
        )

    def __str__(self):
        return self.name


class FloorPlan(BaseModel):
    plan = models.CharField(max_length=32)
    property = models.ForeignKey(Property, related_name='floor_plans', on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    bedrooms = models.FloatField(default=0)
    bathrooms = models.FloatField(default=0)
    square_footage = models.IntegerField(default=0)
    available = models.IntegerField(default=0)
    images = ArrayField(models.CharField(max_length=128), null=True, blank=True)
    min_rent = models.FloatField(default=0)
    max_rent = models.FloatField(default=0)
    external_id = models.CharField(max_length=16, null=True, blank=True)
    group_id = models.CharField(max_length=16, null=True, blank=True)

    def __str__(self):
        return self.plan


class Unit(BaseModel):
    STATUS_CHOICES = (('AVAILABLE', 'Available'), ('NOT_AVAILABLE', 'Not Available'),)
    unit = models.CharField(max_length=32)
    status = models.CharField(choices=STATUS_CHOICES, max_length=16, default='AVAILABLE')
    floor_plan = models.ForeignKey(FloorPlan, related_name='units', on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='units', on_delete=models.CASCADE, null=True, blank=True)
    market_rent = models.FloatField(default=0)
    effective_rent = models.FloatField(default=0)
    bed_rooms = models.IntegerField(default=0)
    lease_dates = models.JSONField(default=list)
    external_id = models.CharField(max_length=16, null=True, blank=True)
    smart_rent_unit_id = models.CharField(max_length=16, null=True, blank=True)
    can_be_toured = models.BooleanField(default=False)
    not_used_for_marketing = models.BooleanField(default=False)

    class Meta:
        unique_together = ['property', 'unit', 'floor_plan']

    def __str__(self):
        return '{} for floor plan type {}'.format(self.unit, self.floor_plan.plan)


class ProspectSource(BaseModel):
    property = models.ForeignKey(Property, related_name='sources', on_delete=models.CASCADE, null=True, blank=True)
    external_id = models.CharField(max_length=128, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    spends = models.JSONField(default=list, blank=True, null=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class ProspectLostReason(BaseModel):
    property = models.ForeignKey(Property, related_name='lost_reasons', on_delete=models.CASCADE, null=True)
    external_id = models.CharField(max_length=128, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.name


class ResManEmployee(models.Model):
    property = models.ForeignKey(Property, related_name='resman_employees', on_delete=models.CASCADE, null=True)
    email = models.CharField(max_length=150, blank=True)
    name = models.CharField(max_length=150, blank=True)
    external_id = models.CharField(max_length=128, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='res_man_employee', blank=True, null=True,
                             on_delete=models.SET_NULL)

    class Meta:
        verbose_name_plural = 'Resman employees'

    def __str__(self):
        return self.email


class RealPageEmployee(models.Model):
    property = models.ForeignKey(Property, related_name='real_page_employees', on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=128, blank=True)
    external_id = models.CharField(max_length=128, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='real_page_employee', blank=True, null=True,
                             on_delete=models.SET_NULL)

    class Meta:
        verbose_name_plural = 'RealPage employees'

    def __str__(self):
        return self.name


class CurrentResident(models.Model):
    property = models.ForeignKey(Property, related_name='current_residents', on_delete=models.CASCADE, null=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    mobile_phone = models.CharField(max_length=150, blank=True, null=True)
    home_phone = models.CharField(max_length=150, blank=True, null=True)
    work_phone = models.CharField(max_length=150, blank=True, null=True)
    person_id = models.CharField(max_length=128, blank=True, null=True)
    lease_start_date = models.DateField(blank=True, null=True)
    lease_end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class ReasonForMoving(models.Model):
    property = models.ForeignKey(Property, related_name='reason_for_moving', on_delete=models.CASCADE, null=True)
    external_id = models.CharField(max_length=16, blank=True, null=True)
    reason = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.reason


class PetType(models.Model):
    property = models.ForeignKey(Property, related_name='pet_types', on_delete=models.CASCADE, null=True)
    external_id = models.CharField(max_length=16, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    is_allowed = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PetWeight(models.Model):
    property = models.ForeignKey(Property, related_name='pet_weights', on_delete=models.CASCADE, null=True)
    external_id = models.CharField(max_length=16, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.name


class PriceRange(models.Model):
    property = models.ForeignKey(Property, related_name='price_ranges', on_delete=models.CASCADE, null=True)
    external_id = models.CharField(max_length=16, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.name


class RelationshipType(models.Model):
    property = models.ForeignKey(Property, related_name='relationship_types', on_delete=models.CASCADE)
    value = models.CharField(max_length=32, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.name
