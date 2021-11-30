import calendar
from datetime import timedelta

from django.utils.dateparse import parse_date
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.hobbes.tasks.populate_chat_evaluation_data import populate_chat_evaluation_data


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--start_date',
            help="""Start date."""
        )

        parser.add_argument(
            '--end_date',
            help="""End date."""
        )

        parser.add_argument(
            '--property',
            help="""Property name. If not provided - will do for all"""
        )

        parser.add_argument(
            '--days',
            help="""nUmber of days from start of month to pull data for. If not provided - will do for 7 days"""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        start_date = parse_date(options.get('start_date', '2021-07-01'))
        end_date = parse_date(options.get('end_date', '2021-07-07'))
        property_name = options.get('property')
        number_of_days = options.get('days', 7)

        start_of_month = start_date
        first_day_of_end_month = end_date.replace(day=1)

        while start_of_month < end_date:
            days_count_of_month = calendar.monthrange(start_of_month.year, start_of_month.month)[1]
            if start_of_month.replace(day=1) == first_day_of_end_month:
                end_of_month = end_date
            else:
                end_of_month = start_of_month.replace(day=days_count_of_month)

            populate_chat_evaluation_data(start_date=start_of_month, end_date=end_of_month,
                                          property_name=property_name, days=number_of_days)
            start_of_month += timedelta(days=days_count_of_month)
