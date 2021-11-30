from backend.api.models import Property
from backend.celery_app import app


@app.task
def reset_sent_email_counters():
    """
    This task reset the daily sent email count in the every early morning.
    :return:
    """
    for property in Property.objects.all():
        property.sent_email_count = 0
        property.is_email_blast_disabled = False
        property.save()
