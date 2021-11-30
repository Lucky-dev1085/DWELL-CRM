from requests.exceptions import HTTPError
from rest_framework.exceptions import ValidationError

from backend.api.models import Property, Calendar
from backend.api.utils import nylas_failed_request_cb
from backend.celery_app import app
from .utils import get_nylas_client


@app.task()
def pull_calendars(property_pk=None):
    """
    This task pull the calendars using nylas and update it into our db.
    This method could be run in two places one is called by celery beat scheduling workflow, and the other is when
    property is updated.
    :param property_pk: int Property record pk
    :return:
    """
    properties = [Property.objects.get(pk=property_pk)] if property_pk else Property.objects.exclude(
        nylas_access_token__isnull=True).exclude(nylas_access_token__exact='')
    for property in properties:
        try:
            client = get_nylas_client(property.nylas_access_token)
            calendars = client.calendars.all()
            for calendar in calendars:
                Calendar.objects.update_or_create(name=calendar['name'], external_id=calendar.get('id'),
                                                  property=property)
        except HTTPError as e:
            nylas_failed_request_cb(e, property)
            if property_pk:
                raise ValidationError('We can not proceed this request.')
