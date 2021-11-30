import requests
import logging
from django.conf import settings

from backend.api.models import Property
from backend.celery_app import app


@app.task
def pull_historical_residents_by_unit():
    """
    Pull historical residents from Resman by unit.
    :return:
    """
    for property in Property.objects.filter(is_released=True).exclude(resman_property_id=None) \
            .exclude(resman_property_id=''):
        for unit in property.units.all():
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            body = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY,
                        AccountID=property.resman_account_id, PropertyID=property.resman_property_id, Unit=unit.unit)
            response = requests.post('https://api.myresman.com/Leasing/SearchResidents', data=body, headers=headers)
            if response.status_code != 200:
                logging.error(
                    f'Resman search residents of <{property.name}> - <{unit.unit}> has failed'
                )
                continue
            else:
                residents = response.json().get('Residents', [])
            for resident in residents:
                lease_date = dict(start_date=resident.get('LeaseStartDate'), end_date=resident.get('LeaseEndDate'))
                if lease_date not in unit.lease_dates:
                    unit.lease_dates += [lease_date]
            unit.save()
            print(f'successfully updated for {unit.unit}')
