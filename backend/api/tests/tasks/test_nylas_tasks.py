import datetime

from django.utils import timezone

from collections import namedtuple
from unittest.mock import patch, PropertyMock, MagicMock
from backend.api.tasks import create_email_message_from_nylas, pull_email_labels, archive_messages_task, \
    sync_nylas_messages_task, reset_sent_email_counters, send_guest_card_email, send_guest_card_emails_without_nylas
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.models import EmailMessage, EmailLabel, Property, Activity, Lead
from backend.api.factories import PropertyFactory, EmailMessageFactory, LeadFactory


class NylasTasksTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(NylasTasksTests, self).setUp()

    @patch('nylas.client.restful_model_collection.RestfulModelCollection.get')
    @patch('nylas.client.restful_models.Message.mark_as_read')
    def test_create_email_message_from_nylas_task(self, mock_get, mock_mark_as_read):

        # message does not exist, not read, not lead page
        message = dict(property=self.property.pk, id='test', body='test', subject='test',
                       date=datetime.datetime.timestamp(timezone.now()),
                       to=[dict(name='test1', email='test1@gmail.com')],
                       from_=[dict(name='test2', email='test2@gmail.com')], unread=True, snippet='test', cc=[],
                       files=[])
        create_email_message_from_nylas(message, self.property.id)
        self.assertEqual(EmailMessage.objects.count(), 1)
        self.assertEqual(EmailMessage.objects.first().subject, 'test')
        self.assertEqual(EmailMessage.objects.first().receiver_email, 'test1@gmail.com')
        self.assertEqual(EmailMessage.objects.first().sender_email, 'test2@gmail.com')
        self.assertEqual(EmailMessage.objects.first().is_unread, True)

        # message exists, read, lead page
        lead = LeadFactory(property=self.property, email='test2@gmail.com', emails=[], tasks=[], notes=[])
        message = dict(property=self.property.pk, id='test', body='test', subject='test',
                       date=datetime.datetime.timestamp(timezone.now()),
                       to=[dict(name='test1', email='test1@gmail.com')],
                       from_=[dict(name='test2', email='test2@gmail.com')], unread=False, snippet='test', cc=[])
        mock_get.return_value = message
        create_email_message_from_nylas(message, self.property.id, lead_id=lead.pk)
        self.assertEqual(EmailMessage.objects.count(), 1)
        self.assertEqual(EmailMessage.objects.first().is_unread, False)
        self.assertEqual(EmailMessage.objects.first().lead, lead)

        # check the case if we have leads with the same emails in different properties
        property = PropertyFactory(name='test', domain='http://test.com', creator=self.user,
                                   client=self.m_client, is_released=True, shared_email='test@gmail.com')
        lead1 = LeadFactory(property=property, email='test3@gmail.com', emails=[], tasks=[], notes=[])
        email_message = EmailMessageFactory(lead=lead1, receiver_email=lead1.email, property=property)

        lead = LeadFactory(property=self.property, email='test3@gmail.com', emails=[], tasks=[], notes=[])
        message = dict(property=self.property.pk, id='test3', body='test3', subject='test3',
                       date=datetime.datetime.timestamp(timezone.now()),
                       to=[dict(name='test3', email='test3@gmail.com')],
                       from_=[dict(name='test', email='test@gmail.com')], unread=False, snippet='test', cc=[])
        mock_get.return_value = message
        create_email_message_from_nylas(message, self.property.id, lead_id=lead.pk)
        self.assertEqual(EmailMessage.objects.filter(receiver_email='test3@gmail.com').count(), 2)
        self.assertEqual(EmailMessage.objects.filter(receiver_email='test3@gmail.com',
                                                     property=self.property).first().lead, lead)
        self.assertEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED, lead=lead).first().property,
                         self.property)

        # check that after first email-lead linking, message linked to lead with same email wasn't unlinked from them
        self.assertEqual(EmailMessage.objects.filter(id=email_message.id).first().lead, lead1)
        self.assertEqual(EmailMessage.objects.filter(id=email_message.id).first().property, property)

    @patch('nylas.client.restful_model_collection.RestfulModelCollection.all')
    def test_pull_email_labels(self, mock_all):
        with patch('nylas.client.client.APIClient.account', new_callable=PropertyMock) as mock_account:
            # label
            account = dict(organization_unit='label')
            AccountObject = namedtuple('AccountObject', account.keys())
            account = AccountObject(**account)
            mock_account.return_value = account

            mock_all.return_value = [dict(id='1', display_name='test1'), dict(id='2', display_name='test2')]
            pull_email_labels(self.property.pk)
            self.assertEqual(EmailLabel.objects.count(), 2)
            self.assertEqual(EmailLabel.objects.get(external_id='1').name, 'test1')
            self.assertEqual(EmailLabel.objects.get(external_id='2').name, 'test2')

            # folder
            account = dict(organization_unit='folder')
            account = AccountObject(**account)
            mock_account.return_value = account

            mock_all.return_value = [dict(id='3', display_name='test3'), dict(id='4', display_name='test4')]
            pull_email_labels(self.property.pk)
            self.assertEqual(EmailLabel.objects.count(), 4)
            self.assertEqual(EmailLabel.objects.get(external_id='3').name, 'test3')
            self.assertEqual(EmailLabel.objects.get(external_id='4').name, 'test4')

    @patch('nylas.client.client.APIClient.account', new_callable=PropertyMock)
    @patch('nylas.client.restful_model_collection.RestfulModelCollection.all')
    @patch('nylas.client.restful_model_collection.RestfulModelCollection.get')
    def test_archive_messages_task(self, mock_get, mock_all, mock_account):
        account = dict(organization_unit='label')
        AccountObject = namedtuple('MessageObject', account.keys())
        account = AccountObject(**account)
        mock_account.return_value = account

        label = dict(id='3', name='all')
        LabelObject = namedtuple('LabelObject', label.keys())
        labels = [LabelObject(**label), LabelObject(id='1', name='test1'), LabelObject(id='2', name='test2')]
        mock_all.return_value = labels

        email_message1 = EmailMessageFactory(property=self.property, snippet='test1', subject='test1',
                                             is_unread=True, is_archived=True, nylas_message_id='test1')
        email_message2 = EmailMessageFactory(property=self.property, snippet='test2', subject='test2',
                                             is_unread=True, is_archived=True, nylas_message_id='test2')

        def side_effect(arg):
            message1 = dict(property=self.property.pk, id='test1', body='test1', subject='test1',
                            date=datetime.datetime.timestamp(timezone.now()),
                            to=[dict(name='test1', email='test1@gmail.com')],
                            from_=[dict(name='test2', email='test2@gmail.com')], unread=False, snippet='test1',
                            cc=[], labels=[dict(id='1', display_name='test1'), dict(id='2', display_name='test2')])
            MessageObject = namedtuple('MessageObject', message1.keys())
            message1 = MessageObject(**message1)

            message2 = dict(property=self.property.pk, id='test2', body='test2', subject='test2',
                            date=datetime.datetime.timestamp(timezone.now()),
                            to=[dict(name='test1', email='test1@gmail.com')],
                            from_=[dict(name='test2', email='test2@gmail.com')], unread=False, snippet='test2',
                            cc=[], labels=[dict(id='1', display_name='test1'), dict(id='2', display_name='test2')])
            MessageObject = namedtuple('MessageObject', message2.keys())
            message2 = MessageObject(**message2)

            result = message1 if arg == 'test1' else message2

            mock = MagicMock()
            mock.return_value = result
            mock.add_label.return_value = None
            mock.remove_labels.return_value = None
            mock.labels.get.return_value = '3'
            return mock

        EmailLabel.objects.create(name='all', external_id='3', property=self.property)

        mock_get.side_effect = side_effect
        archive_messages_task(self.property.pk, [email_message1.pk, email_message2.pk])
        self.assertEqual(EmailMessage.objects.count(), 2)
        self.assertEqual(EmailMessage.objects.get(subject='test1').labels.first().name, 'all')
        self.assertEqual(EmailMessage.objects.get(subject='test2').labels.first().name, 'all')

    @patch('nylas.client.client.APIClient.account', new_callable=PropertyMock)
    @patch('nylas.client.restful_model_collection.RestfulModelCollection.where')
    def test_sync_nylas_messages_task(self, mock_where, mock_account):
        account = dict(organization_unit='label')
        AccountObject = namedtuple('MessageObject', account.keys())
        account = AccountObject(**account)
        mock_account.return_value = account

        def side_effect(received_after, received_before):
            message1 = dict(property=self.property.pk, id='test1', body='test1', subject='test1',
                            date=datetime.datetime.timestamp(timezone.now() - datetime.timedelta(days=1)),
                            to=[dict(name='test1', email='test1@gmail.com')],
                            from_=[dict(name='test2', email='test2@gmail.com')], unread=False, snippet='test1',
                            cc=[], labels=[dict(id='1', display_name='test1'), dict(id='2', display_name='test2')],
                            files=[])

            message2 = dict(property=self.property.pk, id='test2', body='test2', subject='test2',
                            date=datetime.datetime.timestamp(timezone.now() - datetime.timedelta(days=35)),
                            to=[dict(name='test1', email='test1@gmail.com')],
                            from_=[dict(name='test2', email='test2@gmail.com')], unread=False, snippet='test2',
                            cc=[], labels=[dict(id='1', display_name='test1'), dict(id='2', display_name='test2')],
                            files=[])

            result = []
            for message in [message1, message2]:
                if datetime.datetime.fromtimestamp(float(received_after)) <= datetime.datetime.fromtimestamp(message['date']) <= \
                        datetime.datetime.fromtimestamp(float(received_before)):
                    result.append(message)
            mock = MagicMock()
            mock.all.return_value = result
            return mock

        mock_where.side_effect = side_effect
        sync_nylas_messages_task(self.property.pk)
        self.assertEqual(EmailMessage.objects.count(), 1)

    def test_reset_sent_email_counters(self):
        property = PropertyFactory(creator=self.user, client=self.m_client,
                                   is_email_blast_disabled=True, sent_email_count=700)

        reset_sent_email_counters()
        property = Property.objects.get(pk=property.pk)
        self.assertEqual(property.is_email_blast_disabled, False)
        self.assertEqual(property.sent_email_count, 0)

    def test_send_guest_card_email(self):
        lead = Lead.objects.create(property=self.property, first_name='Testo', last_name='User', email='test2@gmail.com')
        with patch('backend.api.tasks.nylas.send_guest_card_email.send_email_message') as mock_method:
            send_guest_card_email(lead.pk)
            args, kwargs = mock_method.call_args
            print(args, kwargs)
            self.assertTrue('Thank you for considering' in args[0])
            self.assertTrue('test1 Inquiry' in args[1])
            self.assertTrue(kwargs['is_guest_card'])
            self.assertEqual(kwargs['lead'], lead)

    def test_send_guest_card_email_without_nylas(self):
        lead = Lead.objects.create(property=self.property, first_name='Testo', last_name='User', email='test2@gmail.com')
        with patch('backend.api.tasks.emails.send_guest_card_emails_without_nylas.EmailMultiAlternatives') as mock_method:
            send_guest_card_emails_without_nylas(lead.pk)
            for index, call_args in enumerate(mock_method.call_args_list):
                args, kwargs = call_args
                if index == 0:
                    self.assertEqual(args[0], 'You have a new lead from test1')
                    self.assertEqual(args[2], 'integrate@dwell.io')
                else:
                    self.assertEqual(args[0], 'test1 Inquiry')
                    self.assertEqual(args[2], 'hello@dwell.io')
