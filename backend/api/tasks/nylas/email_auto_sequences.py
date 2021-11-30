import logging
from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from requests.exceptions import HTTPError

from backend.api.models import Lead, EmailTemplate, Task
from backend.api.tasks import check_application_status
from backend.api.tasks.emails.send_template_variable_missing_email import send_template_variable_missing_email
from backend.api.tasks.nylas.send_emailed_event import send_tour_sms
from backend.api.tasks.nylas.utils import send_email_message, replace_value_into_content, get_missed_variables
from backend.celery_app import app


@app.task(bind=True, rate_limit='1/m')
@transaction.atomic
def send_tour_confirmation_one_day_reminder(self, lead_pk, tour_id):
    """
    Tour confirmation reminder email. This task is scheduled prior a day of tour date.
    Now, the apply async celery tasks that have over than few hours in ETA have been called multiple times due to
    visibility timeout issue, there's no proper solution yet, just have discussion in this celery issue.
    https://github.com/celery/celery/issues/4400
    In the future, we will have time to look back on this for sure.
    As a result, these task is called multiple times in very close same time and raise the concurrency issue, so we are
    lock the DB commit using select_for_update for entire email / sms send workflow, this is not perfect solution
    because it will block that record for email sending times, but the best option for now.
    :param self:
    :param lead_pk:
    :return:
    """
    lead = Lead.objects.select_for_update().filter(pk=lead_pk).first()
    if self.request.id != lead.confirmation_reminder_async_id or not lead.confirmation_reminder_async_id:
        # if async task id is not registered in lead this means it's revoked. In case, we do not send reminder email.
        return

    with transaction.atomic():
        lead.confirmation_reminder_async_id = None
        lead.save()
        logging.info(f'[Auto Sequences]: Reset the confirmation reminder async id : {lead.pk}')

    tour = Task.objects.filter(id=tour_id).first()
    if not tour:
        logging.error(
            'Tour with id - {} does not exist.'.format(tour_id))
        return
    template_type = EmailTemplate.TOUR_CONFIRMATION
    if tour.type == Task.TYPE_IN_PERSON:
        template_type = EmailTemplate.IN_PERSON_TOUR_CONFIRMATION
    if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
        template_type = EmailTemplate.SELF_GUIDED_TOUR_CONFIRMATION
    if tour.type == Task.TYPE_FACETIME:
        template_type = EmailTemplate.FACETIME_TOUR_CONFIRMATION
    if tour.type == Task.TYPE_GUIDED_VIRTUAL_TOUR:
        template_type = EmailTemplate.GUIDED_VIRTUAL_TOUR_CONFIRMATION

    try:
        send_tour_sms(tour.property.id, tour.id, is_one_day_reminder=True)
        logging.info(f'Tour notification: 1 day reminder sms sent for tour {tour.id} of type {tour.type}')

        if tour.type != Task.TYPE_GUIDED_VIRTUAL_TOUR:
            template = EmailTemplate.objects.get(type=template_type, property=lead.property)
            body = replace_value_into_content(template.text, lead)
            subject = replace_value_into_content(template.subject, lead, True)
            missed_variables = get_missed_variables(template, lead)
            if len(missed_variables):
                logging.error(
                    'Sending Tour confirmation reminder email for {} was failed as template condition is not met.'.format(
                        lead.pk))
                # to prevent concurrency issue
                send_template_variable_missing_email(lead.pk, template.type, subject, body, missed_variables)
                return
            send_email_message(body=body, subject=subject, lead=lead)
        logging.info(f'Tour notification: 1 day reminder email sent for tour {tour.id} of type {tour.type}')
    except HTTPError:
        logging.error(
            'Sending Tour confirmation reminder email / sms of {} was failed.'.format(lead.email))
        pass


