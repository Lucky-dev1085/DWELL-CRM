from mock import patch

from backend.api.models import User, ChatConversation, Notification
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import UserFactory, ChatConversationFactory, ChatProspectFactory


class ChatSignalsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ChatSignalsTests, self).setUp()
        for i in range(7):
            if i > 4:
                user = UserFactory(is_team_account=False, is_available=True, customer=self.customer)
            else:
                user = UserFactory(is_available=True, customer=self.customer)
            user.properties.add(self.property)
        self.prospect = ChatProspectFactory(property=self.property)

    # todo disable
    # def test_create_agent_request_for_available_team_accounts(self):
    #     """
    #     Ensure agent request conversation will create AgentRequest record for available team accounts
    #     """
    #     ChatConversationFactory(
    #         property=self.property, prospect=self.prospect, type=ChatConversation.TYPE_AGENT_REQUEST
    #     )
    #     self.assertEqual(self.prospect.agent_requests.count(), 5)
    #     not_team_account = self.property.users.filter(is_team_account=False).first()
    #     self.assertFalse(self.prospect.agent_requests.filter(user=not_team_account).exists())

    def test_create_notification_for_not_available_team_accounts(self):
        """
        Ensure agent request conversation will create Notification for not available team accounts
        """
        user_ids = self.property.users.filter(is_team_account=True, is_available=True).values_list('id', flat=True)[:2]
        User.objects.filter(id__in=user_ids).update(is_available=False)

        ChatConversationFactory(
            property=self.property, prospect=self.prospect, type=ChatConversation.TYPE_AGENT_REQUEST
        )
        self.assertEqual(
            self.property.notifications.filter(type=Notification.TYPE_NEW_AGENT_REQUEST).count(),
            self.property.users.filter(is_team_account=True, is_available=False).count()
        )

    def test_non_team_accounts_should_not_create_agent_request_and_notification(self):
        """
        Ensure the non team accounts should not create agent request and notification
        """
        self.property.users.all().update(is_team_account=False)
        ChatConversationFactory(
            property=self.property, prospect=self.prospect, type=ChatConversation.TYPE_AGENT_REQUEST
        )
        self.assertEqual(self.property.notifications.filter(type=Notification.TYPE_NEW_AGENT_REQUEST).count(), 0)
        self.assertEqual(self.prospect.agent_requests.count(), 0)

    def test_send_agents_number_update(self):
        """
        Ensure we send updated available agents number when user's availability is changed
        """
        user = self.property.users.filter(is_team_account=True, is_available=False).first()
        with patch('backend.api.signals.chat_signals.send_agents_available_number.delay') as mock_method:
            user.is_available = True
            user.save()
            self.assertTrue(mock_method.called)
