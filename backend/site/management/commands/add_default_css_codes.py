import json

from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.models import Property


class Command(BaseCommand):
    help = 'Migrate amenities and communities choices'

    @transaction.atomic
    def handle(self, *args, **options):
        url = 'backend/api/static/site_data/page_data.json'
        with open(url, 'r') as file:
            content = file.read()
        page_data = json.loads(content)
        customCssCodes = [section for section in page_data['data'] if section['section'] == 'DESIGN'][0]['values']['customCssCodes']

        for property in Property.objects.all():
            section = property.page_data.filter(section='DESIGN').first()
            if section:
                values = section.values
                values['customCssCodes'] = customCssCodes
                section.values = values
                section.save()
