import datetime

from pytz import UTC
from django.utils import timezone

from collections import namedtuple, Callable
from rest_framework.test import APITestCase
from unittest.mock import patch

from backend.api.models import Activity, Task, User, Lead, Call, Note, EmailAttachment, PhoneNumber
from backend.api.factories import UserFactory, TaskFactory, NoteFactory, LeadFactory, EmailMessageFactory, \
    ClientFactory, CustomerFactory, PropertyFactory, CallFactory, ProspectSourceFactory, \
    EmailAttachmentFactory, ProspectLostReasonFactory, PhoneNumberFactory, SMSContentFactory


class MessageTestObject(object):
    name = None

    def mark_as_read(self):
        return True


class ModelSignalsTests(APITestCase):
    def setUp(self):
        super(ModelSignalsTests, self).setUp()
        self.l_user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')
        self.c_user = UserFactory(password='password123psswrd', role=User.C_ADMIN, status='ACTIVE')

    def setup_property(self):
        self.customer = CustomerFactory()
        self.c_user.customer = self.customer
        self.c_user.save()
        self.client = ClientFactory(creator=self.c_user)
        self.assertEqual(self.c_user.customer.properties.count(), 0)
        self.property = PropertyFactory(client=self.client, status='ACTIVE', creator=self.c_user)

    def test_add_property_to_user_signal(self):
        """
        Ensure add_property_to_user signal is called
        """
        self.setup_property()
        # self.assertEqual(self.c_user.customer.properties.count(), 1)
        self.assertEqual(self.l_user.properties.count(), 1)

    def test_add_client_to_user_signal(self):
        """
        Ensure add_client_to_user signal is called
        """
        self.assertFalse(self.l_user.client.all())
        self.assertFalse(self.c_user.client.all())
        customer = CustomerFactory()
        self.c_user.customer = customer
        self.c_user.save()
        ClientFactory(creator=self.c_user)
        self.assertEqual(self.l_user.clients.count(), 1)
        # self.assertEqual(self.c_user.customer.clients.count(), 1)

    def test_ping_google_signal(self):
        self.setup_property()

    def test_update_property_external_id_signal(self):
        """
        Ensure update_property_external_id signal is called
        """
        self.setup_property()
        self.assertTrue(self.property.external_id)

    def test_lead_create_activity_signal(self):
        """
        Ensure lead_create_activity signal is called
        """
        self.setup_property()
        self.assertEqual(Activity.objects.count(), 0)
        LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        self.assertNotEqual(Activity.objects.count(), 0)

    # def test_task_create_activity_signal(self):
    #     """
    #     Ensure task_create_activity signal is called
    #     """
    #     self.setup_property()
    #     self.assertEqual(Activity.objects.count(), 0)
    #     TaskFactory(property=self.property,
    #                 tour_date=(datetime.datetime.today() + datetime.timedelta(days=1)).replace(tzinfo=UTC),
    #                 status=Task.TASK_OPEN)
    #     self.assertEqual(Activity.objects.count(), 1)

    def test_task_update_activity_signal(self):
        """
        Ensure task_update_activity signal is called
        """
        self.setup_property()
        self.assertEqual(Activity.objects.count(), 0)
        task = TaskFactory(property=self.property,
                           tour_date=(datetime.datetime.today() + datetime.timedelta(days=1)).replace(tzinfo=UTC),
                           status=Task.TASK_OPEN)

        LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        task.type = Task.TYPE_TOUR
        task.status = Task.TASK_COMPLETED
        task.save()
        activities = Activity.objects.filter(type=Activity.TOUR_COMPLETED)
        self.assertEqual(activities.count(), 1)

        task.status = Task.TASK_OPEN
        task.save()
        activities = Activity.objects.filter(type=Activity.TOUR_COMPLETED)
        self.assertEqual(activities.count(), 1)

        task.type = Task.TYPE_FOLLOW_FIRST
        task.status = Task.TASK_COMPLETED
        task.save()
        activities = Activity.objects.filter(type=Activity.TASK_COMPLETED)
        self.assertEqual(activities.count(), 1)

    def test_note_create_activity_signal(self):
        """
        Ensure note_create_activity signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        NoteFactory(property=self.property, lead=lead)
        activities = Activity.objects.filter(type=Activity.NOTE_CREATED)
        self.assertNotEqual(activities.count(), 0)

    def test_email_create_activity(self):
        """
        Ensure email_create signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE)
        EmailMessageFactory(property=self.property, lead=lead, receiver_email=lead.email,
                            nylas_message_id='test')
        self.assertNotEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED).count(), 0)

    def test_lead_update_activity_signal(self):
        """
        Ensure lead_update_activity signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE)
        lead.stage = Lead.STAGE_TOUR_COMPLETED
        lead.save()
        self.assertEqual(Activity.objects.filter(type=Activity.LEAD_UPDATED).count(), 1)

        lead.status = Lead.LEAD_LOST
        lead.save()
        self.assertEqual(Activity.objects.filter(type=Activity.LEAD_UPDATED).count(), 2)

        lead.move_in_date = timezone.now().replace(tzinfo=UTC)
        lead.save()
        self.assertEqual(Activity.objects.filter(type=Activity.LEAD_UPDATED).count(), 3)

        lead.owner = self.l_user
        lead.save()
        self.assertEqual(Activity.objects.filter(type=Activity.LEAD_UPDATED).count(), 4)

    # todo should be rewritten as it's moved to serializer
    # @patch('django.db.connection.on_commit')
    # def test_convert_mst_conversion_to_lead_signal(self, mock_connection_commit):
    #     """
    #     Ensure convert_mst_conversion_to_lead signal is called
    #     """
    #     mock_connection_commit.return_value = None
    #     self.setup_property()
    #     ProspectSourceFactory(property=self.property, name='Standalone Website')
    #     ConversionFactory(property=self.property)
    #
    #     lead = LeadFactory(property=self.property, first_name='test2', last_name='test2', owner=None,
    #                        email='test1@gmail.com', phone_number='12345678')
    #     self.assertFalse(lead.last_source)
    #     self.assertNotEqual(Lead.objects.count(), 0)
    #
    #     ConversionFactory(property=self.property, first_name='test2', last_name='test2',
    #                       email='test1@gmail.com', phone_number='12345678')
    #     self.assertTrue(Lead.objects.get(pk=lead.pk).last_source)
    #     self.assertTrue(mock_connection_commit.called)
    #     self.assertTrue(isinstance(mock_connection_commit.call_args, Callable))

    def test_check_properties_accessibility_signal(self):
        """
        Ensure check_properties_accessibility signal is called
        """
        g_user = UserFactory(password='password123psswrd', role=User.G_ADMIN, status='ACTIVE')
        self.setup_property()
        g_user.properties.add(self.property)

    def test_check_clients_accessibility_signal(self):
        """
        Ensure check_clients_accessibility signal is called
        """
        g_user = UserFactory(password='password123psswrd', role=User.G_ADMIN, status='ACTIVE')
        self.setup_property()
        g_user.clients.add(self.client)

    @patch('backend.api.signals.model_signals.APIClient')
    def test_update_nylas_message_status_signal(self, mock_APIClient):
        """
        Ensure update_nylas_message_status signal is called
        """
        message = dict(messages={'test': MessageTestObject()})
        MessageObject = namedtuple('MessageObject', message.keys())
        message = MessageObject(**message)
        mock_APIClient.return_value = message
        self.setup_property()
        email_message = EmailMessageFactory(property=self.property, nylas_message_id='test')
        email_message.is_unread = False
        email_message.save()
        self.assertTrue(mock_APIClient.called)

    def test_update_email_messages_lead_signal(self):
        """
        Ensure update_email_messages_lead signal is called
        """
        self.setup_property()
        email_message = EmailMessageFactory(property=self.property, nylas_message_id='test')
        self.assertFalse(email_message.lead)

        lead = LeadFactory(property=self.property, first_name='test2', last_name='test2', owner=None,
                           email='test1@gmail.com', phone_number='12345678')

        email_message.lead = lead
        email_message.save()
        self.assertTrue(email_message.lead)
        self.assertEqual(email_message.lead, lead)

        email_message.lead = None
        email_message.save()
        self.assertFalse(email_message.lead)
        self.assertEqual(email_message.lead, None)

    def test_disable_email_blast_signal(self):
        """
        Ensure disable_email_blast signal is called
        """
        self.setup_property()
        self.assertFalse(self.property.is_email_blast_disabled)

        self.property.sent_email_count = 800
        self.property.save()
        self.assertTrue(self.property.is_email_blast_disabled)

    # todo should be rewrite as it's moved to signal
    # @patch('backend.api.signals.model_signals.send_tour_confirmation_one_day_reminder.apply_async')
    # def test_setup_tour_confirmation_sequence_signal(self, mock_send_tour_confirmation_one_day_reminder):
    #     """
    #     Ensure setup_tour_confirmation_sequence signal is called
    #     """
    #     task = dict(id='123456')
    #     TaskObject = namedtuple('TaskObject', task.keys())
    #     task = TaskObject(**task)
    #     mock_send_tour_confirmation_one_day_reminder.return_value = task
    #     self.setup_property()
    #     lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
    #     task = TaskFactory(property=self.property,
    #                        tour_date=(datetime.datetime.today() + datetime.timedelta(days=1)).replace(tzinfo=UTC),
    #                        status=Task.TASK_OPEN)
    #     self.assertNotEqual(Activity.objects.count(), 0)
    #
    #     self.property.nylas_status = Property.NYLAS_STATUS_CONNECTED
    #     self.property.save()
    #     task.property = self.property
    #     task.tour_date = (datetime.datetime.today() + datetime.timedelta(days=2)).replace(tzinfo=UTC)
    #     task.type = Task.TYPE_TOUR
    #     task.lead = lead
    #     task.save()
    #     self.assertNotEqual(Activity.objects.count(), 0)
    #     self.assertTrue(lead.confirmation_reminder_async_id)
    #     self.assertTrue(mock_send_tour_confirmation_one_day_reminder.called)

    def test_change_closed_status_date_signal(self):
        """
        Ensure change_closed_status_datesignal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        self.assertFalse(lead.closed_status_date)

        lead.status = Lead.LEAD_CLOSED
        lead.save()
        self.assertTrue(lead.closed_status_date)

    def test_change_lost_status_date_signal(self):
        """
        Ensure change_lost_status_date signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        self.assertFalse(lead.lost_status_date)

        lead.status = Lead.LEAD_LOST
        lead.save()
        self.assertTrue(lead.lost_status_date)

    @patch('django.db.models.fields.files.FileField.attr_class.delete')
    def test_auto_delete_attachment_signal(self, mock_attachment):
        """
        Ensure auto_delete_attachment signal is called
        """
        mock_attachment.return_value = None
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        email_message = EmailMessageFactory(property=self.property, lead=lead, receiver_email=lead.email,
                                            nylas_message_id='test')
        email_attachment = EmailAttachmentFactory(email_message=email_message, attachment='image.jpeg')
        email_attachment.delete()
        self.assertTrue(mock_attachment.called)
        self.assertEqual(EmailAttachment.objects.count(), 0)

    def test_generate_call_transcription_note_signal(self):
        """
        Ensure generate_call_transcription signal is called
        """
        self.setup_property()
        call = Call.objects.create(property=self.property, source='Mark-Taylor.com', prospect_phone_number='4804526578',
                                   duration=109, date=timezone.now(),
                                   transcription='https://crm-staging-transcription.s3-us-west-1.amazonaws.com/47191486-transcribe.json',
                                   is_transcribed=False, recording='call_recording/san-milan_47191486_1581245084.mp3')
        self.assertEqual(Call.objects.count(), 1)
        self.assertEqual(Note.objects.count(), 0)

        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        call.is_transcribed = True
        call.lead = lead
        call.save()
        self.assertEqual(Call.objects.count(), 1)

    def test_note_followup_signal(self):
        """
        Ensure note_followup signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        note = NoteFactory(property=self.property, lead=lead)
        self.assertFalse(note.lead.last_followup_date)

        note.is_follow_up = True
        note.save()
        self.assertTrue(note.lead.last_followup_date)

    def test_auto_lead_link_with_calls_signal(self):
        """
        Ensure auto_lead_link_with_calls signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        lead.phone_number = '123456789'
        lead.save()
        self.assertEqual(lead.calls.count(), 0)

        call = CallFactory(property=self.property)
        self.assertFalse(call.lead)
        lead.phone_number = call.prospect_phone_number
        lead.save()

        self.assertTrue(Call.objects.first().lead)
        self.assertNotEqual(lead.calls.count(), 0)

        # if lead status is leased (closed) or stage is application completed,
        # then we should set the category of this call to non prospect
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_CLOSED)
        call = CallFactory(property=self.property)
        self.assertFalse(call.lead)
        lead.phone_number = call.prospect_phone_number
        lead.save()

        self.assertEqual(Call.objects.get(pk=call.pk).lead.pk, lead.pk)
        self.assertEqual(Call.objects.get(pk=call.pk).call_category, Call.CALL_CATEGORY_NON_PROSPECT)

        # if lead status is not leased (closed), stage is not application completed and the last follow date is greater
        # than 14 days, we should set acquisition_date to today
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE)
        call = CallFactory(property=self.property)
        self.assertFalse(call.lead)
        lead.phone_number = call.prospect_phone_number
        lead.last_followup_date = timezone.now() - datetime.timedelta(days=15)
        lead.save()

        self.assertEqual(Call.objects.get(pk=call.pk).lead.pk, lead.pk)
        self.assertEqual(Call.objects.get(pk=call.pk).call_category, Call.CALL_CATEGORY_PROSPECT)
        self.assertTrue((timezone.now() - lead.acquisition_date).total_seconds() < 60)

    def test_update_lead_last_activity_date(self):
        """
        Ensure update_lead_last_activity signal is called
        """
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        lead.phone_number = '123456789'
        lead.save()
        self.assertEqual(lead.calls.count(), 0)
        last_activity_date = lead.last_activity_date

        call = CallFactory(property=self.property)
        lead.phone_number = call.prospect_phone_number
        lead.save()
        self.assertTrue(lead.last_activity_date)
        self.assertNotEqual(lead.last_activity_date, last_activity_date)

    def test_user_advanced_reports_access_update_signal(self):
        """
        Ensure user_advanced_reports_access_update signal is called
        """
        self.assertTrue(self.l_user.has_advanced_reports_access)

    def test_lost_reason_validity_signal(self):
        """
        Ensure lost_reason_validity signal is called
        """
        self.setup_property()
        lost_reason = ProspectLostReasonFactory(name='Cancelled')
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')

        lead.status = Lead.LEAD_LOST
        lead.lost_reason = lost_reason
        lead.save()
        self.assertEqual(lead.lost_reason, lost_reason)

    @patch('django.db.connection.on_commit')
    def test_sync_comm_log_from_note_signal(self, mock_connection_commit):
        """
        Ensure sync_comm_log_from_note signal is called
        """
        mock_connection_commit.return_value = None
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status='ACTIVE')
        NoteFactory(property=self.property, lead=lead)
        self.assertTrue(mock_connection_commit.called)

        lead.resman_prospect_id = 'test'
        lead.save()
        NoteFactory(property=self.property, lead=lead)
        self.assertTrue(mock_connection_commit.called)
        self.assertTrue(isinstance(mock_connection_commit.call_args, Callable))

    @patch('django.db.connection.on_commit')
    def test_sync_comm_log_from_email_message_signal(self, mock_connection_commit):
        """
        Ensure sync_comm_log_from_email_message signal is called
        """
        mock_connection_commit.return_value = None
        self.setup_property()
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE)
        EmailMessageFactory(property=self.property, lead=lead, receiver_email=lead.email,
                            nylas_message_id='test')
        self.assertTrue(mock_connection_commit.called)
        self.assertTrue(isinstance(mock_connection_commit.call_args, Callable))

    def test_replace_owner_with_property_account_on_update(self):
        self.setup_property()

        user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')
        user.properties.add(self.property)

        property_account = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE',
                                       is_property_account=True)
        property_account.properties.add(self.property)

        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE, owner=user)
        task = TaskFactory(property=self.property,
                           tour_date=(datetime.datetime.today() + datetime.timedelta(days=1)).replace(tzinfo=UTC),
                           status=Task.TASK_OPEN, owner=user)
        self.assertEqual(lead.owner, user)
        self.assertEqual(task.owner, user)

        user.properties.remove(self.property)
        lead = Lead.objects.filter(pk=lead.pk).first()
        task = Task.objects.filter(pk=task.pk).first()
        self.assertEqual(lead.owner, property_account)
        self.assertEqual(task.owner, property_account)

    def test_replace_owner_with_property_account_on_delete(self):
        self.setup_property()

        user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')
        user.properties.add(self.property)

        property_account = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE',
                                       is_property_account=True)
        property_account.properties.add(self.property)

        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE, owner=user)
        task = TaskFactory(property=self.property,
                           tour_date=(datetime.datetime.today() + datetime.timedelta(days=1)).replace(tzinfo=UTC),
                           status=Task.TASK_OPEN, owner=user)
        self.assertEqual(lead.owner, user)
        self.assertEqual(task.owner, user)

        user.delete()
        lead = Lead.objects.filter(pk=lead.pk).first()
        task = Task.objects.filter(pk=task.pk).first()
        self.assertEqual(lead.owner, property_account)
        self.assertEqual(task.owner, property_account)

    # todo temporarily disable it
    # @patch('backend.api.models.phone_number.purchase_twilio_number')
    # @patch('backend.api.signals.model_signals.twilio_release_number')
    # def test_release_phone_number(self, mock_purchase_twilio_number, mock_twilio_release_number):
    #     mock_purchase_twilio_number.return_value = None
    #     mock_twilio_release_number.return_value = None
    #     self.setup_property()
    #     source = ProspectSourceFactory(property=self.property, name='test source')
    #     phone_number = PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_TRACKING, source=source)
    #     phone_number.delete()
    #     self.assertEqual(PhoneNumber.objects.count(), 0)
    #
    #     phone_number = PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_TRACKING, source=source,
    #                                       twilio_sid='test sid')
    #     phone_number.delete()
    #     self.assertTrue(mock_twilio_release_number.called)
    #     self.assertEqual(PhoneNumber.objects.count(), 0)

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_sms_create_activity(self, mock_purchase_twilio_number):
        self.setup_property()
        source = ProspectSourceFactory(property=self.property, name='test source')
        mock_purchase_twilio_number.return_value = None
        PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_TRACKING, source=source)

        user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')
        lead = LeadFactory(property=self.property, stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE, owner=user)
        activity_count = Activity.objects.count()
        SMSContentFactory(lead=lead, property=self.property, message='Test', is_read=False,
                          sender_number=self.property.sms_tracking_number, date=timezone.now())
        self.assertEqual(Activity.objects.filter(type=Activity.SMS_CREATED).count(), 1)
        self.assertEqual(Activity.objects.count(), activity_count + 1)

        SMSContentFactory(lead=lead, property=self.property, message='Test2', is_read=False,
                          sender_number='+123456', date=timezone.now())
        self.assertEqual(Activity.objects.filter(type=Activity.SMS_CREATED).count(), 1)
        self.assertEqual(Activity.objects.count(), activity_count + 1)
