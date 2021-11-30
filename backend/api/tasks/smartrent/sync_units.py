from django.conf import settings

from backend.api.models import Property
from backend.celery_app import app
from .utils import get_pagination_response


@app.task
def sync_smart_rent_units(pk=None):
    """
    Pull the units from Smart Rent and add the smart rent id into matching unit
    """
    if pk:
        properties = [Property.objects.get(pk=pk)]
    else:
        properties = Property.objects.filter(is_released=True).exclude(smart_rent_group_id=None) \
            .exclude(smart_rent_group_id='')

    for property in properties:
        group_id = property.smart_rent_group_id
        unit_list_url = 'https://{api_host}/mgmt-api/v1/groups/{group_id}/units' \
            .format(api_host=settings.SMART_RENT_HOST, group_id=group_id)
        records = get_pagination_response(unit_list_url)

        unit_code = [item.get('unit_code').split('-')[0] for item in records]
        for item in records:
            unit = property.units.filter(unit=item.get('unit_code').split('-')[0]).first()
            if unit:
                unit.smart_rent_unit_id = item.get('id')
                unit.can_be_toured = item.get('can_be_toured', False)
                unit.save()
        property.units.exclude(unit__in=unit_code).update(smart_rent_unit_id=None)
