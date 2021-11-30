from backend.celery_app import app
from backend.api.models import Property


@app.task
def reset_nylas_integration(property_pk):
    """
    Format all nylas related data for specific property. We'd use celery task because delete of attachment files request
    boto3 request which will requires such time.
    :param property_pk:
    :return:
    """
    property = Property.objects.get(pk=property_pk)
    # todo we don't want  to lose lead assignment of emails
    # property.email_messages.all().delete()
    # property.email_labels.all().delete()

    property.nylas_account_id = None
    property.nylas_access_token = None
    property.nylas_status = ''
    property.nylas_sync_option = Property.NYLAS_SYNC_OPTION_ALL
    property.sent_email_count = 0
    property.shared_email = None
    property.save()