@app.task(bind=True, rate_limit='1/m')
@transaction.atomic
def send_tour_confirmation_one_hour_reminder(self, lead_pk, tour_id):
    lead = Lead.objects.select_for_update().filter(pk=lead_pk).first()
    if self.request.id != lead.confirmation_sms_reminder_async_id or not lead.confirmation_sms_reminder_async_id:
        # if async task id is not registered in lead this means it's revoked. In case, we do not send reminder sms.
        return

    with transaction.atomic():
        lead.confirmation_sms_reminder_async_id = None
        lead.save()
        logging.info(f'[Auto Sequences]: Reset the confirmation 1 hour sms reminder async id : {lead.pk}')

    tour = Task.objects.filter(id=tour_id).first()
    if not tour:
        logging.error(
            'Tour with id - {} does not exist.'.format(tour_id))
        return
    try:
        send_tour_sms(tour.property.id, tour.id, is_one_hour_reminder=True)
        logging.info(f'Tour notification: 1 hour reminder sms sent for tour {tour.id} of type {tour.type}')
    except HTTPError:
        logging.error(
            'Sending Tour confirmation reminder sms of {} was failed.'.format(lead.phone_number))
        pass


@app.task(bind=True, rate_limit='1/m')
def send_followup_reminder_email(self, lead_pk, template_type):
    """
    Followup reminder email.
    :param self:
    :param lead_pk:
    :param template_type: email template type
    :return:
    """
    if not settings.REMINDER_EMAIL_ENABLED:
        return
    lead = Lead.objects.get(pk=lead_pk)
    if self.request.id != lead.followup_reminder_async_id:
        # if async task id is not registered in lead this means it's revoked. In case, we do not send reminder email.
        return
    submitted = check_application_status(lead)
    if submitted:
        send_complete_application_reminder_email(lead)
        return

    # Send
    template = EmailTemplate.objects.get(type=template_type, property=lead.property)
    body = replace_value_into_content(template.text, lead)
    subject = replace_value_into_content(template.subject, lead, True)
    missed_variables = get_missed_variables(template, lead)
    if len(missed_variables):
        logging.error('Sending followup reminder email - {} for {} was failed as template condition is not met.'.format(
            template_type, lead.pk))
        send_template_variable_missing_email(lead.pk, template.type, subject, body, missed_variables)
        lead.followup_reminder_async_id = None
        lead.save()
        return

    try:
        send_email_message(body=body, subject=subject, lead=lead)
    except HTTPError:
        logging.error('Sending followup reminder email - {} of {} was failed.'.format(template_type, lead.email))
        return

    if template_type == EmailTemplate.FINAL_FOLLOWUP:
        lead.followup_reminder_async_id = None
        lead.save()
        return

    next_template = None
    eta_days = 1
    if template_type == EmailTemplate.SECOND_FOLLOWUP:
        next_template = EmailTemplate.THIRD_FOLLOWUP
        eta_days = 2
    if template_type == EmailTemplate.THIRD_FOLLOWUP:
        next_template = EmailTemplate.FINAL_FOLLOWUP
        eta_days = 1

    eta = timezone.now() + timedelta(minutes=eta_days)
    task = send_followup_reminder_email.apply_async((lead.pk, next_template), eta=eta)
    lead.followup_reminder_async_id = task.id
    lead.save()


def send_complete_application_reminder_email(lead):
    if not settings.REMINDER_EMAIL_ENABLED:
        return
    if lead.application_complete_email_sent:
        return
    template = EmailTemplate.objects.get(type=EmailTemplate.RECEIVED_APPLICATION, property=lead.property)
    body = replace_value_into_content(template.text, lead)
    subject = replace_value_into_content(template.subject, lead, True)
    missed_variables = get_missed_variables(template, lead)
    if len(missed_variables):
        logging.error(
            'Sending received application reminder email for {} was failed as template condition is not meet.'.format(
                lead.pk))
        send_template_variable_missing_email(lead.pk, template.type, subject, body, missed_variables)
        lead.followup_reminder_async_id = None
        lead.application_complete_email_sent = True
        lead.save()
        return

    try:
        send_email_message(body=body, subject=subject, lead=lead)
    except HTTPError:
        logging.error('Sending received application reminder email of {} was failed.'.format(lead.email))
    lead.followup_reminder_async_id = None
    lead.application_complete_email_sent = True
    lead.save()
