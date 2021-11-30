from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Lead


class Command(BaseCommand):
    help = 'Back up missed last followup date'

    @transaction.atomic
    def handle(self, *args, **options):
        for lead in Lead.objects.filter(property__is_released=True,
                                        last_followup_date=None).exclude(email_messages=None):
            lead.last_followup_date = lead.email_messages.order_by('-date').first().date
            lead.save()
