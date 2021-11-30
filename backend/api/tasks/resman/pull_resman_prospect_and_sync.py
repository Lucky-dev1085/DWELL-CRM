import pytz
import logging
import threading
import requests
import backoff

from datetime import datetime, timedelta
from xml.etree.ElementTree import fromstring, ParseError
from xmljson import badgerfish as bf
from django.conf import settings
from django.utils import timezone

from backend.api.models import Lead, Property
from backend.celery_app import app
from backend.api.tasks.realpage.pull_resman_prospect_and_sync import sync_real_page_prospects_for_given_period
from .utils import fill_lead_fields_using_resman_data, headers, convert_to_list

lock = threading.Semaphore(settings.RESMAN_SYNC_API_THREAD_COUNT + 1)


@backoff.on_predicate(backoff.fibo, lambda response: response.status_code not in [200, 502],
                      max_tries=settings.MAX_PMS_SYNC_RETRIES + 1)
def get_response(url, body):
    return requests.post(url, data=body, headers=headers)


@app.task
def pull_prospect_and_sync_using_modified_date(is_hourly_mode=True):
    """
    Sync our leads using prospect data of Resman.
    :return:
    """
    default_start_time = timezone.now() - timedelta(hours=1)

    if datetime.now(tz=pytz.timezone('America/Phoenix')).hour not in range(7, 20):
        return

    if datetime.now(tz=pytz.timezone('America/Phoenix')).hour in [16, 17]:
        if is_hourly_mode:
            # For the all tasks coming at 4 ~ 6pm MST, we should not run hourly task.
            return
    elif not is_hourly_mode:
        # For the all tasks coming out of 4 ~ 6pm MST, we should not run task in every 15 minutes.
        return

    for property in Property.objects.filter(is_released=True):
        start_time = property.last_pms_sync_time

        if not property.last_pms_sync_time or start_time > timezone.now():
            start_time = default_start_time

        end_time = timezone.now()

        if property.real_page_pmc_id:
            if sync_real_page_prospects_for_given_period(property, start_time, end_time):
                property.last_pms_sync_time = end_time
                property.save()

        if property.resman_property_id:
            if sync_prospects_for_given_period(property, start_time, end_time):
                property.last_pms_sync_time = end_time
                property.save()


def sync_prospects_for_given_period(property, start_time, end_time):
    """
    This method will filter the prospects for given period and sync the prospects of Dwell
    :return: it will return True if it's successfully done.
    """
    body = dict(
        IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID,
        ApiKey=settings.RESMAN_API_KEY,
        AccountID=property.resman_account_id, PropertyID=property.resman_property_id,
        ModifiedStartDateTime=start_time, ModifiedEndDateTime=end_time
    )
    response = get_response('https://api.myresman.com/MITS/SearchProspects', body)
    logging.info(f'pull started - {start_time} ~ {end_time} for {property.name}')

    if response.status_code != 200:
        if response.status_code == 502 and 'buffer overflow' in str(response.content):
            logging.info(
                f'Reducing filter range of <{property.name}>'
            )
            delta = (end_time - start_time).total_seconds()
            if delta < 60:
                return False

            reduced_end_time = end_time - timedelta(seconds=delta / 2)
            sync_prospects_for_given_period(property, start_time, reduced_end_time)
            sync_prospects_for_given_period(property, reduced_end_time, end_time)
            return True
        else:
            logging.error(
                f'Pulling prospect of <{property.name}> was failed'
            )
            return False

    try:
        content = bf.data(fromstring(response.content))['ResMan']
    except ParseError as e:
        logging.error(e, response.content)
        return False

    prospects = None

    if content.get('Response'):
        prospects = content['Response']['LeadManagement']['Prospects']
    elif content.get('ErrorDescription'):
        logging.error(content['ErrorDescription'].get('$'))
        return False

    if not prospects:
        return True

    logging.info('have prospects')

    prospects = convert_to_list(prospects['Prospect'])

    for prospect in prospects:
        customer = convert_to_list(prospect['Customers']['Customer'])[0]

        identification = customer['Identification']
        resman_prospect_id = resman_person_id = None
        for item in identification:
            if item['@IDType'] == 'PersonID':
                resman_person_id = item['@IDValue']
            if item['@IDType'] == 'ProspectID':
                resman_prospect_id = item['@IDValue']

        lead = Lead.objects.filter(resman_prospect_id=resman_prospect_id,
                                   resman_person_id=resman_person_id).first()
        if lead:
            fill_lead_fields_using_resman_data(lead, prospect)

    return True
