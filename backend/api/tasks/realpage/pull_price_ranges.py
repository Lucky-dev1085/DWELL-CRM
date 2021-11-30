from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import PriceRange
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_price_ranges(pk=None):
    """
    Pull the price ranges from the Real Page.
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
        content = invoke_real_page_api('getpricerangesbyproperty', property)
        if not content:
            continue
        price_ranges = convert_to_list(bf.data(content.find('.//Contents'))['Contents']['PicklistItem'])
        external_ids = [str(price['Value']['$']) for price in price_ranges]
        PriceRange.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for price in price_ranges:
            PriceRange.objects.update_or_create(
                external_id=price['Value']['$'],
                property=property,
                name=price['Text']['$'],
            )
