from datetime import datetime, timedelta

import pytz
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from backend.api.models import Property, Report
from backend.api.views.reports import get_calls_data


class Command(BaseCommand):
    help = 'Regenerate calls report'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Regenerate calls report

        """
        TZ = pytz.timezone('America/Phoenix')
        start_date = datetime(2020, 5, 25).date()
        while start_date < timezone.now().date() + timedelta(days=1):
            start = TZ.localize(datetime.combine(start_date, datetime.min.time()))
            end = TZ.localize(datetime.combine(start_date, datetime.max.time()))
            for property in Property.objects.all():
                report = Report.objects.filter(property=property, date=start_date)
                if report:
                    calls_report_data = get_calls_data((start, end), [property])
                    report.update(
                        prospect_calls=calls_report_data['prospect_calls'],
                        call_time=calls_report_data['call_time'],
                        call_answered=calls_report_data['call_answered'],
                        call_missed=calls_report_data['call_missed'],
                        call_busy=calls_report_data['call_busy'],
                        call_failed=calls_report_data['call_failed'],
                        call_score=calls_report_data['call_score']
                    )
            print(start_date)
            start_date += timedelta(days=1)
