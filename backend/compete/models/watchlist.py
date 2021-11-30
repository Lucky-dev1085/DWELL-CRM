from django.db import models
from backend.api.models import BaseModel
from backend.compete.models import Property, Market, Submarket, Comparison
from backend.api.models import User

_property = property


class WatchList(BaseModel):
    property = models.ForeignKey(
        Property, related_name='watch_lists', blank=True, null=True, on_delete=models.SET_NULL
    )
    market = models.ForeignKey(
        Market, related_name='watch_lists', blank=True, null=True, on_delete=models.SET_NULL
    )
    submarket = models.ForeignKey(
        Submarket, related_name='watch_lists', blank=True, null=True, on_delete=models.SET_NULL
    )
    comparison = models.ForeignKey(
        Comparison, related_name='watch_lists', blank=True, null=True, on_delete=models.SET_NULL
    )
    user = models.ForeignKey(User, related_name='watch_lists', on_delete=models.CASCADE)
    is_stored = models.BooleanField(default=False)
