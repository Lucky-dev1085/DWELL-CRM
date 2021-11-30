import logging
import boto3
from django.conf import settings

from backend.api.models import Call
from backend.celery_app import app


@app.task
def update_transcribe_status():
    """
    Update transcribe status
    :return:
    """
    client = boto3.client(
        'transcribe',
        region_name='us-west-1',
        aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
        aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
    )

    for call in Call.objects.filter(is_transcribed=False).exclude(transcription=None):
        job_name = '{}-transcribe'.format(call.call_id)
        try:
            job = client.get_transcription_job(TranscriptionJobName=job_name)
            if job.get('TranscriptionJob', {}).get('TranscriptionJobStatus') == 'COMPLETED':
                call.is_transcribed = True
                call.save()
                client.delete_transcription_job(TranscriptionJobName=job_name)
            if job.get('TranscriptionJob', {}).get('TranscriptionJobStatus') == 'FAILED':
                call.transcription = None
                call.save()
                client.delete_transcription_job(TranscriptionJobName=job_name)
        except Exception as e:
            logging.error(e)
            pass
