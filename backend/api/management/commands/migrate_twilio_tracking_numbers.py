from twilio.rest import Client

from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings

from backend.api.models import PhoneNumber


class Command(BaseCommand):
    help = 'Migrate twilio tracking numbers by updating Studio Flor webhook URL'

    @transaction.atomic
    def handle(self, *args, **options):
        for number in PhoneNumber.objects.filter(type=PhoneNumber.TYPE_TRACKING):
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.incoming_phone_numbers(number.twilio_sid).update(
                voice_url=f'https://webhooks.twilio.com/v1/Accounts/{settings.TWILIO_ACCOUNT_SID}'
                          f'/Flows/{settings.TWILIO_STUDIO_ID}',
            )
