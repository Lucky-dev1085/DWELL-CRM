from django.db import models

from backend.api.models import BaseModel, Property


class PageData(BaseModel):
    HOME = 'HOME'
    PROMOTION = 'PROMOTION'
    GALLERY = 'GALLERY'
    FLOOR_PLANS = 'FLOOR_PLANS'
    AMENITIES = 'AMENITIES'
    CONTACT = 'CONTACT'
    FOOTER = 'FOOTER'
    SEO = 'SEO'
    NEIGHBORHOOD = 'NEIGHBORHOOD'
    DESIGN = 'DESIGN'
    VIRTUAL_TOUR = 'VIRTUAL_TOUR'

    SECTION_CHOICES = ((HOME, 'HOME'), (PROMOTION, 'PROMOTION'), (GALLERY, 'GALLERY'),
                       (FLOOR_PLANS, 'FLOOR_PLANS'), (AMENITIES, 'AMENITIES'),
                       (CONTACT, 'CONTACT'), (FOOTER, 'FOOTER'), (SEO, 'SEO'), (NEIGHBORHOOD, 'NEIGHBORHOOD'),
                       (DESIGN, 'DESIGN'), (DESIGN, 'DESIGN'), (VIRTUAL_TOUR, 'VIRTUAL_TOUR'))

    property = models.ForeignKey(Property, related_name='page_data', on_delete=models.CASCADE)
    section = models.CharField(max_length=32, choices=SECTION_CHOICES)
    values = models.JSONField()

    def __str__(self):
        return self.property.name
