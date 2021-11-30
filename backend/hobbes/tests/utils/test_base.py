from backend.api.tests import PropertyLevelBaseTestCase
from django.urls import include, path
from datetime import timedelta
from django.utils import timezone

from backend.api.models import User, ChatConversation
from backend.hobbes.models import ChatReport
from backend.hobbes.factories import ChatReportFactory, ChatReportConversationFactory, ChatReportMessageFactory
from backend.api.factories import UserFactory, ChatConversationFactory, ChatProspectFactory
from backend.api.tests.utils.random import bool_chance, list_chances_with_max


class ChatEvaluationReviewingBaseTestBase(PropertyLevelBaseTestCase):
    urlpatterns = PropertyLevelBaseTestCase.urlpatterns + [
        path('api/v1/hobbes/', include('backend.hobbes.urls')),
    ]

    def setUp(self):
        super().setUp()

        self.chat_reviewer = UserFactory(
            email='chatreviewer@gmail.com', role=User.P_ADMIN, customer=self.customer, is_chat_reviewer=True
        )
        self.chat_reviewer.properties.add(self.property)
        self.chat_reviewer.clients.add(self.m_client)

    def create_chat_evaluation_report(
            self,
            messages_count=10,
            question_count=3,
            days_count=7,
            end_date=timezone.now(),
            status=ChatReport.STATUS_COMPLETED,
    ) -> ChatReport:
        chance_of_messages = list_chances_with_max(messages_count)

        end_date -= timedelta(days=1)
        date = end_date - timedelta(days=days_count)
        chat_report = ChatReportFactory(status=status, session_date=date, property=self.property)

        while date < end_date:
            date += timedelta(days=1)
            prospect = ChatProspectFactory(property=self.property)
            report_conversation = ChatReportConversationFactory(
                report=chat_report,
                conversation=prospect,
                reviewed=status == ChatReport.STATUS_COMPLETED,
            )

            is_question = chance_of_messages(question_count)

            for i in range(messages_count):
                message = ChatConversationFactory(
                    property=self.property,
                    prospect=prospect,
                    type=(
                        ChatConversation.TYPE_PROSPECT,
                        ChatConversation.TYPE_BOT
                    )[(i % 2 or bool_chance()) and not is_question[i]],
                    action=ChatConversation.ACTION_QUESTION if is_question[i] else None,
                )
                # save date, because model field has auto_now_add
                ChatConversation.objects.filter(pk=message.id).update(date=date + timedelta(minutes=i, seconds=i))

                ChatReportMessageFactory(message=message, conversation=report_conversation)

        return chat_report
