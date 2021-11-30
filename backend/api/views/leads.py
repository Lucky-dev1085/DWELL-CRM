import uuid
import phonenumbers
from collections import namedtuple

from django.db import connection
from django.db.models import Q, F, Value
from django.db.models.functions import Concat
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api import views
from backend.api.models import Lead, LeadsFilter, SMSContent, Notification, PhoneNumber, ChatConversation
from backend.api.permissions import DwellAuthorized, PublicLeadAccessAuthorized
from backend.api.serializer import LeadListSerializer, LeadDetailSerializer, LeadCreateSerializer, \
    LeadNameListSerializer, BulkEditSerializer, LeadMergeSerializer, LeadSMSListSerializer, LeadShareSerializer, \
    PublicLeadDetailSerializer, PublicLeadCreateSerializer
from backend.api.serializer.lead import LeadCommunicationSerializer
from backend.api.utils import push_bulk_update_event, push_bulk_delete_event, sort_leads, is_matching_keyword
from backend.api.views.filters import get_filtered_leads
from backend.api.views.notification_creation import lead_notification
from backend.api.tasks import push_object_saved
from .pagination import LeadsPagination
from .mixin import GetSerializerClassMixin, PusherMixin


class LeadBaseView(GetSerializerClassMixin, PusherMixin, views.BaseViewSet):
    queryset = Lead.objects.all()

    def perform_create(self, serializer, **kwargs):
        lead = serializer.save(
            property=self.request.property,
            actor=self.request.user,
            pms_sync_status='SYNCING',
            **kwargs
        )
        # we presume the lead to have been in contact with team member (phone call, face-to-face walk-in, or other)
        # when it's added by Dwell app
        if serializer.initial_data.get('has_followup'):
            lead.last_followup_date = lead.created
            lead.save()

        pms_sync_delayed = lead.pms_sync()
        if pms_sync_delayed:
            connection.on_commit(pms_sync_delayed)
        return lead

    def perform_update(self, serializer):
        old_lead = Lead.objects.filter(pk=self.kwargs.get('pk')).first()
        lead = serializer.save(property=self.request.property, actor=self.request.user, pms_sync_status='SYNCING')
        lead_notification(self.request, lead, old_lead)
        pms_sync_delayed = lead.pms_sync(lead.owner != old_lead.owner)
        if pms_sync_delayed:
            connection.on_commit(pms_sync_delayed)


