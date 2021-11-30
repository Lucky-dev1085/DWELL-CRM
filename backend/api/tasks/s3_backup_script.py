import logging
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.celery_app import app
from backend.api.models import EmailAttachment
from backend.api.tasks.nylas.utils import download_file_from_nylas


@app.task
def backup_email_attachments(start, end):
    """
    Create new pusher event when model record is deleted
    """
    attachments = EmailAttachment.objects.filter(email_message__property__is_released=True,
                                                 created__lte=start, created__gte=end).order_by('-created')
    total_count = attachments.count()
    for index, attachment in enumerate(attachments):
        try:
            logging.info(f'{index}nd attachment upload (from {total_count}) attachments - {attachment.created}')
            content = download_file_from_nylas(attachment.external_id, attachment.email_message.property)
            email_message = attachment.email_message
            data = SimpleUploadedFile.from_dict({
                'content': content,
                'filename': f'{email_message.property.external_id}-{int(email_message.date.timestamp())}-{attachment.name}',
                'content-type': attachment.content_type
            })
            attachment.attachment = data
            attachment.save()
        except Exception as e:
            logging.error(f'Error occurred on {attachment.email_message.property.name}')
            logging.error(e)
            continue
