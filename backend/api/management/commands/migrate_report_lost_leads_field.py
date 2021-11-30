import pytz

from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import datetime, timedelta

from django.db.models import Q
from django.utils.dateparse import parse_date

from backend.api.models import Property, Report, Lead

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Migrate lost leads report field'

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
        Migrate lost leads report field

        """
        start_date = parse_date(options.get('start', '2021-02-01') or '2021-02-01')
        end_date = parse_date(options.get('end', '2021-02-17') or '2021-02-17')
        while start_date < end_date:
            start = TZ.localize(datetime.combine(start_date, datetime.min.time())).astimezone(tz=pytz.UTC)
            end = TZ.localize(datetime.combine(start_date, datetime.max.time())).astimezone(tz=pytz.UTC)
            lead_status_filter = (
                        Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test')))
            for property in Property.objects.filter(is_released=True):
                lost_leads = Lead.objects.filter(
                    lost_status_date__lte=end, lost_status_date__gte=start, status=Lead.LEAD_LOST, property=property
                ).exclude(Q(status=Lead.LEAD_TEST) | lead_status_filter).values_list('id', flat=True)
                Report.objects.filter(property=property, date=start_date).update(lost_leads=list(lost_leads))
            print(f'Date - {start_date}')
            start_date += timedelta(days=1)
