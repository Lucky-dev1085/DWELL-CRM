import redis
import json
import logging
from datetime import timedelta, datetime

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from django.db import connection

from nylas import APIClient
from requests.exceptions import HTTPError
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.api import views
from backend.api.models import EmailMessage, Property, LeadsFilter, Lead, EmailTemplate, ILSEmail
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import EmailMessageSerializer
from backend.api.tasks import archive_messages_task, create_email_message_from_nylas, send_email_blast, \
    send_followup_reminder_email, receive_emails_by_webhook, push_object_saved
from backend.api.tasks.nylas.utils import upload_files
from backend.api.utils import nylas_failed_request_cb, nylas_failed_send_request, get_pusher_socket_id

logging.getLogger().setLevel(logging.INFO)


class EmailMessageView(views.BaseViewSet):
    serializer_class = EmailMessageSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        current_property = self.request.property
        queryset = EmailMessage.objects.filter(property=current_property, is_guest_card_email=False)
        lead_pk = self.request.query_params.get('lead_id')
        if lead_pk:
            if Lead.objects.filter(pk=lead_pk).first().shared_leads.filter(property=current_property).exists():
                return EmailMessage.objects.filter(lead=lead_pk, is_guest_card_email=False).order_by('-date')
            queryset = queryset.filter(lead=lead_pk).order_by('-date')
            return queryset
        else:
            queryset = queryset.filter(is_replied_to=False, receiver_email=current_property.shared_email,
                                       is_archived=False).order_by('-date')
            return queryset.filter(
                labels__in=current_property.nylas_selected_labels.all()).distinct() \
                if current_property.nylas_selected_labels.count() and not \
                current_property.nylas_sync_option == Property.NYLAS_SYNC_OPTION_ALL else queryset

    @action(methods=['POST'], detail=False, permission_classes=[IsAuthenticated, DwellAuthorized])
    def archive_messages(self, request, **kwargs):
        current_property = Property.objects.get(pk=request.property.pk)
        for message_id in request.data.get('ids'):
            email_message = EmailMessage.objects.filter(pk=message_id).first()
            if email_message:
                email_message.is_archived = True
                email_message.save()
        archive_messages_task.delay(current_property.pk, request.data.get('ids'))
        # todo should rebuild
        # push_bulk_update_event(request, request.data.get('ids'), 'emailmessage')
        return Response(dict(success=True, ids=request.data.get('ids')), status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, permission_classes=[IsAuthenticated, DwellAuthorized])
    def send_message(self, request, **kwargs):
        property = Property.objects.get(pk=request.property.pk)
        message_data = json.loads(request.data.get('message_data'))
        lead = Lead.objects.filter(pk=message_data.get('lead')).first()
        client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                           property.nylas_access_token)
        try:
            draft = client.drafts.create()
            draft.body = message_data.get('body')
            draft.subject = message_data.get('subject')
            draft.to = [message_data.get('receiver')]
            draft.from_ = [message_data.get('sender')]
            if message_data.get('cc'):
                draft.cc = request.data.get('cc')
            if message_data.get('message_id'):
                email_message = EmailMessage.objects.filter(pk=message_data.get('message_id')).first()
                nylas_message_id = email_message.nylas_message_id
                message = client.messages.get(nylas_message_id)
                draft.reply_to_message_id = message.id
                email_message.is_replied_to = True
                email_message.save()
            if request.FILES.getlist('files'):
                files = request.FILES.getlist('files')
                for file in files:
                    message_file = client.files.create()
                    message_file.filename = file.name
                    message_file.content_type = file.content_type
                    message_file.stream = file
                    message_file.save()
                    draft.attach(message_file)
            message = draft.send()

            property.sent_email_count += 1
            property.save()
        except HTTPError as e:
            if e.response.status_code in [401, 403]:
                nylas_failed_request_cb(e, property)
            else:
                nylas_failed_send_request(e, property, lead)
            error_response_body = json.loads(e.response.content)
            raise ValidationError('Error message: {}: {}'.format(error_response_body.get('type'),
                                                                 error_response_body.get('message')))
        message['from_'] = message.pop('from')
        email_message = create_email_message_from_nylas(
            message, property.id, lead_id=lead.id if lead else None, is_email_from_dwell=True
        )

        if message_data.get('send_followup_email'):
            task = send_followup_reminder_email.apply_async((lead.pk, EmailTemplate.SECOND_FOLLOWUP),
                                                            eta=timezone.now() + timedelta(minutes=2))
            lead.followup_reminder_async_id = task.id
            lead.application_complete_email_sent = False
            lead.save()

        response = EmailMessageSerializer(email_message).data

        request_data = dict(user_id=request.user.id, property_id=request.property.id)
        socket_id = get_pusher_socket_id(request)

        def push_delayed():
            push_object_saved.delay(
                response.get('id'), email_message.__class__.__name__, True, socket_id,
                request_data=request_data
            )

        connection.on_commit(push_delayed)
        return Response(response, status=status.HTTP_200_OK)

    @action(methods=['GET', 'POST'], detail=False, permission_classes=[])
    def created(self, request, **kwargs):
        if request.method == 'POST':
            for delta in request.data.get('deltas', []):
                if delta.get('type') == 'message.created':
                    property = Property.objects.filter(
                        nylas_account_id=delta.get('object_data').get('account_id')).first()
                    if property and property.nylas_status == property.NYLAS_STATUS_CONNECTED:
                        r = redis.Redis.from_url(settings.NYLAS_WEBHOOK_PAYLOADS_REDIS)
                        webhook_payloads = r.get('nylas_webhook_payloads')
                        if not webhook_payloads:
                            webhook_payloads = dict(
                                date=timezone.now().astimezone(timezone.utc).strftime('%d/%m/%y %H:%M:%S'),
                                payloads=[(property.pk, delta.get('object_data').get('id'))]
                            )
                        else:
                            webhook_payloads = json.loads(webhook_payloads)
                            webhook_payloads['payloads'].append((property.pk, delta.get('object_data').get('id')))

                        last_updated_time = datetime.strptime(
                            webhook_payloads['date'], '%d/%m/%y %H:%M:%S').replace(tzinfo=timezone.utc)
                        if last_updated_time < timezone.now().astimezone(timezone.utc) - timedelta(minutes=1):
                            r.delete('nylas_webhook_payloads')
                            receive_emails_by_webhook.delay(webhook_payloads['payloads'])
                        else:
                            r.set('nylas_webhook_payloads', json.dumps(webhook_payloads), ex=timedelta(hours=1))
        return HttpResponse(request.GET.get('challenge'))

    @action(methods=['GET', 'POST'], detail=False, permission_classes=[])
    def receive_ils_emails(self, request, **kwargs):
        import json
        if not settings.ILS_ENABLED:
            return HttpResponse()
        try:
            content = json.loads(json.loads(request.body).get('Message', dict()))
        except Exception:
            logging.error('We are unable to read emails - %s' % request.body)
            return HttpResponse()
        if content.get('notificationType') == 'Received':
            sender = content['mail']['commonHeaders']['from'][0]
            receiver = content['receipt']['recipients'][0]
            body = content['content']

            logging.info('Creating ILS emails ...')
            if receiver == 'do-not-reply@ils.dwell.io':
                logging.info('Do not reply email.')
                return HttpResponse()

            if ILSEmail.objects.filter(body=body, email=receiver).exists():
                logging.info('Existing ILS email.')
                return HttpResponse()

            sender_whitelist = ['@govyrl.com', '@liftlytics.com', '@apartmentlist.com', '@dwell.io',
                                '@g5searchmarketing.com', '@ils.dwell.io']

            if not len([domain for domain in sender_whitelist if domain in sender]):
                logging.info('Blacklist ILS email.')
                return HttpResponse()

            ILSEmail.objects.create(body=body, email=receiver)
            logging.info('Created ILS emails.')
        return HttpResponse()

    @action(methods=['POST'], detail=False, permission_classes=[DwellAuthorized])
    def bulk_email(self, request, **kwargs):
        message_data = json.loads(request.data.get('message_data'))
        subject = message_data.get('subject')
        body = message_data.get('body')
        subject_variables = message_data.get('subject_variables', [])
        body_variables = message_data.get('body_variables', [])
        filter_items = message_data.get('filter_items', [])
        filter_type = message_data.get('filter_type', LeadsFilter.TYPE_ALL)
        check_lead_owner = message_data.get('check_lead_owner', False)
        is_active_only = message_data.get('is_active_only', True)
        files = request.FILES.getlist('files')
        file_ids = upload_files(files, request.property)
        send_email_blast.delay(filter_items, filter_type, subject, body, subject_variables, body_variables,
                               check_lead_owner, request.property.pk, file_ids, is_active_only)
        return Response(dict(success=True), status=status.HTTP_200_OK)
