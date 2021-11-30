import json
import requests
from django.conf import settings

from backend.api.models import Property
from backend.site.models import PageData
from backend.celery_app import app


@app.task
def pull_yardi_floor_plans(pk=None):
    """
    Pull floor plans from Yardi.
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
        if not floor_plan or floor_plan.values['feedSourceType'] != 'YARDI' or \
                not len(floor_plan.values['propertyIds']):
            continue

        yardi_id_types = ['propertyId', 'voyagerPropertyId', 'voyagerPropertyCode', 'propertyCode']
        for id_type in yardi_id_types:
            url = f'https://api.rentcafe.com/rentcafeapi.aspx?requestType=floorplan&apiToken={settings.YARDI_TOKEN}' \
                  f'&{id_type}={floor_plan.values["propertyIds"][0]}'

            response = requests.get(url)
            if response.status_code != 200 or 'Error' in str(response.content):
                continue

            content = json.loads(response.content)

            all_plans = []
            for plan in content:
                plan_data = dict(
                    description=plan['FloorplanName'],
                    propertyId=int(plan['PropertyId']),
                    bedrooms=float(plan['Beds']),
                    bathrooms=float(plan['Baths']),
                    squareFootage=int(plan['MinimumSQFT']),
                    available=int(plan['AvailableUnitsCount']),
                    images=[
                        dict(src=(image or '').replace(' ', '%20')) for image in plan['FloorplanImageURL'].split(',')
                    ],
                    minRent=int(plan['MinimumRent']),
                    maxRent=int(plan['MaximumRent']),
                    minDeposit=int(plan['MinimumDeposit']),
                    maxDeposit=int(plan['MaximumDeposit']),
                    isVisible=True
                )
                old_plan = next(
                    (plan for plan in floor_plan.values['allPlans'] if plan['description'] == plan_data['description']),
                    None
                )
                if old_plan:
                    plan_data['images'] = old_plan['images']
                    plan_data['isVisible'] = old_plan['isVisible']
                all_plans.append(plan_data)

            floor_plan.values['allPlans'] = all_plans
            floor_plan.save()
            break
