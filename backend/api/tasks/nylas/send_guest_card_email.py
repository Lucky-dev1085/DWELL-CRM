from backend.celery_app import app
from backend.api.models import Lead, EmailTemplate
from backend.api.tasks.nylas.utils import replace_value_into_content
from .utils import send_email_message


@app.task
def send_guest_card_email(lead_pk):
    """
    Send guest card emails for conversion
    :param lead_pk:
    :return:
    """
    lead = Lead.objects.get(pk=lead_pk)

    template = EmailTemplate.objects.filter(property=lead.property, type=EmailTemplate.NEW_PROSPECT_WELCOME).first()
    body = replace_value_into_content(template.text, lead)
    subject = replace_value_into_content(template.subject, lead, True)

    send_email_message(body, subject, lead=lead, is_guest_card=True)
