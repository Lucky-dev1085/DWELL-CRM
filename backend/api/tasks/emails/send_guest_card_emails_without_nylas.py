from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from backend.api.models import Lead, EmailTemplate
from backend.api.tasks.nylas.utils import replace_value_into_content


@app.task
def send_guest_card_emails_without_nylas(lead_pk):
    """
    Send conversion emails to properties which don't setup nylas integration yet.
    :param lead_pk:
    :return:
    """
    lead = Lead.objects.get(pk=lead_pk)
    context = {
        'conversion': lead,
        'property': lead.property,
    }
    body = render_to_string('email/conversion_email/email.html', context)

    # send guest card emails to property
    msg = EmailMultiAlternatives(
        # title:
        f'You have a new lead from {lead.property.name}',
        # message:
        None,
        # from:
        'integrate@dwell.io',
        # to:
        [lead.property.mst_property_email])
    msg.attach_alternative(body, 'text/html')
    msg.send()

    template = EmailTemplate.objects.filter(property=lead.property, type=EmailTemplate.NEW_PROSPECT_WELCOME).first()
    body = replace_value_into_content(template.text, lead)
    subject = replace_value_into_content(template.subject, lead, True)

    # send guest card emails to lead
    msg = EmailMultiAlternatives(
        # title:
        subject,
        # message:
        None,
        # from:
        'hello@dwell.io',
        # to:
        [lead.email])
    msg.attach_alternative(body, 'text/html')
    msg.send()
