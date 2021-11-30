from datetime import datetime

import pytz
from dateutil.relativedelta import relativedelta

from backend.api.models import EmailAttachment
from backend.celery_app import app


@app.task
def remove_old_attachments():
    today = datetime.today()
    three_months_ago = today + relativedelta(months=-3)
    start = datetime.combine(three_months_ago, datetime.min.time()).replace(tzinfo=pytz.UTC)
    end = datetime.combine(three_months_ago, datetime.max.time()).replace(tzinfo=pytz.UTC)
    EmailAttachment.objects.filter(created__gte=start, created__lte=end).delete()
