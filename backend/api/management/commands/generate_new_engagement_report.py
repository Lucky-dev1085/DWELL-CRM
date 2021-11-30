from datetime import datetime, timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Report
from django.utils.dateparse import parse_date
from backend.api.tasks import generate_engagement_reports


class Command(BaseCommand):
    help = 'Regenerate engagement report'

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
        """
        Regenerate engagement report

        """
        start_date = datetime.combine(parse_date(options.get('start_date', '2020-01-01')), datetime.min.time())
        end_date = datetime.combine(parse_date(options.get('end_date', timezone.now().strftime('%Y-%m-%d'))),
                                    datetime.max.time())
        Report.objects.filter(date__range=(start_date.date(), end_date.date())).update(
                              lead_response_time_business=[], lead_response_time_non_business=[], sign_lease_time=[],
                              followups_number=[], followups_2_hours=[0, 0], followups_24_hours=[0, 0],
                              followups_48_hours=[0, 0], followups_more_48_hours=[0, 0])
        while start_date < end_date + timedelta(days=1):
            print(f'Starting --- {start_date}')
            generate_engagement_reports(start_date)
            start_date += timedelta(days=1)
