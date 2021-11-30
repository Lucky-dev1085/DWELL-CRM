from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from backend.api.models import Property


@app.task
def send_email_template_activity_email(property_pk, body, subject):
    """
    Subject: Send email template CRUD activity to the team members via email
     <property team member> <action: deleted, created, edited> email template <email template name>
    i.e Subject example: John Smith edited email template Tour Greeting

    Body: Property team member <first name> <last name> <action: deleted, edited, created> email template
     <email template name> for <property name>. (if edit or create) Click here to view the <action: edited, new>
     template - <template name>.
    i.e. Property team member John Smith edited email template Tour Greeting for San Milan. Click here to view edited
     template - Tour Greeting.
    :param property_pk:
    :param body:
    :param subject:
    :return:
    """
    property = Property.objects.get(pk=property_pk)

    msg = EmailMultiAlternatives(
        # title:
        body,
        # message:
        None,
        # from:
        'hello@dwell.io',
        # to:
        [property.shared_email]
    )
    msg.attach_alternative(subject, 'text/html')
    msg.send()
