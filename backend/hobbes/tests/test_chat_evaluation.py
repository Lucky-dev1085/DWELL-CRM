from json import loads

from django.urls import reverse
from rest_framework import status

from backend.hobbes.tests.utils.test_base import ChatEvaluationReviewingBaseTestBase


class ChatEvaluationReportTests(ChatEvaluationReviewingBaseTestBase):
    def test_chat_evaluation_report_listing(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        response = self.client.get(reverse('report_evaluation-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(reverse('report_evaluation-list'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = loads(response.content)['results'][0]
        self.assertEqual(data['conversations']['total'], 10)

        chat_report.delete()

    def test_chat_evaluation_report_retrieve(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        response = self.client.get(reverse('report_evaluation-detail', args=[chat_report.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(reverse('report_evaluation-detail', args=[chat_report.id]), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = loads(response.content)
        self.assertEqual(data['conversations']['total'], 10)
        self.assertEqual(data['id'], chat_report.id)

        chat_report.delete()

    def test_chat_evaluation_report_update(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        response = self.client.patch(reverse('report_evaluation-detail', args=[chat_report.id]), {'status': 'PROGRESS'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.patch(reverse(
            'report_evaluation-detail',
            args=[chat_report.id]),
            {'status': 'PROGRESS'}, **header
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = loads(response.content)
        self.assertEqual(data['conversations']['total'], 10)
        self.assertEqual(data['status'], 'PROGRESS')

        chat_report.delete()

    def test_chat_evaluation_report_conversation_list(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(reverse('chat_report_conversation-list', args=[chat_report.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(reverse(
            'chat_report_conversation-list',
            args=[chat_report.id]), **header
        )
        data = loads(response.content)['results'][0]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['report'], chat_report.id)

    def test_chat_evaluation_report_conversation_update(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        header = {'HTTP_X_NAME': 'test1'}
        conversation = chat_report.chats.all()[0]
        response = self.client.patch(reverse('chat_report_conversation-detail', args=[chat_report.id, conversation.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            reverse('chat_report_conversation-detail', args=[chat_report.id, conversation.id]),
            {'reviewed': False}, **header
        )
        data = response.data
        self.assertEqual(data['reviewed'], False)

    def test_chat_evaluation_report_message_list(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        conversation = chat_report.chats.all()[0]
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(reverse('chat_report_message-list', args=[conversation.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(reverse(
            'chat_report_message-list',
            args=[conversation.id]), **header
        )
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(data), 100)

    def test_chat_evaluation_report_message_update(self):
        self.client.force_authenticate(user=self.chat_reviewer)
        chat_report = self.create_chat_evaluation_report(messages_count=100, question_count=13, days_count=10)
        header = {'HTTP_X_NAME': 'test1'}
        conversation = chat_report.chats.all()[0]
        report_message = conversation.report_messages.all()[0]
        response = self.client.patch(reverse('chat_report_message-detail', args=[conversation.id, report_message.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            reverse('chat_report_message-detail', args=[conversation.id, report_message.id]),
            {'status': 'CORRECT'}, **header
        )
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['status'], 'CORRECT')
