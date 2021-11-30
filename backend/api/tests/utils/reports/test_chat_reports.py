from datetime import datetime, timedelta

import pytz
from freezegun import freeze_time
from mock import patch

from backend.api.factories import ChatProspectFactory, ChatConversationFactory, LeadFactory, TaskFactory, \
    ProspectLostReasonFactory
from backend.api.models import Property, ChatConversation, Lead, Task
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import get_chat_data

TZ = pytz.timezone('America/Phoenix')


@freeze_time(TZ.localize(datetime(2020, 1, 1, 8, 10)))
class ChatReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ChatReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property.shared_email = 'shared@example.com'
            self.property.save()
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(property, user=None, prospects_count=1, conversations_count=10, to_agent=False,
                            type=ChatConversation.TYPE_PROSPECT, action=None, guest_card=False, tours_count=0,
                            question_result=None, is_question=False, is_test_lead=False, is_lost_reason_lead=False):
        with patch('requests.get'):
            for index in range(prospects_count):

                prospect = ChatProspectFactory(
                    property=property,
                )
                status = Lead.LEAD_ACTIVE
                lost_reason = None
                if is_lost_reason_lead:
                    status = Lead.LEAD_LOST
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )
                if is_test_lead:
                    status = Lead.LEAD_TEST

                if guest_card:
                    lead = LeadFactory(
                        owner=None,
                        property=property,
                        emails=[],
                        status=status,
                        stage=Lead.STAGE_INQUIRY,
                        lost_reason=lost_reason
                    )
                    prospect.guest_card = lead
                    prospect.save()

                if tours_count:
                    lead = LeadFactory(
                        owner=None,
                        property=property,
                        emails=[],
                        status=status,
                        stage=Lead.STAGE_INQUIRY,
                        lost_reason=lost_reason
                    )
                    prospect.lead = lead
                    prospect.save()
                    for i in range(tours_count):
                        TaskFactory(
                            property=property,
                            lead=lead,
                            status='OPEN',
                            type=Task.TYPE_IN_PERSON,
                            is_created_through_chat=True,
                        )

                for j in range(conversations_count):
                    if type != ChatConversation.TYPE_GREETING:
                        greeting = ChatConversationFactory(
                            property=property,
                            prospect=prospect,
                            agent=user,
                            to_agent=to_agent,
                            type=ChatConversation.TYPE_GREETING,
                        )
                        greeting.date = prospect.created + timedelta(hours=j + 1, minutes=j)
                        greeting.save()

                    if is_question:
                        question_action = ChatConversationFactory(
                            property=property,
                            prospect=prospect,
                            agent=user,
                            to_agent=to_agent,
                            type=type,
                            action=ChatConversation.ACTION_QUESTION,
                        )
                        question_action.date = prospect.created + timedelta(hours=j + 1, minutes=j + 1)
                        question_action.save()

                    message = ChatConversationFactory(
                        property=property,
                        prospect=prospect,
                        agent=user,
                        to_agent=to_agent,
                        type=type,
                        action=action,
                        question_result=question_result,
                    )
                    message.date = prospect.created + timedelta(hours=j + 1, minutes=j + 1)
                    message.save()

    def test_chat_conversations(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, conversations_count=10)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages
        self.assertEqual(chat_report['chat_conversations'], 20.0)

    def test_agent_chat_conversations(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, conversations_count=10)
        self._generate_mock_data(self.property, self.user, prospects_count=2, conversations_count=10, to_agent=True)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 4 prospects * 10 messages
        self.assertEqual(chat_report['chat_conversations'], 40.0)

        # 2 prospects * 10 messages, to_agent=True
        self.assertEqual(chat_report['agent_chat_conversations'], 20.0)

    def test_repeat_chat_conversations(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, type=ChatConversation.TYPE_GREETING)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        self.assertEqual(chat_report['repeat_chat_conversations'], 2.0)

    def test_view_photos_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_VIEW_PHOTOS)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that have View Photos action
        self.assertEqual(chat_report['view_photos_count'], 20.0)

    def test_schedule_tour_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_SCHEDULE_TOUR)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that have Schedule Tour action
        self.assertEqual(chat_report['schedule_tour_count'], 20.0)

    def test_reschedule_tour_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_RESCHEDULE_TOUR)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that have Reschedule Tour action
        self.assertEqual(chat_report['reschedule_tour_count'], 20.0)

    def test_cancel_tour_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_CANCEL_TOUR)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that have Cancel Tour action
        self.assertEqual(chat_report['cancel_tour_count'], 20.0)

    def test_check_prices_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_CHECK_PRICES)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that have Check Prices action
        self.assertEqual(chat_report['check_prices_count'], 20.0)

    def test_visitor_chat_engagement(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2)
        self._generate_mock_data(self.property, self.user, prospects_count=2,
                                 action=ChatConversation.ACTION_CHECK_PRICES)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 4 prospects, but only 2 have action conversations
        self.assertEqual(chat_report['visitor_chat_engagement'], 2.0)

    def test_guests_created(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2)
        self._generate_mock_data(self.property, self.user, prospects_count=2, guest_card=True)
        self._generate_mock_data(self.property, self.user, prospects_count=2, guest_card=True, is_test_lead=True)
        self._generate_mock_data(self.property, self.user, prospects_count=2, guest_card=True, is_lost_reason_lead=True)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 4 prospects, but only 2 guest cards
        self.assertEqual(chat_report['guests_created'], 2.0)

    def test_tours_scheduled(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, tours_count=1)
        self._generate_mock_data(self.property, self.user, prospects_count=2, tours_count=1, is_test_lead=True)
        self._generate_mock_data(self.property, self.user, prospects_count=2, tours_count=1, is_lost_reason_lead=True)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 1 tour
        self.assertEqual(chat_report['tours_scheduled'], 2.0)

    def test_question_count(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, action=ChatConversation.ACTION_QUESTION)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects * 10 messages, that are questions
        self.assertEqual(chat_report['question_count'], 20.0)

    def test_hobbes_answered_questions(self):
        self._generate_mock_data(self.property, self.user, prospects_count=1, conversations_count=10,
                                 type=ChatConversation.TYPE_BOT, question_result=ChatConversation.QUESTION_RESULT_REPHRASED)
        self._generate_mock_data(self.property, self.user, prospects_count=1, conversations_count=10,
                                 type=ChatConversation.TYPE_BOT, question_result=ChatConversation.QUESTION_RESULT_ANSWERED)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        # 2 prospects, but only 10 questions have answered state
        self.assertEqual(chat_report['hobbes_answered_questions'], 10.0)

    def test_hobbes_chat_conversations(self):
        self._generate_mock_data(self.property, self.user, prospects_count=2, conversations_count=10, is_question=True)
        chat_report = get_chat_data((self.start_date, self.end_date), Property.objects.all())

        self.assertEqual(chat_report['hobbes_chat_conversations'], 20.0)
