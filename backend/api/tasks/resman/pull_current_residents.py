import requests
import logging
from django.conf import settings
from django.utils.dateparse import parse_date

from backend.api.models import Property, CurrentResident
from backend.celery_app import app


@app.task
def pull_res_man_current_residents():
    """
    Pull current residents from ResMan.
    :return:
    """
    for property in Property.objects.filter(is_released=True).exclude(resman_property_id=None) \
            .exclude(resman_property_id=''):
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        body = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY,
                    AccountID=property.resman_account_id, PropertyID=property.resman_property_id)
        response = requests.post('https://api.myresman.com/Leasing/GetApplicantsAndCurrentResidents', data=body,
                                 headers=headers)
        if response.status_code != 200:
            logging.error(
                f'Resman pulling current residents of <{property.name}> failed'
            )
            continue
        else:
            residents = response.json().get('People', [])
        for resident in residents:
            CurrentResident.objects.update_or_create(
                property=property,
                person_id=resident.get('PersonID'),
                defaults=dict(
                    first_name=resident.get('FirstName'),
                    last_name=resident.get('LastName'),
                    mobile_phone=resident.get('MobilePhone'),
                    work_phone=resident.get('WorkPhone'),
                    home_phone=resident.get('HomePhone'),
                    lease_start_date=parse_date(resident.get('LeaseStartDate')),
                    lease_end_date=parse_date(resident.get('LeaseEndDate')),
                )
            )

            # todo we should enable this logic when we resolve the LTN issue with ResMan support
            # unit = Unit.objects.filter(property=property, unit=resident.get('Unit')).first()
            # if unit:
            #     lease_date = dict(start_date=resident.get('LeaseStartDate'), end_date=resident.get('LeaseEndDate'))
            #     if lease_date not in unit.lease_dates:
            #         unit.lease_dates += [lease_date]
            #     unit.save()

        person_ids = [resident.get('PersonID') for resident in residents]
        CurrentResident.objects.filter(property=property).exclude(person_id__in=person_ids).delete()
