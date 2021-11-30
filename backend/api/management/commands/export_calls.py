from datetime import datetime, timedelta

import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date

from backend.api.models import ScoredCall, CallScoringQuestion


class Command(BaseCommand):
    help = 'Export scored calls to excel'

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
        end_date = parse_date(options.get('end_date') or '2021-03-01')

        scored_calls = ScoredCall.objects.filter(call_date__gte=start_date, call_date__lte=end_date)
        row = []
        for scored_call in scored_calls:
            omitted_questions_list_ids = scored_call.omitted_questions.values_list('id', flat=True)
            yes_questions_list_ids = scored_call.questions.values_list('id', flat=True)
            all_questions = CallScoringQuestion.objects.all().order_by('order')

            call = scored_call.call

            # calculate call score after "omitted questions" update
            overall_weights = sum(
                [question.weight for question in CallScoringQuestion.objects.exclude(
                    pk__in=scored_call.omitted_questions.exclude(is_not_omitting=True).all())]
            )
            call_weights = sum([question.weight for question in scored_call.questions.all()])
            call_updated_score = round(call_weights * 100 / overall_weights, 1) if overall_weights != 0 else 0.0

            call_scheme = {
                'id': call.id,
                'Name': call.lead.name if call.lead else '',
                'Property': call.property,
                'Call Source': call.source,
                'Phone Number': call.prospect_phone_number,
                'Property Agent': scored_call.agent,
                'Call Duration': str(timedelta(seconds=call.duration)),
                'Date': call.date.astimezone(tz=call.property.timezone).strftime('%B %-d, %Y, %-I:%M %p'),
                'Score': f'{scored_call.score}%',
                'Updated score': f'{call_updated_score}%',
            }
            questions = {}
            for question in all_questions:
                marked = 'No'
                if question.id in omitted_questions_list_ids:
                    marked = 'Omitted'
                if question.id in yes_questions_list_ids:
                    marked = 'Yes'
                questions[f'Q{question.order} - {question.question}'] = marked
                questions[f'Q{question.order} - Weight'] = question.weight
            info = {**call_scheme, **questions}
            row.append(info)

        df = pd.DataFrame(row)
        time = datetime.now()
        df.to_excel(f'backend/api/static/call_scoring_data/call-scoring-data-{time}.xlsx', sheet_name='Calls',
                    index=False)
