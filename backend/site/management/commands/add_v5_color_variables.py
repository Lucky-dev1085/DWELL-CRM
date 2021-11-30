import json

from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.factories import Property


class Command(BaseCommand):

    @transaction.atomic
    def handle(self, *args, **options):
        url = 'backend/api/static/site_data/page_data.json'
        with open(url, 'r') as file:
            content = file.read()
        page_data = json.loads(content)
        design_values = [section for section in page_data['data'] if section['section'] == 'DESIGN'][0]['values']

        for property in Property.objects.all():
            design = property.page_data.filter(section='DESIGN').first()
            if design:
                values = design.values

                values['customColors']['V5'] = design_values['customColors']['V5']
                values['labels'] = design_values['labels']
                values['customCssCodes']['V5'] = ''

                design.values = values
                design.save()
