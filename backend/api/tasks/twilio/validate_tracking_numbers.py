from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

from twilio.rest import Client

from backend.celery_app import app
from backend.api.models import PhoneNumber


@app.task
def validate_tracking_numbers():
    """
    Check all tracking phone numbers have valid twilio sid
    """
    invalid_numbers = []
    for phone_number in PhoneNumber.objects.all():
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        try:
            client.incoming_phone_numbers(phone_number.twilio_sid).fetch()
        except Exception:
            invalid_numbers.append(dict(phone_number=phone_number.phone_number, twilio_sid=phone_number.twilio_sid))
            continue

    template = render_to_string(
        'email/invalid_tracking_numbers_report_email/invalid_tracking_numbers_report_email.html',
        {'invalid_numbers': invalid_numbers}
    )

    msg = EmailMultiAlternatives(
        # title:
        'Call Tracking SID Status Report',
        # message:
        None,
        # from:
        'hello@ils.dwell.io',
        # to:
        ['chao@liftlytics.com', 'support@liftlytics.com'])
    msg.attach_alternative(template, 'text/html')
    msg.send()
