from datetime import datetime, timedelta

import pytz
from mock import patch, MagicMock

from backend.api.factories import PropertyFactory, LeadFactory, EmailMessageFactory, CallFactory, NoteFactory, \
    TaskFactory, ProspectLostReasonFactory
from backend.api.models import Property, Lead, Call
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import calculate_overall_data, get_activities_data

TZ = pytz.timezone('America/Phoenix')


def get_leads():
    from django.db.models import Q
    lead_status_filter = (
            Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test'))
    )
    leads = Lead.objects.exclude(
        Q(status=Lead.LEAD_TEST) | lead_status_filter)
    leads = {'leads': list(leads.values_list('pk', flat=True))}
    return leads


class ActivityReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ActivityReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(property, leads_count, tasks_count=0, emails_count=0, calls_count=0, notes_count=0,
                            lead_created_date=None, is_test_lead=False, is_lost_reason_lead=False):
        """
        Generate email message, calls, tasks, notes factories with given parameters.
        :param tasks_count:
        :param emails_count:
        :param calls_count:
        :param notes_count:
        :return:
        """
        with patch('requests.get'):
            for index in range(leads_count):
                status = Lead.LEAD_ACTIVE
                lost_reason = None
                if is_lost_reason_lead:
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )
                    status = Lead.LEAD_LOST
                if is_test_lead:
                    status = Lead.LEAD_TEST

                lead = LeadFactory(
                    owner=None,
                    property=property,
                    emails=[], notes=[], tasks=[],
                    status=status,
                    lost_reason=lost_reason
                )

                lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                lead.save()

                for i in range(tasks_count):
                    TaskFactory(lead=lead, property=property)

                for i in range(emails_count):
                    EmailMessageFactory(property=property, receiver_email=lead.email, receiver_name=lead.first_name,
                                        lead=lead, date=datetime.now(tz=TZ).replace(hour=15))

                for i in range(calls_count):
                    CallFactory(lead=lead, property=property, call_category=Call.CALL_CATEGORY_PROSPECT,
                                date=datetime.now(tz=TZ).replace(hour=15))

                for i in range(notes_count):
                    NoteFactory(lead=lead, property=property)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_emails(self, mock_aggregate, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, emails_count=1)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        leads = get_leads()
        activity_report = {**activity_report, **leads}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'], 'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=False)

        # All activities are emails
        self.assertEqual(result['activities'], 10)
        self.assertEqual(result['emails'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_calls(self, mock_aggregate, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, calls_count=1)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        leads = get_leads()
        activity_report = {**activity_report, **leads}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'], 'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=False)

        # All activities are calls
        self.assertEqual(result['activities'], 10)
        self.assertEqual(result['calls'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_tasks(self, mock_aggregate, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, tasks_count=1)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        leads = get_leads()
        activity_report = {**activity_report, **leads}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'], 'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=False)

        # All activities are tasks
        self.assertEqual(result['activities'], 10)
        self.assertEqual(result['tasks'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_notes(self, mock_aggregate, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, notes_count=1)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        leads = get_leads()
        activity_report = {**activity_report, **leads}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'], 'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=False)

        # All activities are notes
        self.assertEqual(result['activities'], 10)
        self.assertEqual(result['notes'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_performance_mode(self, mock_aggregate, mock_values_list):
        lead_created_date = datetime.now(tz=TZ).replace(hour=13) - timedelta(days=2)
        self._generate_mock_data(self.property_1, leads_count=10, notes_count=1, calls_count=1, tasks_count=1,
                                 emails_count=1, lead_created_date=lead_created_date)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        activity_report = {**activity_report, 'leads': []}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'], 'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=True)

        # In performance mode only calls are counted
        self.assertEqual(result['activities'], 10)
        self.assertEqual(result['calls'], 10)
        self.assertEqual(result['notes'], 0)
        self.assertEqual(result['tasks'], 0)
        self.assertEqual(result['emails'], 0)

    @patch('backend.api.models.Report.objects.values_list')
    @patch('backend.api.models.Report.objects.aggregate')
    def test_activities_for_test_leads(self, mock_aggregate, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, emails_count=10,
                                 tasks_count=10, notes_count=10, calls_count=10, is_test_lead=True)
        self._generate_mock_data(self.property_1, leads_count=10, emails_count=10,
                                 tasks_count=10, notes_count=10, calls_count=10, is_lost_reason_lead=True)
        activity_report = get_activities_data((self.start_date, self.end_date), Property.objects.all())
        leads = get_leads()
        activity_report = {**activity_report, **leads}

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = activity_report[value]
            return [activity_report[value]]

        mock_values_list.side_effect = side_effect
        mock_aggregate.return_value = {'calls': activity_report['calls'],
                                       'agent_chats': activity_report['agent_chats']}

        result = calculate_overall_data('activity_report', [activity_report], is_performance=False)

        # All activities are emails
        self.assertEqual(result['activities'], 0)
        self.assertEqual(result['calls'], 0)
        self.assertEqual(result['notes'], 0)
        self.assertEqual(result['tasks'], 0)
        self.assertEqual(result['emails'], 0)
