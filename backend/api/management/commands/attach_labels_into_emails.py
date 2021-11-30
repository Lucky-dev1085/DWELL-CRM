from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.tasks.nylas.utils import get_nylas_client

from backend.api.models import EmailLabel, EmailMessage


class Command(BaseCommand):
    help = 'Attach labels into emails which missed labels'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Attach labels into emails which missed labels

        """
        queryset = EmailMessage.objects.filter(labels=None, date__date__gte='2020-03-01')
        print('Totally {} emails does not have label'.format(queryset.count()))
        for email in queryset:
            client = get_nylas_client(email.property.nylas_access_token)
            try:
                message = client.messages.get(email.nylas_message_id)
            except Exception as e:
                print(e)
                continue
            message_labels = message.labels if client.account.organization_unit == 'label' else message.folder
            if message_labels:
                label_ids = []
                for label in (message_labels if type(message_labels) is list else [message_labels]):
                    label_ids.append(label.get('id'))
                    if label.get('display_name').lower() in ['trash', 'spam']:
                        return
                labels = EmailLabel.objects.filter(external_id__in=label_ids)
                print(labels)
                email.labels.set(labels)
            else:
                print(f'Label is missing for {email.pk}')
