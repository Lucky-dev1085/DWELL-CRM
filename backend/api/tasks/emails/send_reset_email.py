from backend.celery_app import app
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


@app.task
def send_reset_email_task(uri, user_data):
    context = {
        'current_user': user_data.get('current_user', ''),
        'first_name': user_data.get('first_name', ''),
        'email': user_data.get('email', ''),
        'reset_password_url': '{}/{}'.format(uri, user_data.get('token', '')),
        'logo_url': user_data.get('logo_url', ''),
    }

    # render email text
    email_html_message = render_to_string('email/reset_password/user_reset_password.html',
                                          context)
    email_plaintext_message = render_to_string('email/reset_password/user_reset_password.txt',
                                               context)

    msg = EmailMultiAlternatives(
        # title:
        'Password Reset',
        # message:
        email_plaintext_message,
        # from:
        'hello@liftlytics.com',
        # to:
        [user_data.get('email', '')])
    msg.attach_alternative(email_html_message, 'text/html')
    msg.send()
