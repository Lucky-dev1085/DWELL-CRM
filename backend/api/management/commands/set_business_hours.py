from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Property, BusinessHours


class Command(BaseCommand):
    help = 'Sets business hours'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domains',
            help="""Please specify property domains separate using comma."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Sets business hours

        """
        domains = options.get('domains', None)
        properties_closed_on_sunday = domains.split(',') if domains else []
        for property in Property.objects.all():
            for weekday in range(0, 7):
                is_workday = not (weekday == 6 and property.domain in properties_closed_on_sunday)
                BusinessHours.objects.create(property=property, weekday=weekday, is_workday=is_workday)
                print('{} - {} - workday: {}'.format(property.name, weekday, is_workday))
