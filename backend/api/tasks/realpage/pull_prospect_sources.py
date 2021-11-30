from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import ProspectSource
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


@app.task
def pull_real_page_prospect_sources(pk=None):
    """
    Pull the prospect sources from RealPage.
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
        content = invoke_real_page_api('getmarketingsourcesbyproperty', property)
        sources = convert_to_list(bf.data(content.find('.//Contents'))['Contents']['PicklistItem'])
        # external_ids = [str(employee['Value']['$']) for employee in employees]
        # ProspectSource.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for source in sources:
            if source['Text']['$'].lower() == 'telephone':
                continue
            choices = [source['Text']['$']]
            if 'Yelp' in source['Text']['$']:
                choices = ['Yelp', 'Yelp.com']
            if 'Facebook' in source['Text']['$']:
                choices = ['Facebook', 'Facebook.com']
            existing = property.sources.filter(name__in=choices, external_id=None).first()
            if existing:
                existing.external_id = source['Value']['$']
                existing.name = source['Text']['$']
                existing.save()
            else:
                ProspectSource.objects.update_or_create(
                    external_id=source['Value']['$'],
                    property=property,
                    name=source['Text']['$']
                )
