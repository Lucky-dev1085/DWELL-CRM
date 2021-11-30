import pytz
import logging
from django.utils import timezone
from datetime import timedelta

from backend.api.models import User, ChatConversation
from backend.celery_app import app
from backend.api.tasks.push_object_task import push_available_agents_number


@app.task
def send_agents_available_number(pk):
    user = User.objects.get(pk=pk)
    for property in user.properties.all():
        available_agents_count = User.objects.filter(
            last_property=property, is_available=True, is_team_account=True
        ).count()
        prospect_external_ids = set(ChatConversation.objects.filter(
            date__gte=timezone.now().astimezone(tz=pytz.UTC) - timedelta(hours=3), property=property,
            prospect__is_active=True
        ).values_list('prospect__external_id', flat=True))
        push_available_agents_number.delay(
            available_agents_count, list(prospect_external_ids)
        )
        logging.info(f'[Chat]: The agents available number is sent to {len(prospect_external_ids)} prospects.')
