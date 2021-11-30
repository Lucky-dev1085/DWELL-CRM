from django.utils import timezone
from datetime import timedelta

from backend.api.models import ChatProspect
from backend.celery_app import app
from backend.api.tasks import push_object_saved


@app.task
def update_prospect_availability(pk):
    prospect = ChatProspect.objects.filter(pk=pk).first()
    if prospect:
        unloaded = prospect.unloaded_time and prospect.unloaded_time < timezone.now() - timedelta(seconds=10)
        if prospect.is_active and unloaded:
            prospect.is_active = False
            prospect.unloaded_time = None
            prospect.save()
            push_object_saved(prospect.id, prospect.__class__.__name__, False)
