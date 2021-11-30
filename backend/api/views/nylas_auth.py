from nylas import APIClient
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from backend.api.models import Property
from backend.api.permissions import DwellAuthorized
from backend.api.tasks import pull_email_labels
from backend.api.tasks.nylas.pull_nylas_calendars import pull_calendars


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, DwellAuthorized])
def authorize(request):
    client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET)
    if request.method == 'POST':
        property = Property.objects.get(pk=request.property.pk)
        if property.shared_email and property.nylas_status != Property.NYLAS_STATUS_AUTH_REQUIRED:
            return Response(dict(error='Property shared email already exists.'), status=400)
        property.nylas_access_token = client.token_for_code(request.data.get('code'))
        property.nylas_status = Property.NYLAS_STATUS_READY_TO_CONNECT
        property.nylas_account_id = client.account.account_id
        property.shared_email = client.account.email_address

        property.save()
        pull_email_labels(property.pk)
        pull_calendars(property.pk)
        # this code snippet block the access calendar API of Nylas, we are in contact with Nylas support
        # client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
        #                    property.nylas_access_token)
        # client.revoke_all_tokens(keep_access_token=property.nylas_access_token)

        return Response(dict(success=True), status=status.HTTP_200_OK)
    else:
        redirect_url = '{}{}'.format(settings.CRM_HOST, '/nylas_integrate')
        auth_url = client.authentication_url(redirect_url, scopes='email,calendar')
        return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)
