from django.core.validators import RegexValidator
from django.db import models
import uuid

from timezone_field import TimeZoneField

from .base import BaseModel


class DemoTour(BaseModel):
    date = models.DateTimeField(null=True)
    external_id = models.UUIDField(max_length=64, unique=True, default=uuid.uuid4)
    is_cancelled = models.BooleanField(default=False)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    email = models.EmailField(max_length=64)
    phone_number = models.CharField(max_length=32, validators=[RegexValidator('\d+')])
    company = models.CharField(max_length=128)
    timezone = TimeZoneField(default='US/Central')
