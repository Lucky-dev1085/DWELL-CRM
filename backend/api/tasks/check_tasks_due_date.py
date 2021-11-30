from datetime import date
from datetime import datetime, timedelta, time
from time import sleep

import pytz
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from backend.api.models import Task, Notification
from backend.celery_app import app
from .push_object_task import push_object_saved
from .emails.send_notification_email import send_notification_email_task
from ..utils import get_user_last_activity

utc = pytz.UTC


@app.task
def check_tasks_due_date_task(*args):
    for task in Task.objects.filter(status=Task.TASK_OPEN):
        check_task_due_date(task)


def check_task_due_date(task):
    if task.type in Task.TOUR_TYPES.keys():
        due_date = getattr(task, 'tour_date')
        if due_date:
            due_date = due_date.date()
    else:
        due_date = getattr(task, 'due_date')

    if task.owner and due_date and task.lead:
        notification_type = None
        task_status = None

        if due_date == date.today():
            task_status = 'due today'
            notification_type = Notification.TYPE_TASK_DUE_TODAY
        elif due_date < date.today():
            if date.today() - due_date == timedelta(days=1):
                task_status = 'one day overdue'
                notification_type = Notification.TYPE_OVERDUE_TASK
            if date.today() - due_date == timedelta(days=7):
                task_status = 'one week overdue'
                notification_type = Notification.TYPE_OVERDUE_TASK

        if notification_type:
            today_min = datetime.combine(timezone.now().date(), time.min)
            today_max = datetime.combine(timezone.now().date(), time.max)
            content_type = ContentType.objects.get(app_label='api', model='task')
            if Notification.objects.filter(object_id=task.pk, object_content_type=content_type,
                                           type=notification_type,
                                           property=task.property, user=task.owner,
                                           updated__range=(today_min, today_max)).exists():
                return
            last_activity = get_user_last_activity(task.owner.id)
            is_offline = last_activity and \
                         last_activity < timezone.now() - timedelta(minutes=settings.ONLINE_SESSION_TIMEOUT)
            note = Notification.objects.create(
                property=task.property,
                type=notification_type,
                content='{} for {} is {}'.format(task.title, task.lead.name, task_status),
                object=task,
                user=task.owner,
                is_display=True
            )

            if is_offline or notification_type == Notification.TYPE_OVERDUE_TASK:
                notification_data = {
                    'content': '{} for {} is {}'.format(task.title, task.lead.name, task_status),
                    'subject': '{} is {}'.format(task.title, task_status),
                    'redirect_url': '{}{}'.format(settings.CRM_HOST, note.redirect_url),
                    'email': task.owner.email,
                    'button_text': 'View task in Dwell',
                }
                send_notification_email_task.delay(notification_data)
                sleep(settings.SES_EMAIL_NOTIFICATION_DELAY_TIME)
            else:
                push_object_saved.delay(note.id, note.__class__.__name__, True, is_user_channel=True)
