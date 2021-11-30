import logging
import pytz

from datetime import datetime

from backend.api.models import Property, Task
from backend.api.tasks.smartrent.utils import get_tours_list
from backend.celery_app import app
from backend.api.tasks.nylas.send_emailed_event import delete_event


@app.task
def check_cancelled_tours(pk=None):
    if datetime.now(tz=pytz.timezone('America/Phoenix')).hour not in range(7, 20):
        return
    if pk:
        properties = [Property.objects.get(pk=pk)]
    else:
        properties = Property.objects.filter(is_released=True).exclude(smart_rent_group_id=None) \
            .exclude(smart_rent_group_id='')

    for property in properties:
        smart_rent_tours = get_tours_list(property.smart_rent_group_id)
        if smart_rent_tours:
            cancelled_tours = [tour.get('id') for tour in smart_rent_tours if tour.get('deleted_reason')]
            tours = Task.objects.filter(smart_rent_id__in=cancelled_tours, type=Task.TYPE_SELF_GUIDED_TOUR,
                                        is_cancelled=False, property=property)
            if tours.count():
                logging.info(f'{tours.count()} tours were cancelled.')
                for tour in tours:
                    if tour.active_event:
                        delete_event.delay(property.id, tour.active_event.external_id)
                    # send_tour_sms.delay(property.id, tour.id, is_cancel=True)
                tours.update(is_cancelled=True)
