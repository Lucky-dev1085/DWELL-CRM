import json
import requests
import logging
from django.conf import settings

from backend.api.models import Property, ProspectLostReason
from backend.celery_app import app


@app.task
def pull_res_man_lost_prospect_reasons(pk=None):
    """
    Pull lost prospect reasons choices from ResMan
    :param pk:
    :return:
    """
    try:
        if pk:
            properties = [Property.objects.get(pk=pk)]
        else:
            properties = Property.objects.filter(is_released=True).exclude(resman_property_id=None) \
                .exclude(resman_property_id='')
    except Property.DoesNotExist:
        return
    for property in properties:
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        body = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY,
                    AccountID=property.resman_account_id)
        response = requests.post('https://api.myresman.com/Leasing/GetLostProspectReasons', data=body,
                                 headers=headers)
        if response.status_code != 200:
            logging.error(
                f'Resman pulling lost prospect reasons sync of <{property.name}> failed'
            )
            continue
        content = json.loads(response.content)
        reasons = content.get('LostProspectReasons', [])
        for reason in reasons:
            ProspectLostReason.objects.update_or_create(external_id=reason['ID'], name=reason['Name'], property=property)
