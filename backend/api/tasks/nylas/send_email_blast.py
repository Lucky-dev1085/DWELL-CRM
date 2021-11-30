from math import ceil
from time import sleep

from django.conf import settings
from requests.exceptions import HTTPError

from backend.api.models import Property, Lead, LeadsFilter
from backend.celery_app import app
from .utils import replace_variables, send_email_message, send_email_blast_notification


@app.task
def send_email_blast(filter_items, filter_type, subject, body, subject_variables, body_variables, check_lead_owner,
                     property_pk, files, is_active_only):
    """
    This task covers following three things
    - Get filtered queryset of leads using filter method provided by front-end bulk email form
    - Replace the email subject and body with variables
    - Send bulk email to filtered recipients with few seconds of break
    :param files:
    :param filter_items: filtered items -
    :param filter_type: filtered type - filter condition like is on, is between etc ..
    :param subject: subject of email
    :param body: body of email
    :param subject_variables: variables used in subject
    :param body_variables: variables used in body
    :param check_lead_owner:
    :param property_pk: primary key of current property
    :param is_active_only: determines if email blast is only for active leads
    :return:
    """
    property = Property.objects.get(pk=property_pk)
    queryset = Lead.objects.filter(property=property, email__isnull=False)
    try:
        from backend.api.views.filters import get_filtered_leads
        queryset = get_filtered_leads(queryset, filter_items, filter_type, property).order_by('pk')
        if check_lead_owner:
            queryset = queryset.filter(owner__isnull=False).order_by('pk')
        if is_active_only:
            queryset = queryset.filter(status=Lead.LEAD_ACTIVE).order_by('pk')
    except LeadsFilter.DoesNotExist:
        pass

    recipients_count = queryset.count()
    batch_size = settings.EMAIL_BLAST_BATCH_SIZE
    steps = ceil(recipients_count / batch_size)
    email_blast_sent_messages_count = 0

    for step in range(0, steps):
        leads = queryset[batch_size * step: recipients_count] \
            if step == steps - 1 else queryset[batch_size * step: batch_size * (step + 1)]

        for lead in leads:
            if property.is_email_blast_disabled:
                return

            lead_subject_variables = list(filter(lambda v: v in ['lead_full_name', 'lead_first_name', 'lead_owner'],
                                                 subject_variables))
            result_subject = replace_variables(lead, lead_subject_variables, subject, 'subject')
            lead_body_variables = list(filter(lambda v: v in ['lead_full_name', 'lead_first_name', 'lead_owner'],
                                              body_variables))
            result_body = replace_variables(lead, lead_body_variables, body, 'body')

            try:
                send_email_message(result_body, result_subject, lead, files, is_email_blast=True)
                email_blast_sent_messages_count += 1
            except HTTPError:
                pass

        sleep(settings.EMAIL_DELAY_TIME)

    # Notify property team members about email blast completion
    send_email_blast_notification(
        property, '{} has been sent successfully to {} recipients'.format(subject, email_blast_sent_messages_count)
    )
