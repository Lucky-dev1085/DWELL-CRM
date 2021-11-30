from backend.api.models import ChatProspect
from backend.celery_app import app


@app.task
def set_prospect_as_not_waiting(prospect_id):
    prospect = ChatProspect.objects.filter(id=prospect_id).first()
    if prospect and prospect.is_waiting_agent:
        prospect.is_waiting_agent = False
        prospect.save()
