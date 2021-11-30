import logging

import pytz
from django.conf import settings
from django.db import transaction

from backend.api.models import Task
from backend.celery_app import app
from .check_smart_rent_tour import check_smart_rent_tour
from .utils import get_smart_rent_response, reset_tokens


@app.task
def create_tour(lead_id, tour_id, try_count=0):
    result = check_smart_rent_tour(lead_id, tour_id)
    if not result:
        return

    lead, tour, headers = result
    group_id = lead.property.smart_rent_group_id
    create_tour_url = 'https://{api_host}/mgmt-api/v1/groups/{group_id}/tours'.format(api_host=settings.SMART_RENT_HOST,
                                                                                      group_id=group_id)
    tour_data = dict(prospect_id=lead.smart_rent_id,
                     units=list(tour.units.values_list('smart_rent_unit_id', flat=True)),
                     group_id=group_id, scheduled_start_now=False,
                     scheduled_start=tour.tour_date.astimezone(tz=pytz.UTC).strftime('%Y-%m-%dT%H:%M:%SZ'),
                     geolocation_required=False, id_verification_skipped_by_staff=True)
    response = get_smart_rent_response(create_tour_url, data=tour_data, headers=headers)
    if response.status_code != 200:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return create_tour(lead_id, tour_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Creating SmartRent tour was failed with {response.status_code} '
            f'status code {response.content}')
        return
    else:
        response = response.json()
        logging.info(f'[Smart Rent]: Saving smart rent id {response.get("id")} into tour {tour_id}')
        with transaction.atomic():
            Task.objects.select_for_update().filter(id=tour_id).update(smart_rent_id=response.get('id'))
