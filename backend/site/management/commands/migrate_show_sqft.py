from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.models import Property


class Command(BaseCommand):
    help = 'Migrate amenities and communities choices'

    @transaction.atomic
    def handle(self, *args, **options):
        for property in Property.objects.all():
            section = property.page_data.filter(section='FLOOR_PLANS').first()
            if section:
                values = section.values
                all_plans = values['allPlans']
                for plan in all_plans:
                    plan['show_sqft'] = True

                values['allPlans'] = all_plans
                section.values = values
                section.save()
