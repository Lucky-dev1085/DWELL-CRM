import time
import logging
import re
import sys
from datetime import datetime, timedelta

import backoff
import pytz
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from nylas import APIClient
from requests.exceptions import HTTPError
from rest_framework.exceptions import ValidationError

from backend.api.models import Property, EmailMessage, Lead, EmailLabel, Notification, EmailTemplate, \
    EmailAttachment, Event, Calendar, DemoEvent
from backend.api.tasks.nylas.pull_sent_email_labels import pull_message_labels
from backend.api.utils import get_value_from_array_by_key, nylas_failed_request_cb
from backend.celery_app import app


def get_nylas_client(access_token=None):
    return APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET, access_token)


def is_blacklisted(emails):
    return any(email in settings.NYLAS_BLACK_LIST_EMAILS for email in emails)


def fatal_code(e):
    return e.response.status_code in [401, 403]


def sync_property_nylas_messages_task(property, after, before):
    """
    Initial sync email messages from nylas.
    """
    client = get_nylas_client(property.nylas_access_token)
    try:
        @backoff.on_exception(backoff.fibo, HTTPError, max_tries=settings.MAX_NYLAS_RETRIES + 1, giveup=fatal_code)
        def get_messages_and_organization_unit():
            sync_messages = client.messages.where(received_after=after, received_before=before).all()
            sync_organization_unit = client.account.organization_unit
            return sync_messages, sync_organization_unit

        messages, organization_unit = get_messages_and_organization_unit()

        logging.info(f'Pulled emails from {after} to {before} for {property.name}, total count: {len(messages)}')
        is_date_validation_error = False
        for index, message in enumerate(messages):
            if index % settings.NYLAS_SYNC_MAX_EMAILS_COMMIT_IN_ONCE == 0:
                time.sleep(1.5)

            if property.nylas_sync_option == Property.NYLAS_SYNC_OPTION_ALL and \
                    is_blacklisted([sender['email'] for sender in message.get('from_')]):
                continue
            message_date = datetime.fromtimestamp(message.get('date')).replace(tzinfo=pytz.UTC)
            # Add more wide validation
            if datetime.now(pytz.UTC) - timedelta(days=settings.NYLAS_SYNC_DAYS_LIMIT) \
                    <= message_date <= datetime.now(pytz.UTC):
                create_email_message_from_nylas(message, property.id, organization_unit)
            elif not is_date_validation_error:
                logging.error(message)
                is_date_validation_error = True
    except HTTPError as e:
        nylas_failed_request_cb(e, property)


def sync_property_nylas_events_task(property):
    """
    Initial sync events from nylas.
    """
    client = get_nylas_client(property.nylas_access_token)
    try:
        @backoff.on_exception(backoff.fibo, HTTPError, max_tries=settings.MAX_NYLAS_RETRIES + 1, giveup=fatal_code)
        def get_events():
            sync_events = client.events.all()
            return sync_events

        events = get_events()
        for event in events:
            create_event_from_nylas(event, property)
    except HTTPError as e:
        nylas_failed_request_cb(e, property)


def create_event_from_nylas(event, property, tour=None):
    calendar_event = Event.objects.filter(external_id=event.id).first()
    time = datetime.fromtimestamp(
        event.when.get('time') if event.when.get('time') else event.when.get('start_time'))
    if not calendar_event:
        calendar = Calendar.objects.filter(external_id=event.calendar_id).first()
        calendar_event = Event(property=property,
                               calendar=calendar,
                               external_id=event.id,
                               title=event.title,
                               description=event.description,
                               time=time,
                               owner=event.owner,
                               participants=event.participants,
                               status=event.status,
                               location=event.location)
        if tour:
            calendar_event.tour = tour
    else:
        calendar_event.title = event.title
        calendar_event.time = time
        calendar_event.description = event.description
    calendar_event.save()


def create_demo_event_from_nylas(event, demo=None):
    demo_event = DemoEvent.objects.filter(external_id=event.id).first()
    time = datetime.fromtimestamp(
        event.when.get('time') if event.when.get('time') else event.when.get('start_time'))
    if not demo_event:
        demo_event = DemoEvent(
            external_id=event.id,
            title=event.title,
            description=event.description,
            time=time,
            owner=event.owner,
            participants=event.participants,
            status=event.status,
            location=event.location,
            demo=demo,
        )
    else:
        demo_event.title = event.title
        demo_event.time = time
        demo_event.description = event.description
    demo_event.save()


