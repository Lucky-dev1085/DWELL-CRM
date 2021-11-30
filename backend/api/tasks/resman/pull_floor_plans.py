import json
import requests
import logging
from xml.etree.ElementTree import fromstring
from xmljson import badgerfish as bf
from django.conf import settings

from backend.api.models import FloorPlan, Unit, Property
from backend.celery_app import app


@app.task
def pull_res_man_floor_plans(pk=None):
    """
    Pull floor plans / units from ResMan.
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
        response = requests.post('https://api.myresman.com/MITS/GetMarketing4_0', data=body, headers=headers)
        if response.status_code != 200:
            logging.error(
                f'Resman pulling floor plans of <{property.name}> failed'
            )
            continue

        content = bf.data(fromstring(response.content))['ResMan']
        unit_numbers = []
        if content.get('Status') == 'Failed':
            error_desc = content.get('ErrorDescription')
            logging.error(
                f'Resman pulling floor plans of <{property.name}> failed : {error_desc}'
            )
        else:
            units = content['Response']['PhysicalProperty']['Property'].get('ILS_Unit', [])
            floor_plan_ids = [unit['Units']['Unit']['UnitType']['$'] for unit in units]
            unit_ids = [unit['Units']['Unit']['Identification']['@IDValue'] for unit in units]
            Unit.objects.filter(property=property).exclude(unit__in=unit_ids).delete()
            FloorPlan.objects.filter(property=property).exclude(plan__in=floor_plan_ids).delete()
            floor_plans = content['Response']['PhysicalProperty']['Property'].get('Floorplan', [])
            unit_numbers = [str(unit['Units']['Unit']['Identification']['@IDValue']) for unit in units]

            for floor_plan in floor_plans:
                unit_type = floor_plan['@IDValue']
                available = floor_plan['UnitsAvailable']['$']
                beds = 0.0
                baths = 0.0
                for room in floor_plan['Room']:
                    if room['@RoomType'] == 'Bedroom':
                        beds = room['Count']['$']
                    if room['@RoomType'] == 'Bathroom':
                        baths = room['Count']['$']
                square_feet = floor_plan['SquareFeet'].get('@Avg')
                min_rent = floor_plan['EffectiveRent'].get('@Min')
                max_rent = floor_plan['EffectiveRent'].get('@Max')
                if floor_plan.get('File'):
                    files = floor_plan['File'] if type(floor_plan['File']) is list else [floor_plan['File']]
                else:
                    files = []
                images = []
                for file in files:
                    images.append(file['Src']['$'])

                FloorPlan.objects.update_or_create(
                    plan=unit_type,
                    property=property,
                    defaults=dict(
                        available=available,
                        bedrooms=beds,
                        bathrooms=baths,
                        square_footage=square_feet,
                        min_rent=min_rent,
                        max_rent=max_rent,
                        images=images
                    )
                )

            for unit in units:
                leased_status = unit['Units']['Unit']['UnitLeasedStatus']['$']
                leased_economic_status = unit['Units']['Unit']['UnitEconomicStatus']['$']
                leased_occupancy_status = unit['Units']['Unit']['UnitOccupancyStatus']['$']
                market_rent = unit['Units']['Unit']['MarketRent']['$']
                bed_rooms = unit['Units']['Unit']['UnitBedrooms']['$']
                effective_rent = 0
                term = unit['Pricing']['MITS-OfferTerm']
                for item in term if type(term) is list else [term]:
                    if item['Term']['$'] == 12:
                        effective_rent = item.get('EffectiveRent', {}).get('$', 0)
                if (leased_economic_status == 'residential' and leased_occupancy_status == 'vacant'
                    and leased_status == 'available')\
                        or (leased_economic_status == 'residential' and leased_occupancy_status == 'occupied'
                            and leased_status == 'on_notice'):
                    status = 'AVAILABLE'
                else:
                    status = 'NOT_AVAILABLE'
                unit_type = unit['Units']['Unit']['UnitType']['$']
                unit_id = unit['Units']['Unit']['Identification']['@IDValue']
                floor_plan, _ = FloorPlan.objects.get_or_create(plan=unit_type, property=property)
                Unit.objects.update_or_create(unit=unit_id, property=property,
                                              defaults=dict(floor_plan=floor_plan, status=status,
                                                            effective_rent=effective_rent, market_rent=market_rent,
                                                            bed_rooms=bed_rooms))

        response = requests.post('https://api.myresman.com/Property/GetUnits', data=body, headers=headers)
        if response.status_code != 200:
            logging.error(
                f'Resman pulling units of <{property.name}> failed'
            )
            continue
        else:
            content = json.loads(response.content)
            units = content.get('Units', [])
            additional_units = [unit for unit in units if unit.get('UnitNumber') not in unit_numbers]
            for unit in additional_units:
                floor_plan, _ = FloorPlan.objects.get_or_create(plan=unit['UnitType'], property=property)
                Unit.objects.update_or_create(
                    unit=unit['UnitNumber'], property=property, floor_plan=floor_plan, status='NOT_AVAILABLE',
                    not_used_for_marketing=True
                )
