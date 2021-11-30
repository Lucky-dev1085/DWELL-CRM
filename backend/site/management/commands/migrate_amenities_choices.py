from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.factories import Property


class Command(BaseCommand):
    help = 'Migrate amenities and communities choices'

    @transaction.atomic
    def handle(self, *args, **options):
        for property in Property.objects.all():
            section = property.page_data.filter(section='AMENITIES').first()
            if section:
                values = section.values
                count = len(values['amenities'].get('leftList', []))
                for index, item in enumerate(values['amenities'].get('leftList', [])):
                    if index < count / 3:
                        values['amenities']['leftColumn'] = (values['amenities'].get('leftColumn') or []) + [item]
                    elif index < count * 2 / 3:
                        values['amenities']['middleColumn'] = (values['amenities'].get('middleColumn') or []) + [item]
                    else:
                        values['amenities']['rightColumn'] = (values['amenities'].get('rightColumn') or []) + [item]

                count = len(values['community'].get('leftList', []))
                for index, item in enumerate(values['community'].get('leftList', [])):
                    if index < count / 3:
                        values['community']['leftColumn'] = (values['community'].get('leftColumn') or []) + [item]
                    elif index < count * 2 / 3:
                        values['community']['middleColumn'] = (values['community'].get('middleColumn') or []) + [item]
                    else:
                        values['community']['rightColumn'] = (values['community'].get('rightColumn') or []) + [item]

                section.values = values
                section.save()