def download_file_from_nylas(id, property):
    client = get_nylas_client(property.nylas_access_token)
    file = client.files.get(id)
    return file.download()


@app.task
def create_email_message_from_nylas(message, property_id, organization_unit=None, lead_id=None,
                                    is_guest_card=False, is_email_from_dwell=False):
    """
    Create email message from nylas raw
    :param is_email_from_dwell:
    :param message: message object from email object retried from nylas API
    :param property_id: property that be owner of this email message.
    :param organization_unit: that value would be used for identifying label type
    if it's not set which means it does not require the labels. It's used for storing sent emails, the label of this
    email object will be automatically updated by webhook events job.
    :param lead_id
    :param is_guest_card: guest card emails after conversion
    :return:
    """
    property = Property.objects.filter(id=property_id).first()
    labels = []
    label_ids = []
    if organization_unit:
        is_label_format = organization_unit == 'label'
        message_labels = message.get('labels') if is_label_format else message.get('folder')
        if message_labels:
            for label in (message_labels if type(message_labels) is list else [message_labels]):
                label_ids.append(label.get('id'))
                if label.get('display_name').lower() in ['trash', 'spam']:
                    return
            labels = EmailLabel.objects.filter(external_id__in=label_ids)

    email_message = EmailMessage.objects.filter(nylas_message_id=message.get('id')).first()

    attachments = []
    if not email_message:
        message_sender_name = get_value_from_array_by_key(message.get('from_'), 'name')
        message_sender_email = get_value_from_array_by_key(message.get('from_'), 'email')
        message_cc = [cc['email'] for cc in message.get('cc')]
        if property.shared_email in message_cc:
            data = next(
                (
                    item for item in message.get('cc')
                    if item.get('email').lower() == property.shared_email.lower()
                ),
                None
            )
            message_receiver_name = data.get('name')
            message_receiver_email = data.get('email').lower()
        else:
            message_receiver_name = get_value_from_array_by_key(message.get('to'), 'name', property.shared_email)
            message_receiver_email = get_value_from_array_by_key(
                message.get('to'), 'email', property.shared_email
            ).lower()
        date = datetime.fromtimestamp(message.get('date'))

        for file in message.get('files', []):
            attachment = download_file_from_nylas(file['id'], property)
            data = SimpleUploadedFile.from_dict({
                'content': attachment,
                'filename': f'{property.external_id}-{int(message.get("date", 0))}-{file["filename"]}',
                'content-type': file['content_type']
            })
            email_attachment = EmailAttachment(external_id=file['id'], name=file['filename'],
                                               email_message=email_message, size=file['size'],
                                               content_type=file['content_type'])
            email_attachment.attachment = data
            attachments.append(email_attachment)

        email_message = EmailMessage.objects.filter(nylas_message_id=message.get('id')).first()
        if not email_message:
            email_message = EmailMessage(property=property,
                                         nylas_message_id=message.get('id'),
                                         subject=message.get('subject'),
                                         date=date.replace(tzinfo=pytz.UTC), body=message.get('body'),
                                         sender_name=message_sender_name, is_unread=message.get('unread'),
                                         sender_email=message_sender_email,
                                         receiver_name=message_receiver_name,
                                         receiver_email=message_receiver_email,
                                         snippet=message.get('snippet').replace('\u200c', '').strip(),
                                         cc=message_cc,
                                         is_guest_card_email=is_guest_card)
    if message.get('unread') != email_message.is_unread:
        email_message.is_unread = message.get('unread')

    lead = Lead.objects.filter(pk=lead_id).first()
    is_lead_page = bool(lead)

    if email_message.lead and email_message.receiver_email == email_message.lead.email or is_guest_card:
        pass
    else:
        if lead:
            # If the email is sent by Dwell app, we can just set the lead
            email_message.lead = lead
        elif email_message.sender_email and email_message.receiver_email:
            # If the email comes from webhook or daily sync task and it does not have lead assigned, then we should
            # filter the most recent lead and assign it to the email
            lead = Lead.objects.exclude(email=property.shared_email).filter(
                email__in=[email_message.sender_email, email_message.receiver_email],
                property=property
            ).order_by('-acquisition_date').first()
            if lead:
                email_message.lead = lead
                if lead.status != Lead.LEAD_CLOSED and lead.stage != Lead.STAGE_APPLICATION_COMPLETE \
                        and lead.last_followup_date and lead.last_followup_date < timezone.now() - timedelta(days=14):
                    # If the lead followed up before than last 14 days, then we should treat this lead as new one
                    lead.acquisition_date = timezone.now()
                    lead.save()

    if organization_unit:
        email_message.is_archived = False
        if organization_unit == 'label' and len(labels) == 1 and labels[0].name == 'All Mail':
            email_message.is_archived = True
        if organization_unit != 'label' and len(labels) == 1 and labels[0].name == 'Archive':
            email_message.is_archived = True
    email_message.save()
    email_message.labels.set(labels)
    if not labels and not is_lead_page:
        # If it's not sent emails but not have labels, then should be issue.
        logging.info(
            'Label was not set for email {} of property {}: label ids - {}'.format(email_message.pk, property.name,
                                                                                   ','.join(label_ids)))
    for attachment in attachments:
        attachment.email_message = email_message
        attachment.save()

    if is_email_from_dwell:
        pull_message_labels(email_message.nylas_message_id, property_id)

    return email_message


