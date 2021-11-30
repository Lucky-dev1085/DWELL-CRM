import logging
from datetime import datetime

from django.conf import settings
from django.db.models import Q
from django.template.loader import render_to_string
from nylas import APIClient

from backend.api.models import Property, Task, Calendar, Event, SMSContent, Notification
from backend.api.tasks.nylas.utils import create_event_from_nylas, send_email_message
from backend.api.tasks.push_object_task import push_object_saved
from backend.api.twilio_utils import send_twilio_message
from backend.celery_app import app


@app.task
def send_tour_event(property_id, tour_id, is_reschedule=False):
    property = Property.objects.filter(id=property_id).first()
    client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                       property.nylas_access_token)
    tour = Task.objects.filter(id=tour_id, property=property).first()
    # required calendar (primary for now: primary calendar of the account is usually uses the same name
    # as the email address, or is sometimes simply called "Calendar".)
    calendar = Calendar.objects.filter(property=property) \
        .filter(Q(name='Calendar') | Q(name=property.shared_email)).first()

    if not is_reschedule:
        event = client.events.create()
    else:
        calendar_event = Event.objects.filter(tour=tour, property=property).first()
        event = client.events.where(event_id=calendar_event.external_id).first()
    event.title = '{} at {}'.format(Task.TOUR_TYPES[tour.type], property.name)
    guided_virtual_tour_link = 'https://{}/virtual-tour'.format(property.domain)
    context = {
        'tour_type': Task.TOUR_TYPES[tour.type],
        'property_name': property.name,
        'property_phone_number': property.tracking_number,
        'property_email': property.shared_email,
        'tour_time': tour.tour_date.astimezone(tz=property.timezone)
            .strftime(f'%A, %m/%d/%Y at %I:%M %p ({property.timezone})'),
        'tour_link': 'https://{}?chat_open'.format(property.domain),
        'guided_virtual_tour_link': guided_virtual_tour_link,
    }
    email_html_message = render_to_string('email/tour_reminder_emails/tour_email.html',
                                          context)
    event.description = email_html_message
    event.location = '{}, {}'.format(property.town, property.city)
    event.when = {'time': datetime.timestamp(tour.tour_date.astimezone(tz=property.timezone))}
    participants = [
        {'name': '{} {}'.format(tour.lead.first_name, tour.lead.last_name), 'email': tour.lead.email}
    ]
    if tour.lead.owner:
        participants += [
            {'name': tour.lead.owner.name, 'email': tour.lead.owner.email}
        ]
    event.participants = participants
    event.calendar_id = calendar.external_id

    event.save(notify_participants='true')
    logging.info(f'Tour notification: Confirmation email sent for tour {tour.id} of type {tour.type}')
    create_event_from_nylas(event, property, tour)


@app.task
def delete_event(property_id, event_external_id):
    property = Property.objects.filter(id=property_id).first()
    client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                       property.nylas_access_token)
    client.events.delete(event_external_id, notify_participants='true')


