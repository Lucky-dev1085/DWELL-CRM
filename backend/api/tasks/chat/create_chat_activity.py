from datetime import timedelta

from django.db.models import Q
import logging

from django.utils import timezone

from backend.api.models import ChatConversation, ChatProspect, Activity
from backend.celery_app import app
from django.conf import settings


@app.task
def create_chat_conversation_activities():
    fifteen_mins_ago = timezone.now() - timedelta(minutes=15)
    ten_mins_ago = timezone.now() - timedelta(minutes=10)

    p15_ids = ChatConversation.objects.filter(date__gte=fifteen_mins_ago).exclude(agent=None) \
        .values_list('prospect', flat=True)
    p10_ids = ChatConversation.objects.filter(date__gte=ten_mins_ago).exclude(agent=None) \
        .values_list('prospect', flat=True)
    session_out_p_ids = list(set([i for i in p15_ids if i not in p10_ids]))
    prospects = ChatProspect.objects.filter(id__in=session_out_p_ids).exclude(Q(lead=None) & Q(guest_card=None))

    logging.info('Session out prospects count: {}'.format(len(session_out_p_ids)))
    if len(session_out_p_ids) > settings.MAX_AGENT_JOINED_PROSPECTS_COUNT:
        logging.error(
            'The active agent joined prospects count is overflow the limit, '
            'There are {} prospects at {} ~ {}'.format(len(session_out_p_ids), fifteen_mins_ago, ten_mins_ago))
    count = 0

    five_mins_ago = timezone.now() - timedelta(minutes=5)
    for prospect in prospects:
        lead = prospect.lead or prospect.guest_card
        activity_exists = Activity.objects.filter(lead=lead, property=lead.property, type=Activity.LEAD_CHAT_HOBBES,
                                                  created__gte=five_mins_ago).exists()
        if not activity_exists:
            create_prospect_chat_activity(prospect)
            count += 1

    logging.info('Session out valuable prospects count: {}'.format(count))
    if count > settings.MAX_AGENT_JOINED_PROSPECTS_COUNT:
        logging.error(
            'The active agent joined prospects count is overflow the limit, '
            'There are {} prospects at {} ~ {}'.format(count, fifteen_mins_ago, ten_mins_ago))


def create_prospect_chat_activity(prospect):
    session_start = ChatConversation.objects.filter(prospect=prospect, type=ChatConversation.TYPE_JOINED).latest('date')
    messages_filter = Q(prospect=prospect) & Q(date__gte=session_start.date) & \
                      (Q(type=ChatConversation.TYPE_AGENT) | Q(type=ChatConversation.TYPE_PROSPECT) & Q(to_agent=True))
    messages_count = ChatConversation.objects.filter(messages_filter).count()
    lead = prospect.lead or prospect.guest_card
    Activity.objects.create(lead=lead, property=lead.property, type=Activity.LEAD_CHAT_HOBBES,
                            content='{} chat messages exchanged'.format(messages_count), creator=session_start.agent)
