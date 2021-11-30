from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from backend.api.models import Lead, EmailTemplate


@app.task
def send_template_variable_missing_email(lead_pk, template_type, subject, body, variables):
    """
    Send a warning email to the property with details of missing variables for auto sequence email.
    :param lead_pk:
    :param template_type:
    :param subject:
    :param body:
    :param variables:
    :return:
    """
    lead = Lead.objects.get(pk=lead_pk)
    context = {
        'variables': [EmailTemplate.VARIABLE_CHOICES[key] for key in variables],
        'lead': lead,
        'property': lead.property,
        'subject': subject,
        'body': body,
        'email_type': next((choice[1].lower() for choice in EmailTemplate.TYPE_CHOICES if choice[0] == template_type),
                           None),
    }
    template = render_to_string('email/template_condition_warning/email.html', context)

    msg = EmailMultiAlternatives(
        # title:
        'Auto sequence email was not sent due to variable missing issue.',
        # message:
        None,
        # from:
        'do-not-reply@ils.dwell.io',
        # to:
        [lead.property.shared_email, 'jakub@liftlytics.com'])
    msg.attach_alternative(template, 'text/html')
    msg.send()
