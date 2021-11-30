import logging
import boto3
import requests
from io import BytesIO

from django.conf import settings
from django.utils import timezone

from backend.api.models import Call
from backend.celery_app import app


@app.task
def transcribe_recording(call_pk, recording_url=None):
    call = Call.objects.get(pk=call_pk)
    if not call.recording:
        url = recording_url if recording_url else call.recording_url
        recording_file = requests.get(url)
        recording = BytesIO()
        recording.write(recording_file.content)
        file_name = '{}_{}_{}.mp3'.format(call.property.external_id, call.call_id,
                                          int(timezone.now().timestamp()))
        call.recording.save(file_name, recording, save=True)

    if call.call_category == Call.CALL_CATEGORY_NON_PROSPECT:
        # we don't create the transcription for non prospect calls.
        return

    client = boto3.client(
        'transcribe',
        region_name='us-west-1',
        aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
        aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
    )
    if not call.is_transcribed:
        # Create transcribe job
        try:
            job_name = '{}-transcribe'.format(call.call_id)
            client.start_transcription_job(
                TranscriptionJobName=job_name,
                LanguageCode='en-US',
                Media={
                    'MediaFileUri': call.recording.url
                },
                OutputBucketName=getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME'),
                Settings={
                    'ShowSpeakerLabels': True,
                    'MaxSpeakerLabels': 2,
                }
            )
            call.transcription = 'https://{bucket_name}.s3-us-west-1.amazonaws.com/{job_name}.json'.format(
                bucket_name=getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME'), job_name=job_name)
            call.save()
        except Exception as e:
            logging.error(e)
            pass
