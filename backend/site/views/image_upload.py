import boto3
from datetime import datetime
from django.conf import settings
from django.http import HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from backend.api.utils import get_image_url
from backend.api.permissions import DwellAuthorized


class S3(object):
    def __init__(self):
        self.client = boto3.client(
            's3',
            region_name='us-west-1',
            aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
        )

    def upload_file(self, file, property):
        file_name = f'{property.external_id}/{str(datetime.now().timestamp())}{file.name}'
        self.client.upload_fileobj(file, getattr(settings, 'AWS_SITE_STORAGE_BUCKET_NAME', None), file_name,
                                   ExtraArgs=dict(ACL='public-read'))
        return '%s/%s' % (getattr(settings, 'IMGIX_DOMAIN', None), file_name)


@csrf_exempt
@api_view(['POST'])
@permission_classes([DwellAuthorized])
def image_upload(request):
    file = request.FILES.get('file')
    if not file:
        return HttpResponseBadRequest()

    if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto.S3BotoStorage':
        s3 = S3()
        try:
            path = s3.upload_file(file, request.property)
        except Exception as e:
            return HttpResponseBadRequest(e)

    else:
        file_name = default_storage.save(file.name, file)
        path = get_image_url(default_storage.url(file_name))

    return Response({'url': path}, status=200)
