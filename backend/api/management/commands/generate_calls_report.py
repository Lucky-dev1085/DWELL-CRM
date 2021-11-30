import pytz

from datetime import timedelta

from django.utils.dateparse import parse_date
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.tasks.reports.get_reports_data import generate_call_scoring_reports

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Generate call reports'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start_date',
            help="""Start date."""
        )

        parser.add_argument(
            '--end_date',
            help="""End date."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        day_count = 0

        start_date = parse_date(options.get('start_date', '2020-12-01'))
        end_date = parse_date(options.get('end_date', '2021-01-04'))

        while start_date + timedelta(days=day_count) < end_date:
            filter_date = start_date + timedelta(day_count)
            generate_call_scoring_reports(filter_date)
            print((start_date + timedelta(day_count)))
            day_count += 1
