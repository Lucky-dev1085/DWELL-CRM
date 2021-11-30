from backend.celery_app import app
from backend.hobbes.models import Amenity, AmenityCategory
from backend.site.models import PageData


@app.task
def populate_amenities():
    amenities = []
    communities = []
    for page_data in PageData.objects.filter(section='AMENITIES'):
        for amenity in page_data.values['amenitiesList']:
            if amenity['name'] == 'Amenities':
                for column in amenity['amenitiesDetails']:
                    amenities += [item for item in column]

            if amenity['name'] == 'Community':
                for column in amenity['amenitiesDetails']:
                    communities += [item for item in column]

    for amenity in amenities + communities:
        category = AmenityCategory.objects.filter(pk=amenity['category']).first()
        Amenity.objects.update_or_create(name=amenity['description'], defaults=dict(category=category))
