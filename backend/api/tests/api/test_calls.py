from json import loads

from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from mock import patch
from rest_framework import status

from backend.api.models import Call, Note
from backend.api.factories import CallFactory, ScoredCallFactory
from backend.api.tests import LeadLevelBaseTestCase


class CallsTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(CallsTests, self).setUp()

    def test_list_call(self):
        """
        Ensure we can list call objects.
        """
        call1 = Call.objects.create(property=self.property, source='Mark-Taylor.com',
                                    prospect_phone_number='4804526578',
                                    duration=109, date=timezone.now())
        call2 = Call.objects.create(property=self.property, source='Google.com', prospect_phone_number='6023158113',
                                    duration=241, date=timezone.now() + timedelta(days=1),
                                    lead=self.lead)
        endpoint = reverse('calls-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Call.objects.count(), 2)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], call1.id)

        response = self.client.get(endpoint, {'lead_id': self.lead.pk}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], call2.id)

    @patch('requests.get')
    def test_call_transcription_note(self, mock_get):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code

            def json(self):
                return self.json_data

        mock_get.return_value = MockResponse({'results': {'items': []}}, 200)
        call = Call.objects.create(property=self.property, source='Mark-Taylor.com', prospect_phone_number='4804526578',
                                   duration=109, date=timezone.now(),
                                   transcription='https://crm-staging-transcription.s3-us-west-1.amazonaws.com/47191486-transcribe.json',
                                   is_transcribed=False, recording='call_recording/san-milan_47191486_1581245084.mp3')
        self.assertEqual(Call.objects.count(), 1)
        self.assertEqual(Note.objects.count(), 0)

        call.is_transcribed = True
        call.lead = self.lead
        call.save()
        call = Call.objects.first()
        self.assertEqual(Call.objects.count(), 1)
        self.assertTrue(call.lead.last_activity_date)

    def test_update_call(self):
        """
        Ensure we can update call objects.
        """
        call = Call.objects.create(property=self.property, source='Mark-Taylor.com', prospect_phone_number='4804526578',
                                   duration=109, date=timezone.now())
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('calls-detail', args=[call.pk])
        response = self.client.put(endpoint, dict(property=self.property.pk, lead=self.lead.pk, is_archived=True))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Call.objects.first().lead, None)

        response = self.client.patch(endpoint, dict(property=self.property.pk, lead=self.lead.pk, is_archived=True),
                                     **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Call.objects.first().lead, self.lead)
        self.assertEqual(Call.objects.first().is_archived, True)

    def test_archive_calls(self):
        """
        Ensure we can archive call objects.
        """
        call1 = Call.objects.create(property=self.property, source='Mark-Taylor.com',
                                    prospect_phone_number='4804526578',
                                    duration=109, date=timezone.now())
        call2 = Call.objects.create(property=self.property, source='Google.com', prospect_phone_number='6023158113',
                                    duration=241, date=timezone.now() + timedelta(days=1),
                                    lead=self.lead)
        endpoint = reverse('calls-archive-calls')
        response = self.client.post(endpoint, dict(ids=[call1.pk, call2.pk]), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Call.objects.filter(is_archived=True).count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, dict(ids=[call1.pk, call2.pk]), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Call.objects.filter(is_archived=True).count(), 2)

    def test_call_rescores_list(self):
        """
        Ensure we can list all call rescores
        """
        self.user.is_call_scorer = True
        self.user.save()

        call = CallFactory(property=self.property, date=timezone.now())
        ScoredCallFactory(property=self.property, call=call, rescore_status='REQUIRED',
                          rescore_reason='Q1 and Q2 is not scored incorrectly.')

        call = CallFactory(property=self.property, date=timezone.now() + timedelta(days=1))
        ScoredCallFactory(property=self.property, call=call, rescore_status='REQUIRED',
                          rescore_reason='Q1 and Q2 is not scored incorrectly.')

        call = CallFactory(property=self.property, date=timezone.now() + timedelta(days=2))
        ScoredCallFactory(property=self.property, call=call)

        endpoint = reverse('calls-list')
        header = {'HTTP_X_NAME': 'call-rescores'}
        response = self.client.get(endpoint, **header)

        content = loads(response.content)
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['count'], 2)

    def test_list_eligible_calls_for_call_scorer(self):
        """
        Ensure call scorer can list two weeks eligible calls to score
        """
        self.user.is_call_scorer = True
        self.user.save()

        CallFactory(property=self.property, date=timezone.now(), call_result='connected', call_category='PROSPECT',
                    duration=200)
        CallFactory(property=self.property, date=timezone.now() + timedelta(days=1), call_result='connected',
                    call_category='PROSPECT', duration=200)
        CallFactory(property=self.property, date=timezone.now() + timedelta(days=1), duration=30,
                    call_category='PROSPECT')
        CallFactory(property=self.property, date=timezone.now() + timedelta(days=1), call_result='no-answer',
                    call_category='PROSPECT')
        CallFactory(property=self.property, date=timezone.now() - timedelta(days=30), call_category='PROSPECT')

        endpoint = reverse('calls-list')
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)

        content = loads(response.content)
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['count'], 2)
