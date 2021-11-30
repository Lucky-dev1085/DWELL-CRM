import json

from django.http import HttpResponse

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404

from backend.api import views
from backend.api.models import PhoneNumber
from backend.api.serializer import PhoneNumberSerializer
from backend.api.twilio_utils import get_twilio_available_numbers, send_twilio_message


class PhoneNumberViewSet(views.BaseViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated, IsAdminUser)
    queryset = PhoneNumber.objects.all()
    serializer_class = PhoneNumberSerializer

    @action(methods=['GET'], detail=False)
    def twilio_phone_number(self, request, **kwargs):
        """
        Fetch available numbers from twilio on basis of area code selected from admin panel
        """
        area_code = request.GET.get('area_code')
        twilio_available_numbers = []
        if area_code:
            local = get_twilio_available_numbers(area_code)
            if local is None:
                return HttpResponse('Failed to fetch available numbers from Twilio', content_type='application/json',
                                    status=status.HTTP_403_FORBIDDEN)
            twilio_available_numbers = [record.phone_number for record in local]
            used_numbers = PhoneNumber.objects.all().values_list('phone_number', flat=True)
            twilio_available_numbers = list(set(twilio_available_numbers) - set(used_numbers))
        return HttpResponse(json.dumps(twilio_available_numbers), content_type='application/json',
                            status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True, permission_classes=[IsAuthenticated, IsAdminUser],
            authentication_classes=[SessionAuthentication])
    def send_sms_message(self, *args, **kwargs):
        phone = get_object_or_404(PhoneNumber.objects.all(), pk=kwargs.get('pk'))
        sender = phone.phone_number
        body = self.request.POST.get('message')
        to = self.request.POST.get('to')
        send_twilio_message(body, sender, to)
        return Response(dict(success=True), status=200)
