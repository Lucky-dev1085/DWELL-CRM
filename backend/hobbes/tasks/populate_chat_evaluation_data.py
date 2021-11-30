import pytz
from datetime import datetime, timedelta

from django.db.models import Q

from backend.celery_app import app
from backend.api.models import Property, ChatConversation, ChatProspect
from backend.hobbes.models import ChatReport, ChatReportConversation, ChatReportMessage

TZ = pytz.timezone('America/Phoenix')


@app.task
def populate_chat_evaluation_data(start_date=None, end_date=None, property_name=None, days=7):
    if start_date is None:  # cronjob scenario
        start_date = datetime.now(TZ).replace(day=1).date()
        end_date = start_date + timedelta(days=days)
    print(end_date)
    properties = Property.objects.all()
    if property_name:
        properties = properties.filter(name=property_name)

    for property in properties:
        chat_report, created = ChatReport.objects.get_or_create(session_date=start_date, property=property)

        # collect chats with messages from 1 to 7 day of month
        chat_prospect_ids = ChatConversation.objects.filter(property=property,
                                                            date__range=[start_date, end_date]).values_list(
            'prospect', flat=True)
        for chat_prospect in ChatProspect.objects.filter(id__in=chat_prospect_ids):
            conversations = chat_prospect.conversations.filter(
                property=property,
                date__range=[start_date, end_date]
            ).exclude(
                Q(message=None) | Q(to_agent=True) |
                ~Q(type__in=[ChatConversation.TYPE_BOT, ChatConversation.TYPE_PROSPECT])
            )
            if conversations.filter(type=ChatConversation.TYPE_BOT).exists():
                report_conversation, created = ChatReportConversation.objects.get_or_create(
                    report_id=chat_report.id,
                    conversation_id=chat_prospect.id
                )

                for conversation in conversations:
                    ChatReportMessage.objects.get_or_create(message_id=conversation.id,
                                                            conversation_id=report_conversation.id)
