from backend.api.models import Notification, ChatConversation, SMSContent
from backend.celery_app import app
from datetime import timedelta, datetime


@app.task
def clear_older_notifications():
    seven_days_ago = datetime.now() - timedelta(days=7)
    Notification.objects.filter(created__lt=seven_days_ago, is_display=True).update(is_display=False)
    ChatConversation.objects.filter(created__lt=seven_days_ago, is_read=False).update(is_read=True)
    SMSContent.objects.filter(created__lt=seven_days_ago, is_read=False).update(is_read=True)
