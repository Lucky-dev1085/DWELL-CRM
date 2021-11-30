from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from simple_history.models import HistoricalRecords

from .property import Property
from .base import BaseModel
from .client import Client
from .customer import Customer


class User(AbstractUser, BaseModel):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    C_ADMIN = 'CUSTOMER_ADMIN'
    G_ADMIN = 'GENERIC_ADMIN'
    P_ADMIN = 'PROPERTY_ADMIN'
    LL_ADMIN = 'LIFT_LYTICS_ADMIN'

    USER_ROLE_CHOICES = (
        (LL_ADMIN, 'Dwell Admin'), (G_ADMIN, 'Property Agent'), (C_ADMIN, 'Corporate'),
        (P_ADMIN, 'Property Manager'),
    )

    STATUS_CHOICES = (('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'))

    phone_number = models.CharField(blank=True, max_length=32)
    role = models.CharField(max_length=32, choices=USER_ROLE_CHOICES, blank=False)
    login_count = models.IntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, blank=False)
    properties = models.ManyToManyField(Property, related_name='users', blank=False)
    last_login_property = models.ForeignKey(Property, on_delete=models.SET_NULL, related_name='user_with_last_login',
                                            blank=True, null=True)
    is_password_changed = models.BooleanField(default=False)
    email = models.EmailField('email address', blank=False, unique=True, null=False)
    username = models.CharField(max_length=150, blank=True)
    clients = models.ManyToManyField(Client, related_name='users', blank=False)

    customer = models.ForeignKey(Customer, related_name='employee', null=True, blank=True, on_delete=models.CASCADE)
    is_super_customer = models.BooleanField(default=False)
    avatar = models.ImageField(blank=True, upload_to='userAvatar/', null=True)
    is_team_account = models.BooleanField(default=True)
    # edge case for direct manager who wants to have two roles.
    partly_owned_property = models.ForeignKey(Property, on_delete=models.SET_NULL, related_name='partial_owner',
                                              blank=True, null=True)
    ping_dom_integrated = models.BooleanField(default=False)
    has_advanced_reports_access = models.BooleanField(default=False)
    is_property_account = models.BooleanField(default=False)
    is_call_scorer = models.BooleanField(default=False)
    is_chat_reviewer = models.BooleanField(default=False)
    is_available = models.BooleanField(default=False)
    disable_notification = models.BooleanField(default=False)
    # for tracking user availability
    history = HistoricalRecords()
    last_property = models.ForeignKey(Property, on_delete=models.SET_NULL, related_name='user_with_last_property',
                                      blank=True, null=True)

    @property
    def name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    def properties_queryset(self):
        query = Q()

        if self.is_call_scorer:
            query |= Q(is_calls_scoring_enabled=True)
        if self.is_chat_reviewer:
            query |= Q(is_chat_reviewing_enabled=True)

        if self.is_call_scorer or self.is_chat_reviewer or self.role == self.G_ADMIN:
            query &= ~Q(platform='SITE_ONLY')

        return query

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.pk and User.objects.filter(email__iexact=self.email).exists():
            raise ValidationError({'email': ['User with this email address already exists.']})
        if not self.pk and self.is_call_scorer:
            self.is_team_account = False
        super(User, self).save(*args, **kwargs)
