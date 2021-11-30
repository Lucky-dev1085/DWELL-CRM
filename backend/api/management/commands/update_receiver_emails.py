import backoff

from datetime import datetime

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date
from django.db.models import Q
from requests.exceptions import HTTPError

from backend.api.models import Property
from backend.api.tasks.nylas.utils import get_nylas_client, fatal_code, is_blacklisted
from backend.api.utils import nylas_failed_request_cb, get_value_from_array_by_key


class Command(BaseCommand):
    help = 'Update email messages receiver'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start',
            help="""Start date."""
        )

        parser.add_argument(
            '--end',
            help="""End date."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Update email messages receiver

        """
        start_date = parse_date(options.get('start', '2020-11-01'))
        end_date = parse_date(options.get('end', '2020-12-01'))
        properties = Property.objects.filter(nylas_status=Property.NYLAS_STATUS_CONNECTED)
        for property in properties:
            email_messages = property.email_messages.filter(
                ~Q(sender_email=property.shared_email) & ~Q(receiver_email=property.shared_email)
            )
            if not email_messages.count():
                continue
            print(f'Invalid email messages count: {email_messages.count()}')
            after = str(datetime.combine(start_date, datetime.min.time()).timestamp())
            before = str(datetime.combine(end_date, datetime.max.time()).timestamp())
            client = get_nylas_client(property.nylas_access_token)
            try:
                @backoff.on_exception(backoff.fibo, HTTPError, max_tries=settings.MAX_NYLAS_RETRIES + 1,
                                      giveup=fatal_code)
                def get_messages():
                    sync_messages = client.messages.where(received_after=after, received_before=before).all()
                    return sync_messages

                messages = get_messages()
                for message in messages:
                    if property.nylas_sync_option == Property.NYLAS_SYNC_OPTION_ALL and \
                            is_blacklisted([sender['email'] for sender in message.get('from_')]):
                        continue
                    email_message = email_messages.filter(nylas_message_id=message.get('id')).first()
                    if email_message:
                        message_cc = [cc['email'] for cc in message.get('cc')]
                        if property.shared_email in message_cc:
                            data = next(
                                (
                                    item for item in message.get('cc')
                                    if item.get('email').lower() == property.shared_email.lower()
                                ),
                                None
                            )
                            message_receiver_name = data.get('name')
                            message_receiver_email = data.get('email').lower()
                        else:
                            message_receiver_name = get_value_from_array_by_key(message.get('to'), 'name',
                                                                                property.shared_email)
                            message_receiver_email = get_value_from_array_by_key(message.get('to'), 'email',
                                                                                 property.shared_email).lower()
                        email_message.receiver_name = message_receiver_name
                        email_message.receiver_email = message_receiver_email
                        email_message.save()
            except HTTPError as e:
                nylas_failed_request_cb(e, property)
