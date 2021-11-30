import logging
from datetime import datetime, timedelta
from math import ceil

from django.conf import settings

from backend.api.models import Property
from backend.celery_app import app
from .utils import sync_property_nylas_messages_task


@app.task
def sync_nylas_messages_task(property_pk=None):
    properties = [Property.objects.get(pk=property_pk)] if property_pk else Property.objects.filter(
        nylas_status=Property.NYLAS_STATUS_CONNECTED)
    for property in properties:
        if property_pk:
            now = datetime.now(property.timezone).replace(hour=23, minute=59, second=59, microsecond=0)

            batch_size = settings.NYLAS_SYNC_BATCH_SIZE
            days_count = settings.NYLAS_SYNC_DAYS_LIMIT
            if property.nylas_last_connected_date:
                days_count = (now.date() - property.nylas_last_connected_date).days + 1
            steps = ceil(days_count / batch_size)

            for i in range(0, steps):
                after = str((now - timedelta(days=batch_size * (i + 1) if i != steps - 1 else days_count)).timestamp())
                before = str((now - timedelta(days=batch_size * i)).timestamp())
                sync_property_nylas_messages_task(property, after, before)
        else:
            yesterday = datetime.now(property.timezone) - timedelta(days=1)
            after = str(yesterday.replace(hour=0, minute=0, second=0, microsecond=0).timestamp())
            before = str(datetime.now(property.timezone).replace(hour=0, minute=0, second=0, microsecond=0).timestamp())
            sync_property_nylas_messages_task(property, after, before)

        # for the case if it's individual syncing by user action.
        logging.info(f'Finished syncing emails for {property.name}.')

        Property.objects.filter(pk=property.id).update(
            nylas_status=Property.NYLAS_STATUS_CONNECTED
        )
