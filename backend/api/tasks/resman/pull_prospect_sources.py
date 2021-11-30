import json
import requests
import logging
from django.conf import settings

from backend.api.models import Property, ProspectSource
from backend.celery_app import app


@app.task
def pull_res_man_prospect_sources(pk=None):
    """
    Pull prospect sources from ResMan
    :param pk: property pk
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
                    AccountID=property.resman_account_id, PropertyID=property.resman_property_id)
        response = requests.post('https://api.myresman.com/Leasing/GetProspectSources', data=body,
                                 headers=headers)
        if response.status_code != 200:
            logging.error(
                f'Resman pulling prospect sources of <{property.name}> failed'
            )
            continue
        content = json.loads(response.content)
        sources = content.get('ProspectSources', [])
        # ProspectSource.objects.filter(property=property).exclude(
        #     external_id__in=[source['ID'] for source in sources]).delete()
        for source in sources:
            if source['Name'].lower() == 'telephone':
                continue
            ProspectSource.objects.update_or_create(property=property, name=source['Name'],
                                                    defaults=dict(external_id=source['ID']))
