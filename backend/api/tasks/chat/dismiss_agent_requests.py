from backend.api.models import AgentRequest
from backend.celery_app import app


@app.task
def dismiss_agent_request(request_id):
    request = AgentRequest.objects.get(id=request_id)
    if request and request.is_active:
        request.is_active = False
        request.save()
