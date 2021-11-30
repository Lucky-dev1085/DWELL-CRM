from datetime import timedelta, date, datetime, time

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from backend.api.models import Task, Notification
from backend.api.tasks import push_object_saved
from backend.api.tasks import send_notification_email_task, send_threshold_notification_email_task
from backend.api.utils import get_pusher_socket_id, get_user_last_activity
from backend.compete.models.alert import Alert


def create_notification(instance, notification_type, content, subject, button_text, object, user, request=None,
                        bottom_note=None, email_header=None, email_content=None, should_send_email=False):
    last_activity = get_user_last_activity(user.id)
    is_offline = last_activity and \
                 last_activity < timezone.now() - timedelta(minutes=settings.ONLINE_SESSION_TIMEOUT)
    if user.disable_notification:
        return
    if notification_type in [Notification.TYPE_OVERDUE_TASK, Notification.TYPE_TASK_DUE_TODAY]:
        today_min = datetime.combine(timezone.now().date(), time.min)
        today_max = datetime.combine(timezone.now().date(), time.max)
        content_type = ContentType.objects.get(app_label='api', model='task')
        if Notification.objects.filter(object_id=object.pk, object_content_type=content_type, type=notification_type,
                                       property=instance.property, user=user, updated__range=(today_min,
                                                                                              today_max)).exists():
            return
    note = Notification.objects.create(
        property=getattr(instance, 'property', None),
        type=notification_type,
        content=content,
        object=object,
        is_display=True,
        user=user
    )

    if should_send_email or is_offline or notification_type == Notification.TYPE_OVERDUE_TASK:
        notification_data = {
            'content': email_content or content,
            'header': email_header or subject,
            'bottom_note': bottom_note,
            'subject': subject,
            'redirect_url': '{}{}'.format(settings.CRM_HOST, note.redirect_url),
            'email': user.email,
            'button_text': button_text,
        }
        if notification_type == Notification.TYPE_THRESHOLD_ALERT and instance.alert.condition_subject == Alert.RENT:
            send_threshold_notification_email_task.delay(instance.id, notification_data)
        else:
            send_notification_email_task.delay(notification_data)
    else:
        socket_id = get_pusher_socket_id(request) if request else None
        push_object_saved(note.id, note.__class__.__name__, True, socket_id, True)


def lead_notification(request, new_lead, lead):
    if new_lead.owner and new_lead.actor != new_lead.owner and lead.owner != new_lead.owner:
        if timezone.now() - lead.updated > settings.ACTIVE_SESSION_LIMIT or lead.actor != new_lead.owner:
            notification_type = Notification.TYPE_NEW_LEAD
            name = new_lead.actor.first_name if new_lead.actor else 'Our system automatically'
            content = '{} assigned you a new lead: {} {}'.format(name, new_lead.first_name, new_lead.last_name)
            subject = '{} assigned you a new lead'.format(name)
            button_text = 'View new lead in Dwell'
            user = new_lead.owner
            create_notification(new_lead, notification_type, content, subject, button_text, new_lead, user, request)


