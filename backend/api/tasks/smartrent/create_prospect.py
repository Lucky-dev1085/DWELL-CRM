import logging
from django.conf import settings
from django.db import transaction

from backend.api.models import Lead
from .utils import check_tokens, get_smart_rent_response, reset_tokens


def create_prospect(lead_id, try_count=0):
    access_token = check_tokens()

    lead = Lead.objects.filter(id=lead_id).first()
    if not lead:
        logging.error(
            '[Smart Rent]: Lead with id - {} does not exist.'.format(lead_id))
        return

    headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

    group_id = lead.property.smart_rent_group_id
    create_prospect_url = 'https://{api_host}/mgmt-api/v1/groups/{group_id}/prospects'.format(
        api_host=settings.SMART_RENT_HOST, group_id=group_id)
    prospect_data = dict(first_name=lead.first_name, last_name=lead.last_name,
                         phone_number=lead.phone_number, email=lead.email, desired_move_in_date=str(lead.move_in_date))
    response = get_smart_rent_response(create_prospect_url, data=prospect_data, headers=headers)
    if response.status_code != 200:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return create_prospect(lead_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Creating SmartRent prospect was failed with {response.status_code} '
            f'status code {response.content}')
        return
    else:
        response = response.json()
        logging.info(f'[Smart Rent]: Saving smart rent id {response.get("id")} into lead {lead_id}')
        with transaction.atomic():
            lead = Lead.objects.select_for_update().filter(id=lead_id).first()
            lead.smart_rent_id = response.get('id')
            lead.save()
        return lead
