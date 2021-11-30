import logging
import backoff
import pytz
import redis
import requests

from datetime import timedelta, datetime

from django.conf import settings
from django.utils import timezone

from backend.api.models import Unit


@backoff.on_predicate(backoff.fibo, lambda response: response.status_code not in [200, 401, 202],
                      max_tries=settings.MAX_SMART_RENT_RETRIES + 1)
def get_smart_rent_response(url, request_type='POST', headers=None, data=None, params=None):
    if request_type == 'POST':
        return requests.post(url, json=data, headers=headers, params=params)
    elif request_type == 'PATCH':
        return requests.patch(url, json=data, headers=headers, params=params)
    elif request_type == 'DELETE':
        return requests.delete(url, json=data, headers=headers, params=params)
    else:
        return requests.get(url, json=data, headers=headers, params=params)


def get_access_token():
    credentials = dict(email=settings.SMART_RENT_EMAIL, password=settings.SMART_RENT_PASSWORD)
    get_access_token_url = 'https://{api_host}/mgmt-api/v1/sessions'.format(api_host=settings.SMART_RENT_HOST)

    response = get_smart_rent_response(get_access_token_url, data=credentials)
    if response.status_code != 200:
        logging.error(
            f'[Smart Rent]: Generating SmartRent auth token was failed with {response.status_code} '
            f'status code {response.content}')
        return
    else:
        response = response.json()
        access_token_expires = datetime.fromtimestamp(response.get('expires'), tz=pytz.UTC)
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', response.get('access_token'), ex=access_token_expires - timezone.now())
        r.set('smart_rent_refresh_token', response.get('refresh_token'), ex=timedelta(days=1))
        return response.get('access_token')


def refresh_access_token(refresh_token):
    headers = {'Authorization-X-Refresh': '{token}'.format(token=refresh_token)}

    tokens_url = 'https://{api_host}/mgmt-api/v1/tokens'.format(api_host=settings.SMART_RENT_HOST)
    response = get_smart_rent_response(tokens_url, headers=headers)
    if response.status_code != 200:
        if response.status_code == 401:
            return get_access_token()
        else:
            logging.error(
                f'[Smart Rent]: Generating SmartRent auth token was failed with {response.status_code} '
                f'status code {response.content}')
    else:
        response = response.json()
        access_token_expires = datetime.fromtimestamp(response.get('expires'), tz=pytz.UTC)
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', response.get('access_token'), ex=access_token_expires - timezone.now())
        r.set('smart_rent_refresh_token', response.get('refresh_token'), ex=timedelta(days=1))
        return response.get('access_token')


def check_tokens():
    r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
    access_token = r.get('smart_rent_access_token')

    if access_token:
        access_token = access_token.decode('utf-8')
    else:
        refresh_token = r.get('smart_rent_refresh_token')
        if refresh_token:
            access_token = refresh_access_token(refresh_token.decode('utf-8'))
        else:
            access_token = get_access_token()
    return access_token


def reset_tokens():
    r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
    r.set('smart_rent_access_token', '')


def get_group_list():
    group_list_url = 'https://{api_host}/mgmt-api/v1/groups'.format(api_host=settings.SMART_RENT_HOST)
    return get_pagination_response(group_list_url)


def get_tours_list(group_id):
    unit_list_url = 'https://{api_host}/mgmt-api/v1/groups/{group_id}/tours' \
        .format(api_host=settings.SMART_RENT_HOST, group_id=group_id)
    return get_pagination_response(unit_list_url)


def get_available_times(property, unit_ids, try_count=0):
    """
    Pull the available times for given unit. This will be used for time choices on tour schedule flow of prospect chat.
    """
    access_token = check_tokens()
    units = Unit.objects.filter(id__in=unit_ids).values_list('smart_rent_unit_id', flat=True)
    if not len(units):
        logging.error(
            '[Smart Rent]: Unit with id - {} does not exist.'.format(unit_ids))
        return

    headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

    unit_param = ''
    for unit in units:
        unit_param += f'unit_ids[]={unit}&'

    get_times_url = 'https://{api_host}/mgmt-api/v1/groups/{group_id}/tours/times?{unit_param}'\
        .format(api_host=settings.SMART_RENT_HOST, group_id=property.smart_rent_group_id, unit_param=unit_param[:-1])
    response = get_smart_rent_response(get_times_url, headers=headers, request_type='GET')
    if response.status_code != 200:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return get_available_times(property, unit_ids, try_count=try_count + 1)
        else:
            logging.error(
                f'[Smart Rent]: Creating SmartRent tour was failed with {response.status_code} '
                f'status code {response.content}')
        return None
    else:
        content = response.json()
        return content.get('day_schedules')


def get_pagination_response(url):
    """
    Pull the records across all the pagination.
    """
    def get_response(page_number, try_count=0):
        access_token = check_tokens()
        headers = {'Authorization': 'Bearer {token}'.format(token=access_token)}

        smart_rent_response = get_smart_rent_response(
            url, request_type='GET', headers=headers, params={'page': page_number}
        )
        if smart_rent_response.status_code != 200:
            if smart_rent_response.status_code == 401:
                if try_count < 1:
                    reset_tokens()
                    return get_response(page_number, try_count=try_count + 1)
            else:
                logging.error(
                    f'[Smart Rent]: Getting SmartRent groups was failed with {smart_rent_response.status_code} '
                    f'status code {smart_rent_response.content}')
            return {}
        else:
            return smart_rent_response.json()

    current_page = 1
    response = get_response(current_page)
    records = []

    if response:
        records += response.get('records', [])
        total_pages = response.get('total_pages', 1)
        current_page += 1

        for page in range(current_page, total_pages + 1):
            response = get_response(page)
            if response:
                records += response.get('records', [])
    return records