def task_notification(request, new_task, task=None):
    if new_task.owner and new_task.actor and new_task.actor != new_task.owner:
        if (not task) or (task and (timezone.now() - task.updated > settings.ACTIVE_SESSION_LIMIT
                                    or task.actor != new_task.owner)):
            user = new_task.owner
            if (not task) or (task and task.owner != new_task.owner):
                notification_type = Notification.TYPE_NEW_TASK
                content = '{} assigned you a new task: {}'.format(new_task.actor.first_name, new_task.title)
                subject = '{} assigned you a new task'.format(new_task.actor.first_name)
                button_text = 'View new task in Dwell'
                create_notification(new_task, notification_type, content, subject, button_text, new_task,
                                    user, request)

            date_attr = 'tour_date' if new_task.type in Task.TOUR_TYPES.keys() else 'due_date'
            new_due_date = getattr(new_task, date_attr).date()\
                if new_task.type in Task.TOUR_TYPES.keys() else getattr(new_task, date_attr)
            if (not task) or (task and getattr(task, date_attr) != new_due_date):
                if new_due_date == date.today():
                    notification_type = Notification.TYPE_TASK_DUE_TODAY
                    content = '{} for {} is due today'.format(new_task.title, new_task.lead.name)
                    subject = '{} is due today'.format(new_task.title)
                    button_text = 'View task in Dwell'
                    create_notification(new_task, notification_type, content, subject, button_text,
                                        new_task, user, request)
                elif new_due_date < date.today():
                    notification_type = Notification.TYPE_OVERDUE_TASK
                    content = '{} for {} is overdue'.format(new_task.title, new_task.lead.name)
                    if date.today() - new_due_date == timedelta(days=1):
                        content = '{} for {} is one day overdue'.format(new_task.title, new_task.lead.name)
                    if date.today() - new_due_date == timedelta(days=7):
                        content = '{} for {} is one week overdue'.format(new_task.title, new_task.lead.name)
                    subject = '{} is overdue'.format(new_task.title)
                    button_text = 'View overdue task in Dwell'
                    create_notification(new_task, notification_type, content, subject, button_text,
                                        new_task, user, request)


def note_notification(request, new_note, old_note_mentions=None):
    if new_note.mentions.first():
        for user in new_note.mentions.all():
            if user != new_note.actor or (old_note_mentions and user not in old_note_mentions):
                notification_type = Notification.TYPE_TEAM_MENTION
                content = '{} mentioned you in {} {}: {}'.format(new_note.actor.first_name, new_note.lead.first_name,
                                                                 new_note.lead.last_name, new_note.text)
                subject = '{} mentioned you in {} {}'.format(new_note.actor.first_name, new_note.lead.first_name,
                                                             new_note.lead.last_name)
                button_text = 'View new note in Dwell'
                user = user
                create_notification(new_note, notification_type, content, subject, button_text, new_note.lead,
                                    user, request)


def create_assign_lead_owner_notification(lead, user):
    notification_type = Notification.TYPE_NEW_LEAD
    content = 'A new lead has been auto-assigned to you for {}: {} {}'.format(
        lead.property.name, lead.first_name, lead.last_name) \
        if lead.owner else f'A new lead has been auto created for {lead.property.name}.'
    bottom_note = None
    if not lead.owner:
        bottom_note = 'You are receiving this email because this lead does not have an assigned owner. <br/>' \
                   'To set default owners for new leads, please visit Settings > General > Assigned lead owners in ' \
                   'your Dwell account. <br/>' \
                   ' This video provides details - https://vimeo.com/430083851'
    subject = f'A new lead has been auto-assigned to you for {lead.property.name}' if lead.owner \
        else f'A new lead has been auto created for {lead.property.name}'
    button_text = 'View new lead in Dwell'
    create_notification(lead, notification_type, content, subject, button_text, lead, user,
                        bottom_note=bottom_note)


def alert_notification(alert_log):
    alert = alert_log.alert
    if alert.type == 'BENCHMARK':
        notification_type = Notification.TYPE_BENCHMARK_ALERT
        email_content = 'Your weekly benchmark alert report for "{}" is ready to review.'.format(alert.name)
        email_header = 'New Benchmark Alert'
        content = email_content.replace('"', '')
        subject = email_content
        button_text = 'View New Benchmark Alert'
    else:
        notification_type = Notification.TYPE_THRESHOLD_ALERT
        email_content = 'A new threshold alert has been triggered for "{}".'.format(alert.name)
        email_header = 'New Threshold Alert'
        content = email_content.replace('"', '')
        subject = email_content
        button_text = 'View New Threshold Alert'

    create_notification(
        alert_log, notification_type, content, subject, button_text, alert_log, alert.user, None,
        email_header=email_header, email_content=email_content, should_send_email=True
    )
