from django.db import models
from django.conf import settings
from .base import BaseModel
from .customer import Customer


class Client(BaseModel):
    STATUS_CHOICES = (('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'))

    name = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, blank=False)
    ping_dom_integrated = models.BooleanField(default=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='client', blank=True, null=True,
                                on_delete=models.SET_NULL)
    customer = models.ForeignKey(Customer, related_name='clients', blank=True, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
