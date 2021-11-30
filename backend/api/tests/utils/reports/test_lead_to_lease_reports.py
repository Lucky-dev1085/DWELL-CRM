from datetime import datetime, timedelta

import pytz
from mock import patch, MagicMock

from backend.api.factories import PropertyFactory, LeadFactory, ProspectLostReasonFactory
from backend.api.models import Property, Lead
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import calculate_overall_data, get_lead_to_lease_data, get_audition_data

TZ = pytz.timezone('America/Phoenix')


class LeadToLeaseReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LeadToLeaseReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(property, leads_count, leases_count=0, tours_count=0,
                            lead_created_date=None, is_test_lead=False, is_spam_or_test=False):
        """
        Generate lead factories with given parameters.
        :param leads_count:
        :param leases_count:
        :param tours_count:
        :param lead_created_date:
        :return:
        """
        with patch('requests.get'):
            for index in range(leases_count + tours_count if leases_count and tours_count else leads_count):
                status = Lead.LEAD_ACTIVE
                lost_reason = None
                if is_test_lead:
                    status = Lead.LEAD_TEST

                if is_spam_or_test:
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )
                    status = Lead.LEAD_LOST

                lead = LeadFactory(
                    owner=None,
                    property=property,
                    status=status,
                    lost_reason=lost_reason
                )
                lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                lead.closed_status_date = None
                lead.tour_completed_date = None
                lead.save()

            leases = Lead.objects.filter(property=property).all()[:leases_count]
            for lead in leases:
                lead.status = Lead.LEAD_CLOSED
                lead.closed_status_date = datetime.now(tz=TZ).replace(hour=15)
                lead.save()

            tours = Lead.objects.filter(property=property).all()[leases_count:leases_count + tours_count]
            for lead in tours:
                lead.tour_completed_date = datetime.now(tz=TZ).replace(hour=15)
                lead.save()

    @patch('backend.api.models.Report.objects.values_list')
    def test_leads(self, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10)
        self._generate_mock_data(self.property_1, leads_count=10, lead_created_date=datetime.now(tz=TZ).replace(hour=23))

        self._generate_mock_data(self.property_1, leads_count=12, is_test_lead=True)
        self._generate_mock_data(self.property_1, leads_count=17,
                                 lead_created_date=datetime.now(tz=TZ).replace(hour=23), is_test_lead=True)

        self._generate_mock_data(self.property_1, leads_count=12, is_spam_or_test=True)
        self._generate_mock_data(self.property_1, leads_count=17,
                                 lead_created_date=datetime.now(tz=TZ).replace(hour=23), is_spam_or_test=True)

        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)

        # only first mock data should count, second one is after hours, so counts as next day
        self.assertEqual(result['leads'], 10)

        sunday = self.property_1.business_hours.filter(weekday=6).first()
        sunday.is_workday = False
        sunday.save()

        # Sunday, day off, all these leads should count as leads for Monday
        self._generate_mock_data(
            self.property_1, leads_count=10,
            lead_created_date=datetime(2020, 9, 6, tzinfo=TZ).replace(hour=13)
        )
        self._generate_mock_data(
            self.property_1, leads_count=16, lead_created_date=datetime(2020, 9, 6, tzinfo=TZ).replace(hour=13),
            is_test_lead=True
        )

        self._generate_mock_data(self.property_1, leads_count=16,
                                 lead_created_date=datetime(2020, 9, 6, tzinfo=TZ).replace(hour=13),
                                 is_spam_or_test=True
                                 )

        start = TZ.localize(datetime.combine(datetime(2020, 9, 6), datetime.min.time()))
        end = TZ.localize(datetime.combine(datetime(2020, 9, 6), datetime.min.time()))
        lead_to_lease_report = get_lead_to_lease_data((start, end), Property.objects.all())
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)
        self.assertEqual(result['leads'], 0)

        # Monday, work day
        self._generate_mock_data(self.property_1, leads_count=10,
                                 lead_created_date=datetime(2020, 9, 7, tzinfo=TZ).replace(hour=13))

        self._generate_mock_data(self.property_1, leads_count=9,
                                 lead_created_date=datetime(2020, 9, 7, tzinfo=TZ).replace(hour=13), is_test_lead=True)

        self._generate_mock_data(self.property_1, leads_count=9,
                                 lead_created_date=datetime(2020, 9, 7, tzinfo=TZ).replace(hour=13), is_spam_or_test=True)

        start = TZ.localize(datetime.combine(datetime(2020, 9, 7), datetime.min.time()))
        end = TZ.localize(datetime.combine(datetime(2020, 9, 7), datetime.min.time()))
        lead_to_lease_report = get_lead_to_lease_data((start, end), Property.objects.all())
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)
        self.assertEqual(result['leads'], 20)

    @patch('backend.api.models.Report.objects.values_list')
    def test_leases(self, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, leases_count=10)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)

        self.assertEqual(result['leases'], 10)
        self.assertEqual(result['leased_rate'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_tours(self, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10, tours_count=10)
        self._generate_mock_data(self.property_1, leads_count=17, tours_count=17, is_test_lead=True)
        self._generate_mock_data(self.property_1, leads_count=17, tours_count=17, is_spam_or_test=True)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)

        self.assertEqual(result['tours'], 10)
        self.assertEqual(result['lead_to_tour'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_tour_to_lease(self, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=20, leases_count=10, tours_count=10)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)

        self.assertEqual(result['tour_to_lease'], 100)
        self.assertEqual(result['leased_rate'], 50)
        self.assertEqual(result['lead_to_tour'], 50)

    @patch('backend.api.models.Report.objects.values_list')
    def test_performance_mode(self, mock_values_list):
        lead_created_date = datetime.now(tz=TZ).replace(hour=13) - timedelta(days=2)
        self._generate_mock_data(self.property_1, leads_count=20, leases_count=10, tours_count=10,
                                 lead_created_date=lead_created_date)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report])

        self.assertEqual(result['leads'], 0)
        self.assertEqual(result['leases'], 0)
        self.assertEqual(result['tours'], 0)
        self.assertEqual(result['tour_to_lease'], 0)
        self.assertEqual(result['leased_rate'], 0)
        self.assertEqual(result['lead_to_tour'], 0)

    @patch('backend.api.models.Report.objects.values_list')
    def test_audition_data(self, mock_values_list):
        self._generate_mock_data(self.property_1, leads_count=10)
        self._generate_mock_data(self.property_1, leads_count=10, leases_count=10)
        self._generate_mock_data(self.property_1, leads_count=10, tours_count=10)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = lead_to_lease_report[value]
            return [lead_to_lease_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('lead_to_lease_report', [lead_to_lease_report], is_performance=False)
        self.assertEqual(result['leads'], 30)
        audition_leads = get_audition_data([lead_to_lease_report], 'leads')
        self.assertEqual(len(audition_leads), 30)

        self.assertEqual(result['leases'], 10)
        audition_leases = get_audition_data([lead_to_lease_report], 'leases')
        self.assertEqual(len(audition_leases), 10)

        self.assertEqual(result['tours'], 10)
        audition_tours = get_audition_data([lead_to_lease_report], 'tours')
        self.assertEqual(len(audition_tours), 10)