def giveup_handler(details):
    """
    We should check if main object is lead or conversion as we send guest card emails using Nylas
    :param details:
    :return:
    """
    e = sys.exc_info()[1]
    lead = details.get('args')[2]
    is_email_blast = details.get('kwargs').get('is_email_blast', False)
    if not lead:
        conversion = details.get('args')[4]
        property = conversion.property
    else:
        property = lead.property

    if e.response.status_code in [401, 403]:
        nylas_failed_request_cb(e, property)
    elif is_email_blast:
        logging.error(f'Email blast failed with status {e.response.status_code}: {e.response.reason}')


@backoff.on_exception(backoff.fibo, HTTPError, max_tries=settings.MAX_NYLAS_RETRIES + 1, giveup=fatal_code,
                      on_giveup=giveup_handler)
def send_email_message(body, subject, lead=None, files=None, is_guest_card=False, is_email_blast=False):
    """
    Send email message using nylas for individual lead.
    :param is_email_blast:
    :param files:
    :param body:
    :param subject:
    :param lead: lead object
    :param is_guest_card
    :return:
    """
    property = lead.property
    receiver = {'email': lead.email, 'name': '{} {}'.format(lead.first_name, lead.last_name)}
    client = get_nylas_client(property.nylas_access_token)
    draft = client.drafts.create()
    draft.body = body
    draft.subject = subject
    draft.to = [receiver]
    draft.from_ = [{'email': property.shared_email, 'name': '{} team'.format(property.name)}]
    if files:
        draft.file_ids = files
    message = draft.send()

    property.sent_email_count += 1
    property.save()

    message['from_'] = message.pop('from')
    create_email_message_from_nylas(message, property.id, lead_id=lead.id if lead else None,
                                    is_guest_card=is_guest_card, is_email_from_dwell=True)


def send_email_blast_notification(property, content):
    for user in property.team_members:
        Notification.objects.create(property=property, type=Notification.TYPE_EMAIL_BLAST_COMPLETED,
                                    content=content, user=user)


def replace_variables(lead, variables, email_component, component_type):
    for variable in variables:
        if variable == 'lead_full_name':
            email_component = email_component.replace(
                '<span class="email-placeholder">[=Lead full name=]</span>'
                if component_type == 'body' else '[=Lead full name=]', '{} {}'.format(lead.first_name, lead.last_name))
        if variable == 'lead_first_name':
            email_component = email_component.replace(
                '<span class="email-placeholder">[=Lead first name=]</span>'
                if component_type == 'body' else '[=Lead first name=]', lead.first_name)
        if variable == 'lead_owner':
            owner_name = '{} {}'.format(lead.owner.first_name, lead.owner.last_name) if lead.owner else ''
            email_component = email_component.replace(
                '<span class="email-placeholder">[=Lead owner=]</span>'
                if component_type == 'body' else '[=Lead owner=]', owner_name)
    return email_component


