import logging
from django.conf import settings

from backend.celery_app import app
from backend.api.models import Lead
from .utils import check_tokens, get_smart_rent_response, reset_tokens


@app.task
def update_prospect(lead_id, try_count=0):
    access_token = check_tokens()

    lead = Lead.objects.filter(id=lead_id).first()
    if not lead:
        logging.error(
            '[Smart Rent]: Lead with id - {} does not exist.'.format(lead_id))
        return

    headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

    prospect_id = lead.smart_rent_id
    create_prospect_url = 'https://{api_host}/mgmt-api/v1/prospects/{prospect_id}'.format(
        api_host=settings.SMART_RENT_HOST, prospect_id=prospect_id)
    prospect_data = dict(desired_move_in_date=str(lead.move_in_date))
    response = get_smart_rent_response(create_prospect_url, request_type='PATCH', data=prospect_data, headers=headers)
    if response.status_code != 200:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return update_prospect(lead_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Updating SmartRent prospect was failed with {response.status_code} '
            f'status code {response.content}')
        return False
    return True
