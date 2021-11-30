from backend.api.models import Property
from backend.celery_app import app
from .utils import get_nylas_client


@app.task
def sync_check_account_activity():
    """
    This task check the nylas account activity to detect account re-authorization signals.
    :return:
    """
    client = get_nylas_client()
    accounts = client.accounts.all()
    for account in accounts:
        if account.get('invalid-credentials') == 'invalid-credentials':
            try:
                property = Property.objects.get(shared_email=account.get('email'))
                property.nylas_status = Property.NYLAS_STATUS_AUTH_REQUIRED
                property.save()
            except Property.DoesNotExist:
                pass
