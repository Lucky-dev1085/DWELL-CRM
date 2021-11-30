import requests
import logging
from xml.etree.ElementTree import fromstring
from xmljson import badgerfish as bf
from django.conf import settings

from backend.api.models import Property
from backend.site.models import PageData
from backend.celery_app import app


@app.task
def pull_on_site_floor_plans(pk=None):
    """
    Pull floor plans from On Site.
    :param pk: property pk
    :return:
    """
    try:
        if pk:
            properties = [Property.objects.get(pk=pk)]
        else:
            properties = Property.objects.filter(is_released=True)
    except Property.DoesNotExist:
        return

    for property in properties:
        floor_plan = PageData.objects.filter(property=property, section=PageData.FLOOR_PLANS).first()
        if not floor_plan or floor_plan.values['feedSourceType'] != 'ON_SITE' or \
                not len(floor_plan.values['propertyIds']):
            continue

        credential = f'{settings.ON_SITE_USERNAME}:{settings.ON_SITE_PASSWORD}@'
        url = f'https://{credential}www.on-site.com/web/api/properties/{floor_plan.values["propertyIds"][0]}.xml'

        response = requests.get(url)
        if response.status_code != 200:
            logging.error(
                f'On Site pulling floor plans of <{property.name}> failed'
            )
            continue

        content = bf.data(fromstring(response.content))['property']['unit-styles']['unit-style']

        all_plans = []
        try:
            for plan in content:
                plan_data = dict(
                    description=plan.get('description', {}).get('$'),
                    propertyId=plan.get('property-id', {}).get('$'),
                    bedrooms=float(plan.get('num-bedrooms', {}).get('$') or 0),
                    bathrooms=float(plan.get('num-bathrooms', {}).get('$') or 0),
                    squareFootage=int(plan.get('square-footage', {}).get('$') or 0),
                    available=int(plan.get('num-available', {}).get('$') or 0),
                    images=[],
                    minRent=int(plan.get('min-rent', {}).get('$') or 0),
                    maxRent=int(plan.get('max-rent', {}).get('$') or 0),
                    minDeposit=int(plan.get('min-deposit', {}).get('$') or 0),
                    maxDeposit=int(plan.get('max-deposit', {}).get('$') or 0),
                    unitId=int(plan.get('style-id', {}).get('$') or 0),
                    isVisible=True
                )
                old_plan = next(
                    (plan for plan in floor_plan.values['allPlans'] if plan['description'] == plan_data['description']),
                    None
                )
                if old_plan:
                    plan_data['images'] = old_plan.get('images', [])
                    plan_data['isVisible'] = old_plan.get('isVisible', True)
                all_plans.append(plan_data)

            floor_plan.values['allPlans'] = all_plans
            floor_plan.save()
        except Exception as e:
            logging.error(e)
            logging.info(f'On-Site info for {property.name}')
            logging.info(content)
            continue
