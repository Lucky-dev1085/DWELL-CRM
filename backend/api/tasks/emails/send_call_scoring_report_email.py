import pytz

from datetime import datetime
from django.utils import timezone

from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from backend.api.models import Property, ScoredCall


@app.task
def send_call_scoring_report_email():
    """
    Send call scoring report email
    :return:
    """
    TZ = pytz.timezone('America/Phoenix')
    start_time = TZ.localize(
        datetime.combine(timezone.now().astimezone(tz=TZ).date(), datetime.min.time())
    )
    end_time = TZ.localize(
        datetime.combine(timezone.now().astimezone(tz=TZ).date(), datetime.max.time())
    )
    scored_properties = Property.objects.filter(is_calls_scored_today=True)

    from backend.api.views.reports.report_utils import get_call_score
    scored_calls = ScoredCall.objects.filter(
        property__in=scored_properties, call__date__range=(start_time, end_time)).exclude(
        rescore_status='REQUIRED')
    scores = get_call_score(list(scored_calls.values_list('id', flat=True)))

    call_score_sum = sum([score['score'] for score in scores if score])
    call_score_len = sum([len(score) for score in scores if score])
    average_call_score = round(call_score_sum / call_score_len, 1) if call_score_len else '---'

    ScoredCall.objects.filter(updated__gte=start_time, updated__lte=end_time)
    context = {
        'properties_count': scored_properties.count(),
        'general_avg': average_call_score
    }
    template = render_to_string('email/call_scoring_report_email/call_scoring_report_email.html', context)

    msg = EmailMultiAlternatives(
        # title:
        'Call scoring report',
        # message:
        None,
        # from:
        'hello@ils.dwell.io',
        # to:
        ['chao@liftlytics.com', 'support@liftlytics.com'])
    msg.attach_alternative(template, 'text/html')
    msg.send()
