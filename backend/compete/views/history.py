import boto3
import pytz

from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.http import HttpResponseRedirect
from django.conf import settings

from backend.compete.models import History

TZ = pytz.timezone('America/Phoenix')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([SessionAuthentication])
def download_csv(request, **kwargs):
    history = History.objects.filter(id=kwargs.get('history_pk')).first()
    if not history:
        return Response(dict(error='Can not find the data.'), status=status.HTTP_400_BAD_REQUEST)

    s3 = boto3.client(
        's3',
        aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
        aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None),
    )
    s3_name = history.property.s3_name
    bucket_name = 'dwell-scrapping'
    file_name = f'Mark Taylor/{history.scrapping_date.strftime("%m-%d-%Y")}_{s3_name.replace(" ", "-")}.csv'
    url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': file_name}, ExpiresIn=100)

    return HttpResponseRedirect(url)
