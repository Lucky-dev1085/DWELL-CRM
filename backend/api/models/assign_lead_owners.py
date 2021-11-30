from django.db import models

from backend.api.models import Property
from .base import BaseModel
from .user import User


class AssignLeadOwners(BaseModel):
    property = models.OneToOneField(Property, related_name='assign_lead_owner', null=True, on_delete=models.SET_NULL)
    is_enabled = models.BooleanField(default=False)
    monday = models.ForeignKey(User, related_name='assign_lead_owners_monday', blank=True, null=True,
                               on_delete=models.SET_NULL)
    tuesday = models.ForeignKey(User, related_name='assign_lead_owners_tuesday', blank=True, null=True,
                                on_delete=models.SET_NULL)
    wednesday = models.ForeignKey(User, related_name='assign_lead_owners_wednesday', blank=True, null=True,
                                  on_delete=models.SET_NULL)
    thursday = models.ForeignKey(User, related_name='assign_lead_owners_thursday', blank=True, null=True,
                                 on_delete=models.SET_NULL)
    friday = models.ForeignKey(User, related_name='assign_lead_owners_friday', blank=True, null=True,
                               on_delete=models.SET_NULL)
    saturday = models.ForeignKey(User, related_name='assign_lead_owners_saturday', blank=True, null=True,
                                 on_delete=models.SET_NULL)
    sunday = models.ForeignKey(User, related_name='assign_lead_owners_sunday', blank=True, null=True,
                               on_delete=models.SET_NULL)

    class Meta:
        verbose_name_plural = 'Assign lead owners'