class LeadView(LeadBaseView):
    serializer_class = LeadListSerializer
    serializer_action_classes = {
        'create': LeadCreateSerializer,
        'list': LeadListSerializer,
        'retrieve': LeadDetailSerializer,
        'partial_update': LeadDetailSerializer
    }
    pagination_class = LeadsPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number', 'roommates__first_name',
                     'roommates__last_name', 'roommates__email', 'roommates__phone_number']
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        filter_id = self.request.GET.get('filter_id')
        queryset = Lead.objects.filter(property=self.request.property)
        if filter_id:
            if filter_id in ['all_leads', 'my_leads', 'active_leads']:
                queryset = queryset.filter(acquisition_date__gte=timezone.now() - timedelta(days=120))
                if filter_id == 'my_leads':
                    queryset = queryset.filter(owner=self.request.user, status=Lead.LEAD_ACTIVE)
                elif filter_id == 'active_leads':
                    queryset = queryset.filter(status=Lead.LEAD_ACTIVE)
            else:
                try:
                    lead_filter = LeadsFilter.objects.get(pk=filter_id)
                    queryset = get_filtered_leads(queryset, [item for item in lead_filter.filter_items.all().values()],
                                                  lead_filter.filter_type, self.request.property)
                except LeadsFilter.DoesNotExist:
                    pass

        if self.kwargs.get('pk'):
            lead = Lead.objects.filter(pk=self.kwargs.get('pk')).first()
            if lead and lead.shared_leads.filter(property=self.request.property).exists():
                queryset |= Lead.objects.filter(id=self.kwargs.get('pk'))
        queryset = queryset.order_by('-acquisition_date')
        return queryset

    def get_serializer_context(self):
        context = super(LeadView, self).get_serializer_context()
        context.update({'request': self.request})
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.filter(~Q(status=Lead.LEAD_TEST))

        field = self.request.query_params.get('field')
        order = self.request.query_params.get('order')
        if order and field:
            queryset = sort_leads(queryset, field, order)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def filtered_leads_count(self, request, **kwargs):
        filter_items = request.data.get('filter_items', [])
        filter_type = request.data.get('filter_type', LeadsFilter.TYPE_ALL)
        queryset = Lead.objects.filter(property=self.request.property, email__isnull=False)
        queryset = get_filtered_leads(queryset, filter_items, filter_type, self.request.property)
        check_lead_owner = request.data.get('check_lead_owner', False)
        if check_lead_owner:
            queryset = queryset.filter(owner__isnull=False)
        is_active_only = request.data.get('is_active_only', True)
        if is_active_only:
            queryset = queryset.filter(status=Lead.LEAD_ACTIVE)
        return Response(dict(count=queryset.count()), status=200)

    @action(methods=['PUT'], detail=False)
    def bulk_update(self, request, **kwargs):
        serializer = BulkEditSerializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        push_bulk_update_event(request, request.data.get('ids', []), 'lead')
        return Response(dict(success=True), status=202)

    @action(methods=['DELETE'], detail=False)
    def bulk_delete(self, request, **kwargs):
        ids = request.data.get('ids', [])
        Lead.objects.filter(pk__in=ids).delete()
        push_bulk_delete_event(request, ids, 'lead')
        return Response(dict(success=True), status=204)

    @action(methods=['GET'], detail=False)
    def names(self, request, **kwargs):
        serializer = LeadNameListSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=True)
    def run_test_sync(self, request, **kwargs):
        return Response(dict(), status=200)

    @action(methods=['POST'], detail=False)
    def merge(self, request, **kwargs):
        serializer = LeadMergeSerializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(dict(success=True), status=200)

    @action(methods=['GET'], detail=False)
    def sms_contacts(self, request, **kwargs):
        queryset = self.get_queryset().filter(
            phone_number__isnull=False, acquisition_date__gte=timezone.now() - timedelta(days=120)
        ).exclude(phone_number__exact='')
        serializer = LeadSMSListSerializer(queryset, many=True)
        return Response(serializer.data, status=200)

    @action(methods=['POST'], detail=False)
    def share(self, request, **kwargs):
        RequestObject = namedtuple('RequestObject', ['user', 'property'])
        context = {'request': RequestObject(user=self.request.user, property=self.request.property)}
        serializer = LeadShareSerializer(data=self.request.data, context=context)
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()
        return Response(LeadDetailSerializer(lead, context=context).data, status=200)

    @action(methods=['POST'], detail=True, permission_classes=[IsAuthenticated, IsAdminUser],
            authentication_classes=[SessionAuthentication])
    def send_test_sms_message(self, *args, **kwargs):
        lead = Lead.objects.get(pk=kwargs.get('pk'))
        if not settings.TWILIO_ACCOUNT_SID:
            receiver_number = phonenumbers.parse(lead.phone_number, 'US')
            sms_tracking_number = PhoneNumber.objects.filter(property=lead.property, type=PhoneNumber.TYPE_SMS).first()
            if not sms_tracking_number:
                return Response(dict(sucess=False), status=400)
            sms_content = SMSContent.objects.create(
                property=lead.property,
                lead=lead,
                sender_number='+{}{}'.format(receiver_number.country_code, receiver_number.national_number),
                receiver_number=sms_tracking_number.phone_number,
                message=self.request.POST.get('message'),
                date=timezone.now(),
                twilio_sid=str(uuid.uuid4())
            )
            for user in lead.property.team_members:
                notification = Notification.objects.create(property=lead.property,
                                                           type=Notification.TYPE_NEW_SMS,
                                                           content='SMS from {}: {}'.format(
                                                               lead.name, self.request.POST.get('message')),
                                                           user=user,
                                                           object=sms_content)
                push_object_saved.delay(notification.id, notification.__class__.__name__, True, is_user_channel=True)
            push_object_saved.delay(sms_content.id, sms_content.__class__.__name__, True, is_user_channel=False)
        return Response(dict(success=True), status=201)

    @action(methods=['GET'], detail=True)
    def communications(self, request, **kwargs):
        lead = self.get_object()
        if lead.source_lead:
            lead = lead.source_lead
        property = lead.property

        RequestObject = namedtuple('RequestObject', ['user', 'property'])
        context = {'request': RequestObject(user=self.request.user, property=self.request.property)}

        type = request.GET.get('type')  # all/note/update/call/email/sms/chat
        record_limit = request.GET.get('record_limit')
        record_limit = int(record_limit) if record_limit else None
        # limit = int(request.GET.get('limit', 20))
        # offset = int(request.GET.get('offset', 0))
        keyword = request.GET.get('keyword', '').strip()

        activities_filter = Q(pk__in=[])
        calls_filter = Q(pk__in=[])
        emails_filter = Q(pk__in=[])
        sms_filter = Q(pk__in=[])
        chats_filter = Q(pk__in=[])
        notes_filter = Q(pk__in=[])

        if type == 'note':
            notes_filter = Q()
        elif type == 'update':
            activities_filter = ~Q(
                type__in=['EMAIL_CREATED', 'SMS_CREATED', 'LEAD_CHAT_HOBBES', 'NOTE_CREATED', 'NOTE_UPDATED']
            )
        elif type == 'call':
            calls_filter = Q()
        elif type == 'email':
            emails_filter = Q()
        elif type == 'sms':
            sms_filter = Q()
        elif type == 'chat':
            chats_filter = Q()
        else:
            activities_filter = ~Q(
                type__in=['EMAIL_CREATED', 'SMS_CREATED', 'LEAD_CHAT_HOBBES', 'NOTE_CREATED', 'NOTE_UPDATED']
            )
            sms_filter = Q()
            emails_filter = Q()
            calls_filter = Q()
            chats_filter = Q()
            notes_filter = Q()

        sms = [
            dict(object=item, date=item.updated, type='SMS', is_property_communication=item.is_team_message)
            for item in lead.sms.filter(sms_filter).annotate(
                agent_name=Concat(F('agent__first_name'), Value(' '), F('agent__last_name')),
                lead_name=Concat(F('lead__first_name'), Value(' '), F('lead__last_name'))
            )
        ]
        emails = [
            dict(object=item, date=item.updated, type='EMAIL',
                 is_property_communication=item.sender_email == property.shared_email)
            for item in lead.email_messages.filter(emails_filter)
        ]
        activities = [
            dict(object=item, date=item.created, type='ACTIVITY') for item in
            lead.activities.filter(activities_filter).annotate(
                creator_name=Concat(F('creator__first_name'), Value(' '), F('creator__last_name')),
                owner_name=Concat(F('lead__first_name'), Value(' '), F('lead__last_name'))
            )
        ]
        calls = [
            dict(object=item, date=item.updated, type='CALL', is_property_communication=False)
            for item in lead.calls.filter(calls_filter)
        ]
        notes = [
            dict(object=item, date=item.updated, type='NOTE', is_property_communication=False)
            for item in lead.notes.filter(notes_filter)
        ]
        prospect_ids = list(lead.chat_prospects.values_list('id', flat=True)) + \
                       list(lead.chat_prospects_for_guest.values_list('id', flat=True))
        if len(prospect_ids):
            chats = [
                dict(object=item, date=item.updated, type='CHATS', is_property_communication=item.type != 'PROSPECT')
                for item in ChatConversation.objects.filter(chats_filter, prospect__in=prospect_ids).annotate(
                    agent_name=Concat(F('agent__first_name'), Value(' '), F('agent__last_name')),
                )
            ]
        else:
            chats = []

        communications = sorted(
            sms + emails + chats + activities + calls + notes, key=lambda i: i['date'], reverse=True
        )
        grouped_communications = []
        chat_communications = []
        for communication in communications:
            if communication['type'] == 'CHATS':
                chat_communications.append(communication['object'])

                if communication['object'].type == 'GREETING':
                    if len(chat_communications):
                        is_property_communication = not len(
                            [communication for communication in chat_communications
                             if communication.to_agent and communication.type == 'PROSPECT']
                        )
                        grouped_communications.append(
                            dict(object=chat_communications, date=chat_communications[0].updated, type='CHATS',
                                 is_property_communication=is_property_communication)
                        )
                        chat_communications = []
            else:
                grouped_communications.append(communication)

        if len(chat_communications):
            is_property_communication = not len(
                [communication for communication in chat_communications
                 if communication.to_agent and communication.type == 'PROSPECT']
            )
            grouped_communications.append(
                dict(object=chat_communications, date=chat_communications[0].updated, type='CHATS',
                     is_property_communication=is_property_communication)
            )
        grouped_communications = sorted(grouped_communications, key=lambda i: i['date'], reverse=True)

        if record_limit:
            grouped_communications = grouped_communications[:record_limit]

        data = LeadCommunicationSerializer(grouped_communications, many=True, context=context).data

        filtered_data = []

        if keyword:
            for item in data:
                if item['type'] == 'CHATS':
                    objects = [i for i in item['object'] if is_matching_keyword(keyword, i.values())]
                    if len(objects):
                        item['object'] = objects
                        filtered_data.append(item)
                else:
                    if is_matching_keyword(keyword, item['object'].values()):
                        filtered_data.append(item)
        else:
            filtered_data = data

        # We will disable offset pagination temporarily but if we face some performance issue on specific lead that
        # have significant communication records then we will reconsider to enable it
        # count = 0
        # if data:
        #     paginator = Paginator(data, limit)
        #     current_page = paginator.page(int(offset / limit) + 1)
        #     data = current_page.object_list
        #     count = paginator.count

        result = {'results': filtered_data, 'count': len(filtered_data)}
        return Response(result, status=status.HTTP_200_OK)


class PublicLeadView(LeadBaseView):
    serializer_class = PublicLeadDetailSerializer
    permission_classes = [PublicLeadAccessAuthorized]
    serializer_action_classes = {
        'create': PublicLeadCreateSerializer
    }

    def get_queryset(self):
        return Lead.objects.filter(vendor=self.request.vendor)
