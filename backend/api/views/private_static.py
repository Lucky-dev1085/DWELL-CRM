import boto3

from django.conf import settings
from django.http import FileResponse
from urllib.request import urlopen

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@api_view(['GET'])
@permission_classes([AllowAny])
def load_private_static(request, path):
    token = request.GET.get('token')

    if not token:
        return Response(status=401)

    try:
        AccessToken(token)
    except TokenError:
        return Response(status=401)
    bucket_name = path.split('/')[0]
    path = '/'.join(path.split('/')[1:])
    s3 = boto3.client(
        's3',
        aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
        aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
    )
    url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': path}, ExpiresIn=100)
    file = urlopen(url)
    return FileResponse(file, filename=path)
