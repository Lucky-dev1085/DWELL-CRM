from requests.exceptions import HTTPError

from backend.api.models import Property, EmailMessage, EmailLabel
from backend.api.utils import nylas_failed_request_cb
from backend.celery_app import app
from .utils import get_nylas_client


@app.task
def archive_messages_task(pk, ids):
    """
    This task would iterate email messages that should be archived. We are running this job asynchronously since
    it will take a bit much time to complete it.
    :param pk: Property pk
    :param ids: Email message Ids
    :return:
    """
    current_property = Property.objects.get(pk=pk)
    client = get_nylas_client(current_property.nylas_access_token)
    label_ids = []
    archive_id = ''  # archive or all mails label id
    try:
        organization_unit = client.account.organization_unit

        if organization_unit == 'label':
            labels = client.labels.all()
            archive_id = next((label.id for label in labels if label.name == 'all'), None)

        if organization_unit == 'folder':
            folders = client.folders.all()
            archive_id = next((folder.id for folder in folders if folder.name == 'archive'), None)
    except HTTPError as e:
        nylas_failed_request_cb(e, current_property)
        EmailMessage.objects.filter(pk__in=ids).update(is_archived=False)
        return

    for message_id in ids:
        email_message = EmailMessage.objects.filter(pk=message_id).first()
        if not email_message:
            continue
        try:
            message = client.messages.get(email_message.nylas_message_id)

            if organization_unit == 'label':
                message.add_label(archive_id)
                # Only keep All Email labeled mails.
                message.remove_labels([label.get('id') for label in message.labels if label.get('id') != archive_id])
                labels = message.labels
                label_ids = [label.get('id') for label in (labels if type(labels) is list else [labels])]

            if organization_unit == 'folder':
                message.update_folder(archive_id)
                folder = message._folder
                label_ids = [label.get('id') for label in (folder if type(folder) is list else [folder])]

            message.save()
        except HTTPError as e:
            # If any exception occurred while converting converting labels using nylas, we would revert is_archived
            # status to False
            email_message.is_archived = False
            email_message.save()
            nylas_failed_request_cb(e, current_property)
            pass

        email_message.labels.set(EmailLabel.objects.filter(external_id__in=label_ids))
