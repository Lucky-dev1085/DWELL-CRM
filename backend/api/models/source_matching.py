from django.db import models

from .base import BaseModel


class SourceMatching(BaseModel):
    LH_source = models.CharField(max_length=128)
    ResMan_source = models.CharField(max_length=128)
