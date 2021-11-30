import logging
from datetime import datetime

import backoff

from backend.api.models import Property, EmailLabel, EmailMessage
from backend.api.utils import nylas_failed_request_cb
from backend.celery_app import app
from django.conf import settings
from requests.exceptions import HTTPError


@app.task
def pull_sent_email_labels(property_pk=None):
    properties = [Property.objects.get(pk=property_pk)] if property_pk else Property.objects.exclude(
        nylas_access_token__isnull=True).exclude(nylas_access_token__exact='')
    for property in properties:
        filter_date = datetime.now(property.timezone).date()
        start = property.timezone.localize(datetime.combine(filter_date, datetime.min.time()))
        end = property.timezone.localize(datetime.combine(filter_date, datetime.max.time()))
        messages = EmailMessage.objects.filter(sender_email=property.shared_email, date__range=(start, end))
        for message in messages:
            if not message.labels.all():
                logging.error('Email message {} has no labels set'.format(message.id))
                pull_message_labels(message.nylas_message_id, property.id)


@app.task
def pull_message_labels(message_id, property_id):
    property = Property.objects.filter(pk=property_id).first()
    if property:
        try:
            labels = []
            label_ids = []
            from backend.api.tasks.nylas.utils import get_nylas_client, fatal_code
            client = get_nylas_client(property.nylas_access_token)

            @backoff.on_exception(backoff.fibo, HTTPError, max_tries=settings.MAX_NYLAS_RETRIES + 1, giveup=fatal_code)
            def get_message_and_organization_unit():
                sync_message = client.messages.get(message_id)
                sync_organization_unit = client.account.organization_unit
                return sync_message, sync_organization_unit

            message, organization_unit = get_message_and_organization_unit()
            if not message:
                logging.info(f'We are unable to pull message from {message_id}')
                return

            if organization_unit:
                is_label_format = organization_unit == 'label'
                message_labels = message.labels if is_label_format else message.folder
                if message_labels:
                    for label in (message_labels if type(message_labels) is list else [message_labels]):
                        label_ids.append(label.get('id'))
                        if label.get('display_name').lower() in ['trash', 'spam']:
                            return
                    labels = EmailLabel.objects.filter(external_id__in=label_ids)
            email_message = EmailMessage.objects.filter(nylas_message_id=message_id).first()
            email_message.labels.set(labels)
            email_message.save()
        except HTTPError as e:
            nylas_failed_request_cb(e, property)
