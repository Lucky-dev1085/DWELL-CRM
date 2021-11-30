from unittest.mock import patch
from django.urls import reverse
from django.utils import timezone
from collections import namedtuple

from rest_framework import status

from backend.api.tests import LeadLevelBaseTestCase
from backend.api.models import SMSContent, PhoneNumber
from backend.api.factories import SMSContentFactory, PhoneNumberFactory


class SMSTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(SMSTests, self).setUp()

    def test_list_lead_sms(self):
        SMSContentFactory(lead=self.lead, property=self.property, message='Test')
        endpoint = reverse('lead_sms-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_sms-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('backend.api.serializer.sms.send_twilio_message')
    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_lead_send_sms(self, mock_purchase_twilio_number, mock_send_twilio_message):
        data = dict(lead=123, body='Test', sender_number='12334556')
        twilio_sms = dict({'sid': 'testsid', 'date_created': timezone.now()})
        TwilioObject = namedtuple('TwilioObject', twilio_sms.keys())
        twilio_sms = TwilioObject(**twilio_sms)
        mock_purchase_twilio_number.return_value = None
        PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_SMS)

        mock_send_twilio_message.return_value = twilio_sms
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_sms-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(SMSContent.objects.count(), 0)

        data = dict(lead=self.lead.pk, message='Test', is_team_message=True)
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SMSContent.objects.count(), 1)

        data = dict(lead=self.lead.pk, message='Test second message', is_team_message=True)
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SMSContent.objects.count(), 2)

    def test_sms_read_all(self):
        self.lead.last_message_read = False
        self.lead.save()
        smscontent1 = SMSContentFactory(lead=self.lead, property=self.property, message='Test', is_read=False)
        smscontent2 = SMSContentFactory(lead=self.lead, property=self.property, message='Test', is_read=False)
        endpoint = reverse('lead_sms-read-all', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(smscontent1.is_read, False)
        self.assertEqual(smscontent1.lead.last_message_read, False)

        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_sms-read-all', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        smscontent1 = SMSContent.objects.get(pk=smscontent1.pk)
        smscontent2 = SMSContent.objects.get(pk=smscontent2.pk)
        self.assertEqual(smscontent1.is_read, True)
        self.assertEqual(smscontent2.is_read, True)
