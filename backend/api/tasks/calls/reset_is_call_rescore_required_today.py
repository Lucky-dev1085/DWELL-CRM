from backend.api.models import Property
from backend.celery_app import app
from django.db import transaction


@app.task
@transaction.atomic
def reset_is_call_rescore_required_today():
    scored_properties = Property.objects.select_for_update().filter(is_call_rescore_required_today=True)
    for property in scored_properties:
        property.is_call_rescore_required_today = False
        property.save()
