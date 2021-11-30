import pytz

from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date

from backend.api.models import Property, Report
from backend.api.views.reports.report_utils import calculate_lead_source_data

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Migrate invalid call date'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start',
            help="""Start date."""
        )

        parser.add_argument(
            '--end',
            help="""End date."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Pulls removed calls

        """
        start_date = parse_date(options.get('start', '2021-02-01'))
        end_date = parse_date(options.get('end', '2021-02-17'))
        while start_date < end_date:
            start = TZ.localize(datetime.combine(start_date, datetime.min.time())).astimezone(tz=pytz.UTC)
            end = TZ.localize(datetime.combine(start_date, datetime.max.time())).astimezone(tz=pytz.UTC)
            for property in Property.objects.filter(is_released=True):
                lead_source_data = calculate_lead_source_data((start, end), [property])
                Report.objects.filter(property=property, date=start_date).update(sources=lead_source_data)
            print(f'Date - {start_date}')
            start_date += timedelta(days=1)