def parse_variables(content):
    """
    Extract variables from content
    :param content:
    :return:
    """
    email_vars = re.findall(r'\[=(.*?)=\]', content)
    email_vars = [re.sub(r'[\[=\]]', '', var) for var in email_vars]
    return [variable for variable in EmailTemplate.VARIABLE_CHOICES.keys()
            if EmailTemplate.VARIABLE_CHOICES[variable] in email_vars]


def find_variable_value(variables, lead):
    """
    Find the value of variable
    :param variables:
    :param lead:
    :return:
    """
    property = lead.property
    result = {}
    for variable in variables:
        parsed_variable = re.split(r'_(.+)', variable)
        if len(parsed_variable) < 2:
            continue
        model_object = parsed_variable[0]
        field = parsed_variable[1]

        result[variable] = None
        if model_object == 'lead':
            if field == 'full_name' and lead.first_name and lead.last_name:
                if lead.first_name == '-' and lead.last.name == '-':
                    result[variable] = 'potential resident'
                else:
                    result[variable] = f'{lead.first_name} {lead.last_name}'
            elif field == 'first_name' and lead.first_name == '-':
                result[variable] = 'potential resident'
            elif field == 'owner' and lead.owner:
                result[variable] = f'{lead.owner.first_name} {lead.owner.last_name}'
            elif getattr(lead, field, None):
                result[variable] = getattr(lead, field)

        if model_object == 'property':
            if field == 'address' and property.town and property.city:
                result[variable] = f'{property.city}, {property.town}'
            elif field == 'website':
                result[variable] = property.domain
            elif field == 'website_link':
                result[variable] = '<a href="https://{}?chat_open" target="_blank">here</a>'.format(property.domain)
            elif getattr(property, field, None):
                result[variable] = getattr(property, field)

        if model_object == 'tour':
            task = lead.tasks.filter(
                tour_confirmation_reminder_enabled=True,
                type__in=['TOUR', 'VIRTUAL_TOUR', 'GUIDED_VIRTUAL_TOUR', 'IN_PERSON', 'FACETIME', 'SELF_GUIDED_TOUR']
            ).first()
            if task and field == 'time':
                result[variable] = task.tour_date.astimezone(tz=property.timezone).strftime(
                    f'%A, %m/%d/%Y at %I:%M %p ({property.timezone})')

        if variable == 'virtual_tour_link':
            result[variable] = f'https://{property.domain}/virtual-tour'
    return result


def get_missed_variables(template, lead):
    """
    Get missed variables from template
    :param template:
    :param lead:
    :return:
    """
    variables = find_variable_value(parse_variables(template.subject), lead)
    missed_variables = [key for key in variables.keys() if not variables[key]]
    variables = find_variable_value(parse_variables(template.text), lead)
    missed_variables += [key for key in variables.keys() if not variables[key]]
    return list(set(missed_variables))


def replace_value_into_content(content, lead, is_subject=False):
    """
    Insert value into content
    :param content:
    :param lead:
    :param is_subject: bool
    :return:
    """
    variables = find_variable_value(parse_variables(content), lead)
    for key in variables.keys():
        if variables[key]:
            if is_subject:
                target = '[=%s=]' % EmailTemplate.VARIABLE_CHOICES[key]
            else:
                target = '<span class="email-placeholder">[=%s=]</span>' % EmailTemplate.VARIABLE_CHOICES[key]
            content = content.replace(target, variables[key])
    return content


def upload_files(files, property):
    file_ids = []
    try:
        client = get_nylas_client(property.nylas_access_token)
        if files:
            for file in files:
                message_file = client.files.create()
                message_file.filename = file.name
                message_file.content_type = file.content_type
                message_file.stream = file
                message_file.save()
                file_ids.append(message_file['id'])
    except HTTPError as e:
        nylas_failed_request_cb(e, property)
        raise ValidationError(e)
    return file_ids
