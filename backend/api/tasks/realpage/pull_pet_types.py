from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import PetType
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_pet_types(pk=None):
    """
    Pull the pet types from RealPage.
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

    for property in properties:
        content = invoke_real_page_api('getpettypes', property)
        if not content:
            continue
        pets = convert_to_list(bf.data(content.find('.//pettypelist'))['pettypelist']['pettype'])
        external_ids = [str(pet['pettypecode']['$']) for pet in pets]
        PetType.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for pet in pets:
            PetType.objects.update_or_create(
                external_id=pet['pettypecode']['$'],
                property=property,
                name=pet['pettypedisplayname']['$'],
                is_allowed=pet['pettypeallowed']['$']
            )
