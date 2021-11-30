from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import PetWeight
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_pet_weights(pk=None):
    """
    Pull the pet weights from RealPage.
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
        content = invoke_real_page_api('getpetweight', property)
        if not content:
            continue
        weights = convert_to_list(bf.data(content.find('.//Contents'))['Contents']['PicklistItem'])
        external_ids = [str(weight['Value']['$']) for weight in weights]
        PetWeight.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for weight in weights:
            PetWeight.objects.update_or_create(
                external_id=weight['Value']['$'],
                property=property,
                name=weight['Text']['$'],
            )
