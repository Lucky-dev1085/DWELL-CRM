from django.core.management.base import BaseCommand
from django.db import transaction
from backend.hobbes.models import Amenity
from backend.api.factories import Property


class Command(BaseCommand):
    help = 'Migrate amenities'

    @transaction.atomic
    def handle(self, *args, **options):
        for property in Property.objects.all():
            section = property.page_data.filter(section='AMENITIES').first()
            if section:
                values = section.values
                def get_parsed_columns(value):
                    left_columns = []
                    middle_columns = []
                    right_columns = []
                    for item in value['leftColumn']:
                        amenity = Amenity.objects.filter(name=item).first()
                        left_columns.append(
                            dict(category=amenity.category.id if amenity and amenity.category else None,
                                 description=item)
                        )

                    for item in value['middleColumn']:
                        amenity = Amenity.objects.filter(name=item).first()
                        middle_columns.append(
                            dict(category=amenity.category.id if amenity and amenity.category else None,
                                 description=item)
                        )

                    for item in value['rightColumn']:
                        amenity = Amenity.objects.filter(name=item).first()
                        right_columns.append(
                            dict(category=amenity.category.id if amenity and amenity.category else None,
                                 description=item)
                        )

                    value['amenitiesDetails'] = [left_columns, middle_columns, right_columns]
                    value.pop('leftList', None)
                    return value

                amenities_list = []

                amenities = values['amenities']
                amenities = get_parsed_columns(amenities)
                amenities['name'] = 'Amenities'
                amenities['isVisible'] = True

                community = values['community']
                community = get_parsed_columns(community)
                community['name'] = 'Community'
                amenities['isVisible'] = True

                amenities_list.append(amenities)
                amenities_list.append(community)

                for amenity in values.get('additionalAmenitiesSections', []):
                    amenity = get_parsed_columns(amenity)
                    amenities_list.append(amenity)

                values['amenitiesList'] = amenities_list
                values.pop('amenities', None)
                values.pop('community', None)
                values.pop('additionalAmenitiesSections', None)

                section.values = values
                section.save()
