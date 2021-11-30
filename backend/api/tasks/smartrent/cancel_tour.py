import logging
from django.conf import settings

from backend.celery_app import app
from backend.api.models import Task
from backend.api.tasks.nylas.send_emailed_event import delete_event

from .check_smart_rent_tour import check_smart_rent_tour
from .utils import get_smart_rent_response, reset_tokens


@app.task
def cancel_tour(lead_id, tour_id, try_count=0, remove_smart_rent_id=False):
    result = check_smart_rent_tour(lead_id, tour_id)
    if not result:
        return
    lead, tour, headers = result
    group_id = lead.property.smart_rent_group_id
    update_tour_url = 'https://{api_host}/mgmt-api/v1/tours/{tour_id}'.format(
        api_host=settings.SMART_RENT_HOST,
        group_id=group_id,
        tour_id=tour.smart_rent_id
    )
    response = get_smart_rent_response(update_tour_url, request_type='DELETE', headers=headers)
    if response.status_code != 202:
        if response.status_code == 401:
            if try_count < 1:
                reset_tokens()
                return cancel_tour(lead_id, tour_id, try_count=try_count + 1)
        logging.error(
            f'[Smart Rent]: Cancelling SmartRent tour was failed with {response.status_code}'
            f' status code {response.content}')
        return False
    else:
        logging.info(f'[Smart Rent]: Sent {tour_id} tour cancellation request to smart rent')
        if remove_smart_rent_id:
            tour = Task.objects.get(pk=tour.pk)
            tour.smart_rent_id = None
            tour.save()
        if tour.active_event:
            delete_event.delay(tour.property.id, tour.active_event.external_id)
        return True
