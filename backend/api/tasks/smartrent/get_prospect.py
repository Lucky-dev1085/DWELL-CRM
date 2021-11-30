import logging
from django.conf import settings
from .utils import check_tokens, get_smart_rent_response, reset_tokens


def get_prospect(prospect_id, try_count=0):
    access_token = check_tokens()

    headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

    get_prospect_url = 'https://{api_host}/mgmt-api/v1/prospects/{prospect_id}/'.format(
        api_host=settings.SMART_RENT_HOST, prospect_id=prospect_id)
    response = get_smart_rent_response(get_prospect_url, headers=headers, request_type='GET')
    if response.status_code != 200:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return get_prospect(prospect_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Get prospect was failed with {response.status_code} status code {response.content}')
        return {}
    else:
        content = response.json()
        return content
