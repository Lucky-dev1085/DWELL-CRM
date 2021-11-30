from django.db import models
from backend.api.models import BaseModel
from .property import Property


class History(BaseModel):
    property = models.ForeignKey(Property, related_name='histories', on_delete=models.CASCADE)
    item_id = models.CharField(max_length=32, null=True, blank=True)
    specials = models.CharField(max_length=512, null=True, blank=True)
    type = models.CharField(max_length=64, null=True, blank=True)
    floor_plan = models.CharField(max_length=64, null=True, blank=True)
    beds = models.FloatField(null=True, blank=True)
    baths = models.FloatField(null=True, blank=True)
    sqft = models.FloatField(null=True, blank=True)
    floor_plan_url = models.CharField(max_length=256, null=True, blank=True)
    apartment = models.CharField(max_length=32, null=True, blank=True)
    rent = models.FloatField(null=True, blank=True)
    available_date = models.CharField(max_length=64, null=True, blank=True)
    address = models.CharField(max_length=512, null=True, blank=True)
    phone = models.CharField(max_length=64, null=True, blank=True)
    website = models.CharField(max_length=512, null=True, blank=True)
    communities = models.TextField(null=True, blank=True)
    amenities = models.TextField(null=True, blank=True)
    unparsed_unit_type = models.CharField(max_length=128, null=True, blank=True)
    unparsed_rent = models.CharField(max_length=128, null=True, blank=True)
    unparsed_beds = models.CharField(max_length=128, null=True, blank=True)
    unparsed_baths = models.CharField(max_length=128, null=True, blank=True)
    unparsed_sqft = models.CharField(max_length=128, null=True, blank=True)
    s3_rows_count = models.IntegerField(default=0)
    s3_last_modified = models.DateTimeField(blank=True, null=True)
    scrapping_date = models.DateField()
    is_valuable = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.scrapping_date} - {self.property.name}'
