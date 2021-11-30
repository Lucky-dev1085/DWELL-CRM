import json
import pytz
import pandas as pd

from django.core.management.base import BaseCommand
from django.db import transaction
from backend.hobbes.models import Amenity, AmenityCategory, SynonymMapping, HobbesAutoTestQuestion

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Create initial data from static csv files'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Create initial data from static csv files

        """
        # Amenity Categories
        data = pd.read_csv('backend/hobbes/static/template/amenity_category_and_synonyms.csv')

        for index, item in enumerate(data['Name']):
            synonyms = [i.strip() for i in str(data['Synonyms'][index]).split(',') if i.strip()]
            AmenityCategory.objects.update_or_create(name=item, defaults=dict(synonyms=synonyms))

        # Amenities
        data = pd.read_csv('backend/hobbes/static/template/amenities.csv')

        for index, item in enumerate(data['text']):
            category = AmenityCategory.objects.filter(name=data['label'][index]).first()
            Amenity.objects.update_or_create(name=item, defaults=dict(category=category))

        # Synonym Mapping
        with open('backend/hobbes/static/template/synonym_mappings.json') as f:
            synonym_mappings = json.load(f)
            for key in synonym_mappings.keys():
                SynonymMapping.objects.update_or_create(name=key, defaults=dict(synonyms=synonym_mappings[key]))

        # Auto Test Questions
        data = pd.read_csv('backend/hobbes/static/template/auto_test_questions.csv')
        data = data.where(pd.notnull(data), None)

        for index, item in enumerate(data['questions']):
            HobbesAutoTestQuestion.objects.update_or_create(
                question=item,
                defaults=dict(
                    positive_answer=data['positive answers'][index], negative_answer=data['negative answers'][index]
                )
            )
