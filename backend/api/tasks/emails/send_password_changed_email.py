from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


@app.task
def send_password_changed_task(user_data):
    context = {
        'email': user_data.get('email', ''),
        'name': user_data.get('name', ''),
    }

    # render email text
    email_html_message = render_to_string('email/change_password/user_changed_password.html',
                                          context)
    email_plaintext_message = render_to_string('email/change_password/user_changed_password.txt',
                                               context)

    msg = EmailMultiAlternatives(
        # title:
        'Password changed for Dwell account',
        # message:
        email_plaintext_message,
        # from:
        'support@liftlytics.com',
        # to:
        [user_data.get('email', '')])
    msg.attach_alternative(email_html_message, 'text/html')
    msg.send()
