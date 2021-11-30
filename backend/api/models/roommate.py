from django.db import models
from django.conf import settings

from backend.api.models import Property, RelationshipType
from .base import BaseModel
from .lead import Lead


class Roommate(BaseModel):
    RELATIONSHIP_SPOUSE = 'SPOUSE'
    RELATIONSHIP_PARTNER = 'PARTNER'
    RELATIONSHIP_CHILD = 'CHILD'
    RELATIONSHIP_ROOMMATE = 'ROOMMATE'
    RELATIONSHIP_CHOICES = ((RELATIONSHIP_SPOUSE, 'Spouse'), (RELATIONSHIP_PARTNER, 'Partner'),
                            (RELATIONSHIP_ROOMMATE, 'Roommate'), (RELATIONSHIP_CHILD, 'Child'),)

    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    relationship = models.ForeignKey(RelationshipType, related_name='roommates', null=True, on_delete=models.CASCADE)
    email = models.EmailField(max_length=64, blank=True, null=True)
    phone_number = models.CharField(max_length=32, blank=True, null=True)
    lead = models.ForeignKey(Lead, related_name='roommates', null=True, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='roommates', null=True, on_delete=models.SET_NULL)
    resman_person_id = models.CharField(max_length=64, null=True, blank=True)
    real_page_customer_id = models.CharField(max_length=64, null=True, blank=True)

    def sync_room_mates(self):
        from backend.api.tasks import sync_real_page_room_mates, sync_res_man_room_mates
        if not settings.ALLOW_PMS_SYNC:
            self.lead.pms_sync_status = 'NOT_STARTED'
            self.lead.save()
            return
        if self.property.resman_property_id:
            return lambda: sync_res_man_room_mates.delay(self.pk)
        if self.property.real_page_site_id:
            return lambda: sync_real_page_room_mates.delay(self.pk)
