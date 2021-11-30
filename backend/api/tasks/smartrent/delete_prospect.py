import logging
from django.conf import settings
from django.db import transaction

from backend.celery_app import app
from backend.api.models import Lead
from .utils import check_tokens, get_smart_rent_response, reset_tokens
from .cancel_tour import cancel_tour


@app.task
def delete_prospect(lead_id, try_count=0):
    access_token = check_tokens()

    lead = Lead.objects.filter(id=lead_id).first()

    # cancel the tour
    for tour in lead.tasks.exclude(smart_rent_id=None).exclude(status='COMPLETED'):
        cancel_tour(lead.id, tour.id, remove_smart_rent_id=True)

    if not lead:
        logging.error(
            '[Smart Rent]: Lead with id - {} does not exist.'.format(lead_id))
        return

    headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

    prospect_id = lead.smart_rent_id
    create_prospect_url = 'https://{api_host}/mgmt-api/v1/prospects/{prospect_id}'.format(
        api_host=settings.SMART_RENT_HOST, prospect_id=prospect_id)
    response = get_smart_rent_response(create_prospect_url, request_type='DELETE', headers=headers)
    if response.status_code != 202:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return delete_prospect(lead_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Deleting SmartRent prospect was failed with {response.status_code} '
            f'status code {response.content}')
        return
    else:
        logging.info(f'[Smart Rent]: Deleting smart rent prospect was succeed.')
        with transaction.atomic():
            lead = Lead.objects.select_for_update().filter(id=lead_id).first()
            lead.smart_rent_id = None
            lead.save()
            lead.tasks.exclude(status='COMPLETED').delete()
        return lead
