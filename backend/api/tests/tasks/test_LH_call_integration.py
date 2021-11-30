# import pytz
import boto3
# from datetime import datetime
from botocore.stub import Stubber
from unittest.mock import patch
from django.utils import timezone
from django.test import override_settings

from backend.api.tasks import update_transcribe_status
from backend.api.tests import PropertyLevelBaseTestCase
# from backend.api.tests.test_base import MockResponse
from backend.api.models import Call


LH_call_API_response = [
  {
    'AdSource Name': 'Mark-Taylor.com',
    'Adsource Cost': 600.0,
    'CallDurationInSecs': 198,
    'CallId': 8644481,
    'City': 'Gilbert',
    'Disposition': 'Connected',
    'HasLS': 1,
    'IsAce': False,
    'LeadScoreCategory': 'Prospect',
    'LeadScoreSubCategory': 'Resident Other',
    'MissedCall': 0,
    'Site Name': 'Borrego at Spectrum',
    'Site Status': True,
    'SourceNumber': '4695699549',
    'StartTime': '2016-08-13T20:57:31',
    'State Name': 'Arizona',
    'TargetNumber': '8558687213',
    'TrackingNumber': '8886269770'
  },
  {
    'AdSource Name': 'Mark-Taylor.com',
    'Adsource Cost': 600.0,
    'CallDurationInSecs': 62,
    'CallId': 8645905,
    'City': 'Gilbert',
    'Disposition': 'Connected',
    'HasLS': 1,
    'IsAce': False,
    'LeadScoreCategory': 'Undetermined',
    'LeadScoreSubCategory': 'Hangups - IVR',
    'MissedCall': 1,
    'Site Name': 'Borrego at Spectrum',
    'Site Status': True,
    'SourceNumber': '4804151468',
    'StartTime': '2016-08-14T10:53:22',
    'State Name': 'Arizona',
    'TargetNumber': '8558687213',
    'TrackingNumber': '8886269770'
  }
]


class LHCallIntegrationTasksTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LHCallIntegrationTasksTests, self).setUp()
        self.property.name_on_lease_hawk = 'lease hawk name'
        self.property.save()

    @override_settings(AWS_TRANSCRIPTION_BUCKET_NAME='crm-staging-transcription')
    def test_update_transcribe_status(self):
        client = boto3.client('transcribe', 'us-west-1')
        stubber = Stubber(client)
        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_transcription_job', {'TranscriptionJob': {'TranscriptionJobStatus': 'COMPLETED'}},
                                 {'TranscriptionJobName': '8644481-transcribe'})

            stubber.add_response('delete_transcription_job', {}, {'TranscriptionJobName': '8644481-transcribe'})

            call = Call.objects.create(property=self.property, call_id='8644481', transcription='transcription',
                                       date=timezone.now())
            update_transcribe_status()
            self.assertTrue(Call.objects.get(pk=call.pk).is_transcribed)
