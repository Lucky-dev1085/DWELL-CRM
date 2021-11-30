import pytz

from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Note

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Capture auto generated note'

    @transaction.atomic
    def handle(self, *args, **options):
        Note.objects.filter(text__contains='<strong>Call Recording Transcription:</strong>')\
            .update(is_auto_generated=True)
        Note.objects.filter(text__contains='This note was auto-generated from').update(is_auto_generated=True)
        Note.objects.filter(has_shared_lead_link=True).update(is_auto_generated=True)
