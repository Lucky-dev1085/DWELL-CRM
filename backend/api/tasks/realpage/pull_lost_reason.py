from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import ProspectLostReason
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_lost_reason(pk=None):
    """
    Pull the lost reasons from RealPage.
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
        content = invoke_real_page_api('getactivitylossreasons', property)
        reason = convert_to_list(bf.data(content.find('.//Contents'))['Contents']['PicklistItem'])
        external_ids = [str(item['Value']['$']) for item in reason]
        ProspectLostReason.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for item in reason:
            ProspectLostReason.objects.update_or_create(
                external_id=item['Value']['$'],
                property=property,
                name=item['Text']['$']
            )
