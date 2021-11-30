import phonenumbers

from django.http import HttpResponse

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action

from backend.api.views import LeadLevelViewSet
from backend.api.tasks.push_object_task import push_object_saved
from backend.api.models import SMSContent, Lead, PhoneNumber, Notification
from backend.api.serializer import SMSContentSerializer, LeadSMSListSerializer
from backend.api.permissions import LeadLevelAccessAuthorized
from backend.api.twilio_utils import retrieve_sms_details
from backend.api.views.mixin import PusherMixin


class SMSContentView(PusherMixin, LeadLevelViewSet):
    serializer_class = SMSContentSerializer
    queryset = SMSContent.objects.all()
    permission_classes = [LeadLevelAccessAuthorized]

    def get_queryset(self):
        """
        Get all the SMS of lead and property
        """
        return self.queryset.filter(lead=self.request.lead, property=self.request.property).order_by('-date')

    @action(methods=['POST'], detail=False)
    def read_all(self, request, **kwargs):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        serializer = LeadSMSListSerializer(request.lead)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
def sms_track(request):
    """
    Webhook end point when SMS is received to twilio tracking number
    """
    try:
        phone_number = PhoneNumber.objects.filter(phone_number=request.POST.get('To'), type='SMS').first()
        from_number = phonenumbers.format_number(phonenumbers.parse(str(request.POST.get('From')), 'US'),
                                                 phonenumbers.PhoneNumberFormat.NATIONAL)
        lead = Lead.objects.filter(phone_number=from_number, property=phone_number.property).order_by(
            '-created').first()
        if lead:
            sms_detail = retrieve_sms_details(request.POST.get('SmsSid'))
            sms_content = SMSContent.objects.create(twilio_sid=request.POST.get('SmsSid'),
                                                    receiver_number=request.POST.get('To'),
                                                    sender_number=request.POST.get('From'),
                                                    message=request.POST.get('Body'),
                                                    status=request.POST.get('SmsStatus'),
                                                    lead=lead, property=phone_number.property,
                                                    date=sms_detail.date_created, is_read=False)
            for user in phone_number.property.team_members:
                notification = Notification.objects.create(property=phone_number.property,
                                                           type=Notification.TYPE_NEW_SMS,
                                                           content='SMS from {}: {}'.format(lead.name,
                                                                                            request.POST.get('Body')),
                                                           user=user,
                                                           object=sms_content)
                push_object_saved.delay(notification.id, notification.__class__.__name__, True, is_user_channel=True)
            push_object_saved.delay(sms_content.id, sms_content.__class__.__name__, True, is_user_channel=False)
        return HttpResponse('')
    except PhoneNumber.DoesNotExist:
        return HttpResponse('Phone number not found', status=status.HTTP_404_NOT_FOUND)
    except Lead.DoesNotExist:
        return HttpResponse('Lead with sender number not found', status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([])
def sms_status_callback(request):
    """
    Webhook to change SMS status
    """
    try:
        sms = SMSContent.objects.get(twilio_sid=request.POST.get('SmsSid'))
        sms.status = request.POST.get('SmsStatus')
        sms.save()
        if sms.status in [SMSContent.STATUS_FAILED, SMSContent.STATUS_UNDELIVERED]:
            push_object_saved.delay(sms.id, sms.__class__.__name__, False, is_user_channel=False)
        return HttpResponse('')
    except SMSContent.DoesNotExist:
        return HttpResponse('SMS not found', status=status.HTTP_404_NOT_FOUND)
