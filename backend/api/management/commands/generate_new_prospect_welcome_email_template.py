import pytz

from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Property

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Generate new prospect welcome email template'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Generate new prospect welcome email template

        """
        for property in Property.objects.all():
            property.generate_welcome_prospect_email_template()
