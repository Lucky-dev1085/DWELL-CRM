from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date

from backend.api.models import ScoredCall


class Command(BaseCommand):
    help = 'Remove specific omitted questions for scored calls'

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
        start_date = parse_date(options.get('start_date') or '2021-01-01')
        end_date = parse_date(options.get('end_date') or '2021-04-01')
        scored_calls = ScoredCall.objects.filter(call_date__gte=start_date, call_date__lte=end_date)
        for scored_call in scored_calls:
            questions = scored_call.omitted_questions.filter(is_not_omitting=True).all()
            if questions:
                scored_call.omitted_questions.remove(*questions)