@app.task
def send_tour_sms(property_id, tour_id, is_cancel=False, is_one_day_reminder=False, is_one_hour_reminder=False):
    property = Property.objects.filter(id=property_id).first()
    tour = Task.objects.filter(id=tour_id, property=property).first()
    sender = property.sms_tracking_number
    receiver = tour.lead.phone_number
    if is_one_day_reminder:
        body = 'Reminder: Your {} at {} is tomorrow! Your tour is confirmed for {}.' \
               ' We’re looking forward to seeing you!'.format(Task.TOUR_TYPES[tour.type], property.name,
                                                              tour.tour_date.astimezone(tz=property.timezone).strftime(
                                                                  '%A, %m/%d/%Y at %I:%M %p'))
    elif is_one_hour_reminder:
        if tour.type == 'GUIDED_VIRTUAL_TOUR':
            body = 'Reminder: Your {} at {} is in 1 hour! All you need to do is click the link we sent you in the' \
                   ' email invite to access the virtual tour. We\'ll be calling you at the scheduled time. Talk soon!' \
                .format(Task.TOUR_TYPES[tour.type], property.name)
        else:
            body = 'Reminder: Your {} at {} is in 1 hour! Just come to the main office, located at {}, {},' \
                   ' and ring us at the Ring Doorbell located on the front office door. We’ll have everything ready' \
                   ' to go when you get here.' \
                .format(Task.TOUR_TYPES[tour.type], property.name, property.town, property.city)
    else:
        if is_cancel:
            body = 'Your {} at {} is cancelled for {}. If you’d like to reschedule, please text us here or call {}.' \
                .format(Task.TOUR_TYPES[tour.type], property.name,
                        tour.tour_date.astimezone(tz=property.timezone).strftime('%A, %m/%d/%Y at %I:%M %p'),
                        property.tracking_number)
        else:
            if tour.type == 'VIRTUAL_TOUR':
                body = 'Thank you very much for expressing interest in our beautiful community.' \
                       ' We just sent you an email with a link to view the virtual tour. If you have any questions,' \
                       ' please text us here or call {}.'.format(property.tracking_number)
            else:
                body = 'Your {} at {} is confirmed for {}.' \
                       ' We\'re excited to show you our community and help you find your new home.' \
                    .format(Task.TOUR_TYPES[tour.type], property.name,
                            tour.tour_date.astimezone(tz=property.timezone)
                            .strftime('%A, %m/%d/%Y at %I:%M %p'), property.tracking_number)

    try:
        message = send_twilio_message(body, sender, receiver)
        logging.info(f'Tour notification: Confirmation sms sent for tour {tour.id} of type {tour.type}')
        lead = tour.lead
        if message:
            SMSContent.objects.create(
                property=lead.property,
                lead=lead,
                date=message.date_created,
                twilio_sid=message.sid,
                message=message.body,
                sender_number=sender,
                receiver_number=receiver,
                is_read=True,
            )
            lead.last_followup_date = message.date_created
            lead.save()
    except Exception as e:
        logging.error(e)


@app.task
def send_text_me_sms(property_id, lead_id, source):
    property = Property.objects.filter(id=property_id).first()
    from backend.api.models import Lead
    lead = Lead.objects.filter(id=lead_id).first()
    sender = property.sms_tracking_number
    receiver = lead.phone_number
    body = 'Thank you very much for expressing interest in our beautiful {name} community. ' \
           "We'd love to answer any questions you have and help you find your new home. " \
           'How can we help?\n\nCommunity website: {domain}'.format(
        name=property.name, domain=property.domain if source == 'SITE' else property.mark_taylor_base_url)
    try:
        message = send_twilio_message(body, sender, receiver)
        logging.info(f'Lead notification: Text me confirmation message sent for lead {lead.id}')
        if message:
            lead = Lead.objects.filter(id=lead_id).first()
            sms_content = SMSContent.objects.create(
                property=lead.property,
                lead=lead,
                date=message.date_created,
                twilio_sid=message.sid,
                message=message.body,
                sender_number=sender,
                receiver_number=receiver
            )
            lead.last_followup_date = message.date_created
            lead.save()

            for user in property.team_members:
                notification = Notification.objects.create(property=property,
                                                           type=Notification.TYPE_NEW_SMS,
                                                           content='SMS from {}: {}'.format(lead.name, message.body),
                                                           user=user,
                                                           object=sms_content)
                push_object_saved.delay(notification.id, notification.__class__.__name__, True, is_user_channel=True)
            push_object_saved.delay(sms_content.id, sms_content.__class__.__name__, True, is_user_channel=False)
    except Exception as e:
        logging.error(e)


@app.task
def send_virtual_tour_email(property_id, tour_id, host):
    property = Property.objects.filter(id=property_id).first()
    tour = Task.objects.filter(id=tour_id, property=property).first()
    lead = tour.lead
    subject = f'Your virtual tour of {property.name} is ready to view”'
    guided_virtual_tour_link = 'https://{}/virtual-tour'.format(property.domain) \
        if settings.MT_DOMAIN not in host else '{}virtual-tour'.format(property.mark_taylor_base_url
                                                                       if property.mark_taylor_base_url.endswith('/')
                                                                       else '{}/'.format(property.mark_taylor_base_url))
    context = {
        'tour_type': Task.TOUR_TYPES[tour.type],
        'property_name': property.name,
        'guided_virtual_tour_link': guided_virtual_tour_link,
        'lead_name': tour.lead.first_name
    }
    email_html_message = render_to_string('email/tour_reminder_emails/tour_email.html', context)
    send_email_message(email_html_message, subject, lead)
    logging.info(f'Tour notification: Confirmation email sent for tour {tour.id} of type {tour.type}')
