from django.db import models
from django.db.models import Avg, Sum
from backend.api.models import BaseModel

_property = property


class Portfolio(BaseModel):
    @_property
    def properties_count(self):
        return self.get_properties().count()

    @_property
    def units_count(self):
        return self.get_properties().aggregate(Sum('units_count')).get('units_count__sum')

    @_property
    def available_units_count(self):
        from .property import Unit
        return Unit.objects.filter(property__in=self.get_properties(), on_market=True).count()

    @_property
    def avg_rent(self):
        from backend.compete.models import Unit
        value = Unit.objects.filter(property__in=self.get_properties(), on_market=True)\
            .aggregate(Avg('rent')).get('rent__avg')
        return round(value, 2) if type(value) is float else None

    class Meta:
        abstract = True


class Market(Portfolio):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name

    @_property
    def properties(self):
        from .property import Property
        return Property.objects.filter(submarket__in=self.submarkets.all())

    def get_properties(self):
        return self.properties


class Submarket(Portfolio):
    name = models.CharField(max_length=64, unique=True)
    market = models.ForeignKey(Market, related_name='submarkets', on_delete=models.SET_NULL, null=True, blank=True)
    is_mtr_group = models.BooleanField(default=False)
    is_mt_exclusive_group = models.BooleanField(default=False)
    mtr_group = models.ForeignKey(
        'self', related_name='mtr_submarkets', on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.name

    def get_properties(self):
        from .property import Property
        if self.is_mtr_group:
            return Property.objects.filter(submarket__in=self.mtr_submarkets.all())
        if self.is_mt_exclusive_group:
            return self.mt_properties.all()
        return self.properties.all()
