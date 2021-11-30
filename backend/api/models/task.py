from django.db import models
from django.conf import settings
from datetime import timedelta
from django.utils import timezone

from .base import BaseModel
from .lead import Lead, Property
from .property import Unit
from .authentication import VendorAuth

property_decorator = property


class Task(BaseModel):
    TASK_OPEN = 'OPEN'
    TASK_COMPLETED = 'COMPLETED'
    TOUR_PENDING = 'PENDING'
    TOUR_NO_SHOW = 'NO_SHOW'
    TOUR_CANCELLED = 'CANCELLED'
    STATUS_CHOICES = (
        (TASK_OPEN, 'Open'), (TASK_COMPLETED, 'Completed'), (TOUR_PENDING, 'Pending'), (TOUR_NO_SHOW, 'No Show'),
        (TOUR_CANCELLED, 'Cancelled')
    )

    TYPE_CALL = 'CALL'
    TYPE_EMAIL = 'EMAIL'
    TYPE_TODO = 'TODO'
    TYPE_TOUR = 'TOUR'
    OLD_TYPE_CHOICES = ((TYPE_CALL, 'Call'), (TYPE_EMAIL, 'Email'), (TYPE_TODO, 'To-do'), (TYPE_TOUR, 'Tour'), )

    TYPE_FOLLOW_FIRST = 'FIRST_FOLLOWUP'
    TYPE_FOLLOW_SECOND = 'SECOND_FOLLOWUP'
    TYPE_FOLLOW_THIRD = 'THIRD_FOLLOWUP'
    TYPE_FINAL_FOLLOWUP = 'FINAL_FOLLOWUP'
    TYPE_FUTURE_DATE_FOLLOWUP = 'FUTURE_DATE_FOLLOWUP'
    TYPE_CHECK_APP = 'CHECK_APP'
    TYPE_CHECK_DOCS = 'CHECK_DOCS'
    TYPE_PRICE_AVAILABILITY = 'PRICE_AVAILABILITY'
    TYPE_VIRTUAL_TOUR = 'VIRTUAL_TOUR'
    TYPE_TOUR = 'TOUR'
    TYPE_GUIDED_VIRTUAL_TOUR = 'GUIDED_VIRTUAL_TOUR'
    TYPE_IN_PERSON = 'IN_PERSON'
    TYPE_FACETIME = 'FACETIME'
    TYPE_SELF_GUIDED_TOUR = 'SELF_GUIDED_TOUR'

    TYPE_CHOICES = (
        (TYPE_FOLLOW_FIRST, 'First Follow-up'), (TYPE_FOLLOW_SECOND, 'Second Follow-up'),
        (TYPE_FOLLOW_THIRD, 'Third Follow-up'), (TYPE_FINAL_FOLLOWUP, 'Final Follow-up'),
        (TYPE_FUTURE_DATE_FOLLOWUP, 'Future Date Follow-up'), (TYPE_CHECK_APP, 'Check for Application'),
        (TYPE_CHECK_DOCS, 'Check for Documents'), (TYPE_PRICE_AVAILABILITY, 'Send New Price/Availability'),
        (TYPE_TOUR, 'Schedule Tour'), (TYPE_VIRTUAL_TOUR, 'Schedule Virtual Tour'),
        (TYPE_GUIDED_VIRTUAL_TOUR, 'Schedule Guided Virtual Tour'), (TYPE_IN_PERSON, 'Schedule In-Person Tour'),
        (TYPE_FACETIME, 'Schedule Facetime Tour'), (TYPE_SELF_GUIDED_TOUR, 'Schedule Self-Guided Tour')
    )

    TOUR_TYPES = dict(VIRTUAL_TOUR='Virtual tour', GUIDED_VIRTUAL_TOUR='Guided Virtual tour',
                      IN_PERSON='In-Person tour', FACETIME='Facetime tour', SELF_GUIDED_TOUR='Self-Guided tour',
                      TOUR='Tour')

    old_title = models.CharField(max_length=128, null=True, blank=True)
    description = models.CharField(max_length=1024, blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=TASK_OPEN)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, default=TYPE_FOLLOW_FIRST)
    old_type = models.CharField(max_length=32, choices=OLD_TYPE_CHOICES, null=True, blank=True)
    due_date = models.DateField(blank=True, null=True)
    units = models.ManyToManyField(Unit, related_name='tours', blank=True)
    tour_date = models.DateTimeField(null=True, blank=True)
    lead = models.ForeignKey(Lead, related_name='tasks', null=True, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='tasks', null=True, on_delete=models.SET_NULL)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='tasks', blank=True, null=True,
                              on_delete=models.SET_NULL)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='actor_tasks', blank=True, null=True,
                              on_delete=models.SET_NULL)
    tour_confirmation_reminder_enabled = models.BooleanField(default=True)
    smart_rent_id = models.IntegerField(null=True, blank=True)
    vendor = models.ForeignKey(VendorAuth, related_name='tasks', on_delete=models.SET_NULL, null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)
    is_created_through_chat = models.BooleanField(default=False)

    def __str__(self):
        return str(self.type) if self.type else ''

    @property_decorator
    def title(self):
        return Task.TOUR_TYPES[self.type] \
            if self.type in self.TOUR_TYPES.keys() else dict(Task.TYPE_CHOICES).get(self.type)

    @property_decorator
    def active_event(self):
        return self.events.order_by('-created').first()

    def set_reminder(self):
        from backend.api.tasks import send_tour_confirmation_one_day_reminder
        from backend.api.tasks.nylas.email_auto_sequences import send_tour_confirmation_one_hour_reminder

        if not self.tour_confirmation_reminder_enabled:
            return

        if timezone.now() < self.tour_date - timedelta(days=1):
            task = send_tour_confirmation_one_day_reminder.apply_async([self.lead.pk, self.pk],
                                                                       eta=self.tour_date - timedelta(days=1))
            self.lead.confirmation_reminder_async_id = task.id

        if timezone.now() < self.tour_date - timedelta(hours=1):
            sms_task = send_tour_confirmation_one_hour_reminder.apply_async([self.lead.pk, self.pk],
                                                                            eta=self.tour_date - timedelta(hours=1))
            self.lead.confirmation_sms_reminder_async_id = sms_task.id

        self.lead.save()

    def save(self, **kwargs):
        tour_date_changed = False
        old_task = Task.objects.filter(pk=self.pk).first()
        if old_task and old_task.tour_date != self.tour_date:
            tour_date_changed = True

        tour_types = [Task.TYPE_TOUR, Task.TYPE_IN_PERSON, Task.TYPE_FACETIME, Task.TYPE_GUIDED_VIRTUAL_TOUR]

        auto_sequence_condition = self.tour_date and self.type in tour_types \
                                  and self.property.nylas_status == Property.NYLAS_STATUS_CONNECTED
        if tour_date_changed and auto_sequence_condition:
            self.set_reminder()

        if old_task and old_task.is_cancelled != self.is_cancelled and self.is_cancelled:
            self.status = self.TOUR_CANCELLED

        if old_task and old_task.status != self.status and self.status == self.TOUR_CANCELLED:
            self.is_cancelled = True

        super(Task, self).save(kwargs)

        if not old_task and self.pk and auto_sequence_condition:
            self.set_reminder()
