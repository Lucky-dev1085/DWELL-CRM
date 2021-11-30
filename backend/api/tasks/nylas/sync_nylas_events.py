import logging

from backend.api.models import Property
from backend.celery_app import app
from .utils import sync_property_nylas_events_task


@app.task
def sync_nylas_events_task(property_pk=None):
    properties = [Property.objects.get(pk=property_pk)] if property_pk else Property.objects.filter(
        nylas_status=Property.NYLAS_STATUS_CONNECTED)
    for property in properties:
        sync_property_nylas_events_task(property)
        # for the case if it's individual syncing by user action.
        logging.info(f'Finished syncing events for {property.name}.')
        property.nylas_status = Property.NYLAS_STATUS_CONNECTED
        property.save()
