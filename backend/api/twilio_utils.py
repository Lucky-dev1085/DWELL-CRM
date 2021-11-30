import backoff
import logging
from twilio.rest import Client

from django.conf import settings


@backoff.on_predicate(backoff.fibo, lambda x: x is None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def get_twilio_available_numbers(area_code):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        local = client.available_phone_numbers('US').local.list(
            area_code=area_code,
            limit=int(settings.TWILIO_AVAILABLE_NUMBER_LIMIT),
        )
        toll_free = client.available_phone_numbers('US').toll_free.list(
            area_code=area_code,
            limit=int(settings.TWILIO_AVAILABLE_NUMBER_LIMIT),
        )
        return local + toll_free
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x is None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def purchase_twilio_number(phone_number, is_sms_number, friendly_name):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        if is_sms_number:
            phone_number = client.incoming_phone_numbers.create(
                phone_number=phone_number,
                sms_application_sid=settings.TWIML_APPLICATION_SID,
                friendly_name=friendly_name
            )
        else:
            phone_number = client.incoming_phone_numbers.create(
                phone_number=phone_number,
                voice_url=f'https://webhooks.twilio.com/v1/Accounts/{settings.TWILIO_ACCOUNT_SID}'
                          f'/Flows/{settings.TWILIO_STUDIO_ID}',
                friendly_name=friendly_name
            )
        return phone_number
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x is None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def twilio_release_number(number_sid):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.incoming_phone_numbers(number_sid).delete()
        return True
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x is None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def send_twilio_message(body, sender, reciever):
    try:
        if not settings.TWILIO_ACCOUNT_SID:
            import uuid
            from collections import namedtuple
            from django.utils import timezone
            response = dict(date_created=timezone.now(), sid=str(uuid.uuid4()), body=body)
            return namedtuple('SMSResponse', response.keys())(*response.values())
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=sender,
            to=reciever,
            status_callback=settings.TWILIO_SMS_CALLBACK
        )
        return message
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x is None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def search_sms_messages(lead_number, tracking_number, start_date, end_date):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        received_messages = client.messages.list(date_sent_after=start_date, date_sent_before=end_date,
                                                 from_=lead_number, to=tracking_number)
        sent_messages = client.messages.list(date_sent_after=start_date, date_sent_before=end_date,
                                             from_=tracking_number, to=lead_number)
        return list(received_messages) + list(sent_messages)
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x == None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def retrieve_sms_details(sms_sid):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        sms_detail = client.messages(sms_sid).fetch()
        return sms_detail
    except Exception as e:
        logging.error(e)
        return None


@backoff.on_predicate(backoff.fibo, lambda x: x == None, max_tries=settings.MAX_TWILIO_RETRIES + 1)
def retrieve_studio_execution_context(flow_sid):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        execution = client.studio \
            .flows(settings.TWILIO_STUDIO_ID) \
            .executions(flow_sid) \
            .execution_context() \
            .fetch()
        return execution.context
    except Exception as e:
        logging.error(e)
        return None


def should_be_blocked_by_nomorobo(nomorobo_spamscore):
    if nomorobo_spamscore.get('status') != 'successful':
        return False
    else:
        score = nomorobo_spamscore['result'].get('score', 0)
        return score == 1


def should_be_blocked_by_marchex(marchex):
    if marchex.get('status') != 'successful':
        return False

    recommendation = marchex.get('result', {}).get('result', {}).get('recommendation')
    return recommendation == 'BLOCK'
