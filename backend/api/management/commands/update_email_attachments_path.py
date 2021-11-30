from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import EmailAttachment


class Command(BaseCommand):
    help = 'Attach labels into emails which missed labels'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Attach labels into emails which missed labels

        """
        for attachment in EmailAttachment.objects.all():
            if 'email_attachments' in (attachment.attachment.name or ''):
                continue
            attachment.attachment.name = f'email_attachments/{attachment.attachment.name}'
            attachment.save()
