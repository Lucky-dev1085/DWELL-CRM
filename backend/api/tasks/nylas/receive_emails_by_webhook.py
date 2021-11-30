from django.conf import settings

from requests.exceptions import HTTPError

from nylas import APIClient
from backend.api.models import Property
from backend.celery_app import app
from backend.api.tasks import create_email_message_from_nylas
from backend.api.utils import nylas_failed_request_cb


@app.task()
def receive_emails_by_webhook(payloads):
    for (property_pk, message_id) in payloads:
        property = Property.objects.get(pk=property_pk)
        client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                           property.nylas_access_token)
        try:
            message = client.messages.get(message_id)
            create_email_message_from_nylas(message, property.id, client.account.organization_unit)

        except HTTPError as e:
            nylas_failed_request_cb(e, property)
