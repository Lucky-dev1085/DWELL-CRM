import pytz
from dateutil.parser import isoparse
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date

from backend.api.models import Report, Lead
from backend.api.views.reports.report_utils import get_next_working_date, is_business_hours_lead, \
    is_responded_before_closing


class Command(BaseCommand):
    help = 'Migrates lead response report data from hours to minutes'

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
        TZ = pytz.timezone('America/Phoenix')
        start_date = parse_date(options.get('start') or '2021-02-01')
        end_date = parse_date(options.get('end') or '2021-03-01')
        reports = Report.objects.filter(date__gte=start_date, date__lte=end_date).exclude(
            lead_response_time_business=[], lead_response_time_non_business=[])
        for report in reports:
            business_report_data = []
            non_business_report_data = []

            for item in report.lead_response_time_business:
                lead = Lead.objects.filter(pk=item.get('lead')).first()
                if not lead or not item.get('first_followup_date'):
                    continue
                followup_date = isoparse(item.get('first_followup_date'))
                if followup_date.astimezone(tz=TZ) > get_next_working_date(lead):
                    minutes = round(
                        (followup_date.astimezone(tz=TZ) - get_next_working_date(lead)).total_seconds() / 60, 1)
                else:
                    minutes = round((followup_date - lead.created).total_seconds() / 60, 1)
                business_report_data.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=item.get('first_followup_date'),
                        minutes=minutes,
                        type=item.get('type'),
                    ))
            report.lead_response_time_business = business_report_data

            for item in report.lead_response_time_non_business:
                lead = Lead.objects.filter(pk=item.get('lead')).first()
                if not lead or not item.get('first_followup_date'):
                    continue
                followup_date = isoparse(item.get('first_followup_date'))
                is_additional = is_business_hours_lead(lead) == 'NON_BUSINESS_ADDITIONAL'
                if not is_additional or is_responded_before_closing(lead, followup_date):
                    minutes = round((followup_date - lead.created).total_seconds() / 60, 1)
                else:
                    minutes = round(
                        (followup_date.astimezone(tz=TZ) - get_next_working_date(lead)).total_seconds() / 60, 1)
                non_business_report_data.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=item.get('first_followup_date'),
                        minutes=minutes,
                        type=item.get('type'),
                    )
                )
            report.lead_response_time_non_business = non_business_report_data
            report.save()
