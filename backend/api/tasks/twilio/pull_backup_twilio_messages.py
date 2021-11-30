import logging
import phonenumbers

from django.utils import timezone
from datetime import timedelta

from backend.celery_app import app
from backend.api.models import SMSContent, Lead
from backend.api.twilio_utils import search_sms_messages


@app.task
def pull_backup_twilio_messages():
    """
    Pull SMS from twilio for backup
    """
    for lead in Lead.objects.exclude(sms=None).order_by('phone_number', '-created').distinct('phone_number'):
        try:
            lead_number = phonenumbers.parse(lead.phone_number, 'US')
            lead_number = '+{}{}'.format(lead_number.country_code, lead_number.national_number)
            tracking_number = phonenumbers.parse(lead.property.sms_tracking_number, 'US')
            tracking_number = '+{}{}'.format(tracking_number.country_code, tracking_number.national_number)

            start_date = lead.last_twilio_backup_date if lead.last_twilio_backup_date else lead.created
            end_date = timezone.now() - timedelta(minutes=10)
            messages = search_sms_messages(lead_number, tracking_number, start_date, end_date)

            if not messages:
                continue

            sids = [sms.twilio_sid for sms in lead.sms.all()]
            missed_messages = [message for message in messages if message.sid not in sids]
            if len(missed_messages):
                logging.error('{} SMS incoming messages were missed for {} with lead {}'.format(
                    len(missed_messages), lead.property.name, lead.name))
                for message in missed_messages:
                    SMSContent.objects.create(twilio_sid=message.sid, sender_number=message.from_,
                                              receiver_number=message.to, message=message.body,
                                              status=message.status, lead=lead, property=lead.property,
                                              date=message.date_created)
            lead.last_twilio_backup_date = timezone.now() - timedelta(minutes=10)
            lead.save()
        except Exception as e:
            logging.error(e)
            pass
