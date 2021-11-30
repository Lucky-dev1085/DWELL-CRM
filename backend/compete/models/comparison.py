from django.db import models
from backend.api.models import BaseModel, User
from .property import Property
from .portfolio import Market, Submarket


class Comparison(BaseModel):
    MARKET = 'MARKET'
    SUB_MARKET = 'SUB_MARKET'
    PROPERTY = 'PROPERTY'
    COMPETITORS = 'COMPETITORS'
    SUBJECT_ASSET_TYPES = (
        (SUB_MARKET, 'SUB_MARKET'), (PROPERTY, 'PROPERTY')
    )
    COMPARED_ASSET_TYPES = (
        (MARKET, 'MARKET'), (SUB_MARKET, 'SUB_MARKET'), (PROPERTY, 'PROPERTY'), (COMPETITORS, 'COMPETITORS')
    )

    subject_asset_type = models.CharField(choices=SUBJECT_ASSET_TYPES, max_length=32, default=SUB_MARKET)
    compared_asset_type = models.CharField(choices=COMPARED_ASSET_TYPES, max_length=32, default=MARKET)
    market = models.ForeignKey(Market, related_name='comparisons', on_delete=models.CASCADE, null=True, blank=True)
    submarket = models.ForeignKey(Submarket, related_name='comparisons', on_delete=models.CASCADE,
                                  null=True, blank=True)
    subject_property = models.ForeignKey(Property, related_name='subject_comparisons', on_delete=models.CASCADE,
                                         null=True, blank=True)
    compared_property = models.ForeignKey(Property, related_name='compared_comparisons', on_delete=models.CASCADE,
                                          null=True, blank=True)
    subject_sub_market = models.ForeignKey(Submarket, related_name='subject_comparisons', on_delete=models.CASCADE,
                                           null=True, blank=True)
    compared_sub_market = models.ForeignKey(Submarket, related_name='compared_comparisons', on_delete=models.CASCADE,
                                            null=True, blank=True)
    competitor_property = models.ForeignKey(Property, related_name='competitor_comparisons', on_delete=models.CASCADE,
                                            null=True, blank=True)
    user = models.ForeignKey(User, related_name='comparisons', on_delete=models.CASCADE)

    def get_subject_assets(self):
        if self.subject_asset_type == 'PROPERTY':
            return Property.objects.filter(pk=self.subject_property.pk)
        if self.subject_asset_type == 'SUB_MARKET':
            return self.subject_sub_market.get_properties()

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}: {self.subject_asset_type} <> {self.compared_asset_type}'
