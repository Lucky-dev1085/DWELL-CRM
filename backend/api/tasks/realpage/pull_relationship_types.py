from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import RelationshipType
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from xml.etree.ElementTree import Element
from .utils import invoke_real_page_api


@app.task
def pull_real_page_relationship_types(pk=None):
    """
    Pull the relationship types from RealPage.
    :param pk: property pk
    :return:
    """
    try:
        if pk:
            properties = [Property.objects.get(pk=pk)]
        else:
            properties = Property.objects.filter(is_released=True).exclude(real_page_pmc_id=None) \
                .exclude(real_page_pmc_id='')
    except Property.DoesNotExist:
        return

    type_node = Element('tem:lType')
    type_node.text = 'HOUSEHOLD_RELATIONSHIPS'

    for property in properties:
        content = invoke_real_page_api('getpicklistprospect', property, type_node)
        if not content:
            continue

        types = convert_to_list(bf.data(content.find('.//Contents')))[0]['Contents']['PicklistItem']
        external_ids = [str(item['Value']['$']) for item in types]
        RelationshipType.objects.filter(property=property).exclude(value__in=external_ids).delete()
        for item in types:
            RelationshipType.objects.update_or_create(
                value=item['Value']['$'],
                name=item['Text']['$'],
                property=property,
            )
