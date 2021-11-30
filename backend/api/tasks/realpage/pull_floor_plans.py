import logging

from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import Unit, FloorPlan
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_floor_plans(pk=None):
    """
    Pull floor plans / units from RealPage.
    :param pk: property pk
    :return:
    """
    try:
        if pk:
            properties = [Property.objects.get(pk=pk)]
        else:
            properties = Property.objects.filter(is_released=True).exclude(real_page_pmc_id=None)\
                .exclude(real_page_pmc_id='')
    except Property.DoesNotExist:
        return

    for property in properties:
        content = invoke_real_page_api('getfloorplanlist', property)
        plans = convert_to_list(bf.data(content.find('.//GetFloorPlanList'))['GetFloorPlanList']['FloorPlanObject'])

        plan_ids = []
        for plan in plans:
            instance, _ = FloorPlan.objects.update_or_create(
                external_id=str(plan.get('FloorPlanID', {}).get('$')),
                property=property,
                plan=plan.get('FloorPlanCode', {}).get('$'),
                defaults=dict(
                    description=plan.get('FloorPlanDescription', {}).get('$'),
                    bedrooms=plan.get('Bedrooms', {}).get('$'),
                    bathrooms=plan.get('Bathrooms', {}).get('$'),
                    square_footage=plan.get('RentableSquareFootage', {}).get('$'),
                    available=plan.get('MaximumOccupants', {}).get('$'),
                    min_rent=plan.get('RentMin', {}).get('$'),
                    max_rent=plan.get('RentMax', {}).get('$'),
                    group_id=plan.get('FloorPlanGroupID', {}).get('$')
                )
            )
            plan_ids.append(instance.pk)

        property.floor_plans.exclude(pk__in=plan_ids).delete()

        content = invoke_real_page_api('getunitsbyproperty', property)
        units = convert_to_list(bf.data(content.find('.//GetUnitsByProperty'))['GetUnitsByProperty']['UnitObject'])
        external_ids = [str(unit['UnitID']['$']) for unit in units]
        property.units.exclude(external_id__in=external_ids).delete()
        for unit in units:
            floor_plan = property.floor_plans.filter(external_id=unit['FloorplanID']['$']).first()
            if not floor_plan:
                logging.error(f"The unit {unit['UnitID']['$']} does not have floor plan {unit['FloorplanID']['$']}")
                continue
            Unit.objects.update_or_create(
                floor_plan=floor_plan,
                property=property,
                unit=unit['UnitNumber']['$'],
                external_id=unit['UnitID']['$'],
            )

        content = invoke_real_page_api('getunitlist', property)
        if content.find('.//UnitObjects'):
            units = convert_to_list(bf.data(content.find('.//UnitObjects'))['UnitObjects']['UnitObject'])
            available_unit_ids = [unit['Address']['UnitID']['$'] for unit in units]
            property.units.filter(external_id__in=available_unit_ids).update(status='AVAILABLE')
            property.units.exclude(external_id__in=available_unit_ids).update(status='NOT_AVAILABLE')
