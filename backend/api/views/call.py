import logging
import phonenumbers

from django.conf import settings
from django.db import connection
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from twilio.twiml.voice_response import VoiceResponse

from backend.api.models import Call, PhoneNumber, Lead, CurrentResident
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import CallSerializer
from backend.api.views import LeadLevelViewSet
from backend.api.views.mixin import PusherMixin
from backend.api.views.pagination import CustomResultsSetPagination
from backend.api.twilio_utils import retrieve_studio_execution_context, should_be_blocked_by_nomorobo,\
    should_be_blocked_by_marchex


class CallView(PusherMixin, LeadLevelViewSet):
    serializer_class = CallSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        current_property = self.request.property
        queryset = Call.objects.filter(is_removed=False).order_by('-date')
        lead_pk = self.request.query_params.get('lead_id')
        if current_property == 'call-rescores':
            return Call.objects.filter(scored_calls__rescore_status__in=['REQUIRED', 'RESCORED'])
        elif lead_pk:
            if Lead.objects.filter(pk=lead_pk).first().shared_leads.filter(property=current_property).exists():
                return queryset.filter(lead=lead_pk)
            return queryset.filter(property=current_property, lead=lead_pk)
        elif self.request.user.is_call_scorer:
            return current_property.last_2_weeks_eligible_calls
        else:
            return queryset.filter(
                property=current_property, is_archived=False,
                lead__isnull=True, call_category=Call.CALL_CATEGORY_PROSPECT
            )

    @action(methods=['POST'], detail=False, permission_classes=[DwellAuthorized])
    def archive_calls(self, request, **kwargs):
        for call in Call.objects.filter(pk__in=request.data.get('ids', [])):
            call.is_archived = True
            call.save()
        return Response(dict(success=True), status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, permission_classes=[])
    def call_forward(self, request, **kwargs):
        phone_number = PhoneNumber.objects.get(phone_number=request.POST.get('Called'))
        voice_response = VoiceResponse()
        date = timezone.now()
        call = Call.objects.filter(call_id=request.POST.get('CallSid')).first()

        prospect_phone_number = request.POST.get('From')
        formatted_number = phonenumbers.format_number(phonenumbers.parse(str(prospect_phone_number), 'US'),
                                                      phonenumbers.PhoneNumberFormat.NATIONAL)
        is_known_number = Lead.objects.filter(phone_number=formatted_number).exists()
        is_resident = False
        try:
            is_resident = CurrentResident.objects.filter(property=phone_number.property).filter(
                Q(mobile_phone=formatted_number) |
                Q(home_phone=formatted_number) |
                Q(mobile_phone=formatted_number)
            ).exists()

        except phonenumbers.phonenumberutil.NumberParseException:
            pass

        block_call = False

        blocker_addons = {
            'nomorobo_spamscore': should_be_blocked_by_nomorobo,
            'marchex_cleancall': should_be_blocked_by_marchex
        }

        add_ons = retrieve_studio_execution_context(request.GET.get('flow_sid'))['trigger']['call']['AddOns']
        if add_ons:
            logging.info(f'Call tracking logs: Add ons - {add_ons}')
            if add_ons['status'] == 'successful':
                for blocker_name, blocker_func in blocker_addons.items():
                    should_be_blocked = blocker_func(add_ons['results'].get(blocker_name, {}))
                    # print(f'{blocker_name} should be blocked ? {should_be_blocked}')
                    block_call = block_call or should_be_blocked

        if block_call:
            logging.info(f'Call tracking logs: Found the spam call at {phone_number.property.name} -'
                         f" {prospect_phone_number} / {request.POST.get('CallSid')}")
            if not is_known_number and not is_resident and phone_number.property.block_spam_calls_enabled:
                # Block the spam call for unknown numbers only
                logging.info(f'Call tracking logs: Block the spam call at {phone_number.property.name} -'
                             f" {prospect_phone_number} / {request.POST.get('CallSid')}")
                voice_response.reject()
                return HttpResponse(voice_response)

        # call_category
        data = {
            'call_id': request.POST.get('CallSid'),
            'property': phone_number.property.pk,
            'source': phone_number.source.name,
            'prospect_phone_number': prospect_phone_number,
            'date': date,
            'tracking_number': request.POST.get('Called'),
            'target_number': phone_number.property.phone_number,
            'call_result': request.POST.get('CallStatus'),
            'call_start_time': date,
            'call_category': Call.CALL_CATEGORY_NON_PROSPECT if is_resident else Call.CALL_CATEGORY_PROSPECT
        }
        serializer = CallSerializer(call, data=data)
        if serializer.is_valid():
            call = serializer.save()

            lead = Lead.objects.filter(
                property=phone_number.property, phone_number=call.prospect_phone_number
            ).order_by('-acquisition_date').first()
            if lead:
                call.lead = lead
                call.call_category = Call.CALL_CATEGORY_NON_PROSPECT
                call.save()

            property_phone_number = phonenumbers.parse(phone_number.property.phone_number, 'US')
            property_phone_number = '+{}{}'.format(property_phone_number.country_code,
                                                   property_phone_number.national_number)
            voice_response.dial(property_phone_number,
                                action=settings.TWILIO_OUTBOUND_CALLBACK, method='POST', record=True,
                                recordingStatusCallback=settings.TWILIO_RECORDING_CALLBACK,
                                recordingStatusCallbackMethod='POST', recordingStatusCallbackEvent='completed')
            return HttpResponse(voice_response)
        return HttpResponse('')

    @action(methods=['POST'], detail=False, permission_classes=[], authentication_classes=[])
    def outbound_complete_callback(self, request, **kwargs):
        """
        Webhook to be get the call back status details
        """
        call = Call.objects.get(call_id=request.POST.get('CallSid'))
        call.call_result = request.POST.get('DialCallStatus')
        call.duration = request.POST.get('DialCallDuration', 0)
        call.save()
        return HttpResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')

    @action(methods=['POST'], detail=False, permission_classes=[], authentication_classes=[])
    def recording_callback(self, request, **kwargs):
        from backend.api.tasks import transcribe_recording
        """
        Webhook called after recording is complete
        """
        call = Call.objects.get(call_id=request.POST.get('CallSid'))
        recording_url = request.POST.get('RecordingUrl')
        call.recording_url = recording_url
        call.save()
        if recording_url:
            transcribe_recording_delayed = lambda: transcribe_recording.apply_async((call.pk,), countdown=60)
            connection.on_commit(transcribe_recording_delayed)
        return HttpResponse('')
