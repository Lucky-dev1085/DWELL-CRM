from django.dispatch import receiver
from django.conf import settings

from django_rest_passwordreset.signals import reset_password_token_created, post_password_reset

from backend.api.tasks import send_reset_email_task


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args,
                                 **kwargs):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    :param sender: View Class that sent the signal
    :param instance: View Instance that sent the signal
    :param reset_password_token: Token Model Object
    :param args:
    :param kwargs:
    :return:
    """
    uri = '{}/password-reset'.format(settings.CRM_HOST)
    user_data = {
        'current_user': str(reset_password_token.user),
        'first_name': reset_password_token.user.first_name,
        'email': reset_password_token.user.email,
        'token': reset_password_token.key,
        'logo_url': '{}/static/images/mt-logo.png'.format(settings.CRM_HOST)
    }
    send_reset_email_task.delay(uri, user_data)


@receiver(post_password_reset)
def post_password_reset(user, **kwargs):
    user.is_password_changed = True
    user.save()
