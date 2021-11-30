from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from backend.compete.models.alert import AlertLog, AlertUnitRentLog
from backend.compete.serializer.alert import ThresholdAlertLogDetailSerializer
from datetime import datetime


@app.task
def send_notification_email_task(notification_data):
    if settings.DISABLE_NOTIFICATION:
        return
    context = {
        'content': notification_data.get('content', ''),
        'bottom_note': notification_data.get('bottom_note', ''),
        'subject': notification_data.get('subject', ''),
        'redirect_url': notification_data.get('redirect_url', ''),
        'button_text': notification_data.get('button_text', ''),
        'header': notification_data.get('header', ''),
    }

    # render email text
    email_html_message = render_to_string('email/notification.html',
                                          context)
    email_plaintext_message = render_to_string('email/notification.txt',
                                               context)

    msg = EmailMultiAlternatives(
        # title:
        notification_data.get('subject', ''),
        # message:
        email_plaintext_message,
        # from:
        'do-not-reply@ils.dwell.io',
        # to:
        [notification_data.get('email', '')])
    msg.attach_alternative(email_html_message, 'text/html')
    msg.send()


@app.task
def send_threshold_notification_email_task(alert_log_id, notification_data):
    alert_log = AlertLog.objects.get(pk=alert_log_id)
    rent_options = {
        'COMBINED': 'Combined',
        'STUDIO': 'Studio',
        'ONE_BEDROOM': '1 Bedroom',
        'TWO_BEDROOM': '2 Bedroom',
        'THREE_BEDROOM': '3 Bedroom',
        'FOUR_BEDROOM': '4 Bedroom',
    }
    context = {
        'tables': [],
        'name': alert_log.alert.name,
        'value': alert_log.alert.condition_value,
        'redirect_url': notification_data.get('redirect_url'),
    }

    for key, value in rent_options.items():
        unit_type = key
        if key == 'COMBINED':
            unit_type = None
        all_ids = alert_log.log_details.values_list('id', flat=True)
        filtered_ids = AlertUnitRentLog.objects.filter(alert_log_detail__in=all_ids, unit_type=unit_type) \
            .values_list('alert_log_detail', flat=True)
        curr_logs = alert_log.log_details.filter(id__in=filtered_ids)
        if curr_logs.exists():
            serializer = ThresholdAlertLogDetailSerializer(curr_logs, many=True)
            curr_data_list = serializer.data
            for curr_data in curr_data_list:
                curr_data['movement_class'] = 'more' if curr_data['movement'] > 0 else 'less'
                curr_data['movement_pcnt'] = round((curr_data['movement'] / curr_data['previous_value'] * 100), 1)
                curr_data['movement_pcnt'] = '+' + str(curr_data.get('movement_pcnt')) \
                    if curr_data.get('movement_pcnt') > 0 else f'-{str(abs(curr_data.get("movement_pcnt")))}'
                curr_data['movement'] = '$' + str(round(curr_data.get('movement'))) \
                    if curr_data.get('movement') > 0 else f'-${str(abs(round(curr_data.get("movement"))))}'
                curr_data['previous_value'] = '{:,}'.format(round(curr_data.get('previous_value')))
                curr_data['new_value'] = '{:,}'.format(round(curr_data.get('new_value')))
                curr_data['url'] = f'{settings.CRM_HOST}/compete/property-report/{curr_data.get("property")}'

            context['tables'].append(
                {
                    'name': value,
                    'data': curr_data_list
                }
            )

    email_html_message = render_to_string('email/threshold_notification.html',
                                          context)
    email_plaintext_message = render_to_string('email/notification.txt',
                                               context)
    today = datetime.now().strftime('%m/%d/%y')

    msg = EmailMultiAlternatives(
        # title:
        f'New rent pricing activity in your submarket ({today})',
        # message:
        email_plaintext_message,
        # from:
        'do-not-reply@ils.dwell.io',
        # to:
        [alert_log.alert.user.email])
    msg.attach_alternative(email_html_message, 'text/html')
    msg.send()
