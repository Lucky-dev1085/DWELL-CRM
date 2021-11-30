from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.models import Property


class Command(BaseCommand):
    help = 'Add virtual tour type'

    @transaction.atomic
    def handle(self, *args, **options):
        for property in Property.objects.all():
            section = property.page_data.filter(section='VIRTUAL_TOUR').first()
            if section:
                values = section.values
                pano_id = values.get('panoId')
                if pano_id:
                    values['virtualTourType'] = 'PANOSKIN'

                    section.values = values
                    section.save()
