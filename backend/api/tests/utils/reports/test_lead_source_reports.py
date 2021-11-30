from datetime import datetime, timedelta

import pytz
from mock import patch

from backend.api.factories import PropertyFactory, CallFactory, ProspectSourceFactory, LeadFactory, \
    SourceMatchingFactory, ProspectLostReasonFactory
from backend.api.models import Property, Call, Lead, Report
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import get_lead_source_data, calculate_lead_source_data

TZ = pytz.timezone('America/Phoenix')


class LeadSourceReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LeadSourceReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(properties, sources_count=1, leads_count=0, leases_count=0, tours_count=0, calls_count=0,
                            lead_created_date=None, spends=None, is_test_lead=False,
                            is_same_source_name=False, is_spam_or_test=False):
        """
        Generate sources factories with given parameters.
        :param properties:
        :param sources_count: number of sources per property
        :param leads_count: number of leads per source
        :param leases_count: number of leases per source
        :param tours_count: number of tours per source
        :param calls_count: number of calls per source
        :param lead_created_date:
        :param spends: spends for sources
        :return:
        """
        if spends is None:
            spends = []
        with patch('requests.get'):
            for property in properties:

                if property.sources.exists():
                    source = property.sources.first()
                else:
                    source = ProspectSourceFactory(
                        property=property,
                        name='{} source'.format('test' if is_same_source_name else property.name))
                    SourceMatchingFactory(LH_source=source.name, ResMan_source=source.name)
                source.spends = spends
                source.save()

                lead_ids = []
                for j in range(leases_count + tours_count if leases_count and tours_count else leads_count):
                    status = Lead.LEAD_ACTIVE
                    lost_reason = None
                    if is_spam_or_test:
                        status = Lead.LEAD_LOST
                        lost_reason = ProspectLostReasonFactory(
                            name='Spam',
                            property=property,
                        )

                    if is_test_lead:
                        status = Lead.LEAD_TEST

                    lead = LeadFactory(
                        owner=None,
                        property=property,
                        status=status,
                        source=source,
                        lost_reason=lost_reason
                    )
                    lead_ids.append(lead.id)

                    lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                    lead.closed_status_date = None
                    lead.tour_completed_date = None
                    lead.save()

                leases = Lead.objects.filter(id__in=lead_ids).all()[:leases_count]
                for lead in leases:
                    lead.status = Lead.LEAD_CLOSED
                    lead.closed_status_date = datetime.now(tz=TZ).replace(hour=15)
                    lead.save()

                tours = Lead.objects.filter(id__in=lead_ids).all()[leases_count:leases_count + tours_count]
                for lead in tours:
                    lead.tour_completed_date = datetime.now(tz=TZ).replace(hour=15)
                    lead.save()

                for j in range(calls_count):
                    CallFactory(property=property, date=datetime.now(tz=TZ).replace(hour=13),
                                lead=Lead.objects.filter(id__in=lead_ids).first(),
                                call_category=Call.CALL_CATEGORY_PROSPECT, source=source.name)

    @patch('backend.api.models.Report.objects.values_list')
    def test_no_empty_sources(self, mock_values_list):
        self._generate_mock_data([self.property_1, self.property_2])
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects)

        self.assertEqual(len(lead_source_report), 0)

    @patch('backend.api.models.Report.objects.values_list')
    def test_leads(self, mock_values_list):
        self._generate_mock_data([self.property_1, self.property_2], leads_count=10)
        self._generate_mock_data([self.property_1, self.property_2], leads_count=13, is_test_lead=True)
        self._generate_mock_data([self.property_1, self.property_2], leads_count=13, is_spam_or_test=True)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects)

        self.assertEqual(len(lead_source_report), 2)
        self.assertEqual(lead_source_report[0]['leads'], 10)
        self.assertEqual(lead_source_report[1]['leads'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    def test_tours(self, mock_values_list):
        self._generate_mock_data([self.property_1], leads_count=10, tours_count=5)
        self._generate_mock_data([self.property_1], leads_count=13, tours_count=2, is_test_lead=True)
        self._generate_mock_data([self.property_1], leads_count=13, tours_count=2, is_spam_or_test=True)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects)

        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['leads'], 10)
        self.assertEqual(lead_source_report[0]['tours'], 5)
        self.assertEqual(lead_source_report[0]['tour_completed_rate'], 50)

    @patch('backend.api.models.Report.objects.values_list')
    def test_leases(self, mock_values_list):
        self._generate_mock_data([self.property_1], leads_count=10, leases_count=5)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects)

        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['leads'], 10)
        self.assertEqual(lead_source_report[0]['leases'], 5)
        self.assertEqual(lead_source_report[0]['leased_rate'], 50)

    @patch('backend.api.models.Report.objects.values_list')
    def test_calls(self, mock_values_list):
        self._generate_mock_data([self.property_1], leads_count=10, calls_count=10)
        self._generate_mock_data([self.property_2], leads_count=10, calls_count=13,
                                 is_same_source_name=True, is_test_lead=True)
        self._generate_mock_data([self.property_2], leads_count=10, calls_count=13, is_spam_or_test=True)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects)

        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['calls'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    def test_show_paid_only(self, mock_values_list):
        self._generate_mock_data([self.property_1], leads_count=10)
        self._generate_mock_data([self.property_1], leads_count=13, is_test_lead=True)
        self._generate_mock_data([self.property_1], leads_count=13, is_spam_or_test=True)

        spends = [{'date': datetime(year=datetime.now(tz=TZ).year,
                                    month=datetime.now(tz=TZ).month, day=1).strftime('%Y-%m-%d'), 'price': 500}]
        self._generate_mock_data([self.property_2], leads_count=10, spends=spends)
        self._generate_mock_data([self.property_2], leads_count=7, spends=spends, is_test_lead=True)
        self._generate_mock_data([self.property_2], leads_count=7, spends=spends, is_spam_or_test=True)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects, show_paid_only=True)

        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['property'], self.property_2.id)
        self.assertEqual(lead_source_report[0]['spends'], spends)

    @patch('backend.api.models.Report.objects.values_list')
    def test_aggregate_mode(self, mock_values_list):
        spends = [{'date': datetime(year=datetime.now(tz=TZ).year,
                                    month=datetime.now(tz=TZ).month, day=1).strftime('%Y-%m-%d'), 'price': 500}]
        self._generate_mock_data([self.property_1, self.property_2], leads_count=10, spends=spends,
                                 is_same_source_name=True)
        self._generate_mock_data([self.property_1, self.property_2], leads_count=7, spends=spends,
                                 is_same_source_name=True, is_test_lead=True)
        self._generate_mock_data([self.property_1, self.property_2], leads_count=7, spends=spends,
                                 is_same_source_name=True, is_spam_or_test=True)
        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())

        mock_values_list.return_value = [lead_source_data]
        lead_source_report = get_lead_source_data(Report.objects, aggregate_mode=True)

        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['leads'], 20)
        self.assertEqual(lead_source_report[0]['spends'][0]['price'], 1000)

    @patch('backend.api.models.Report.objects.values_list')
    def test_performance_mode(self, mock_values_list):
        lead_created_date = datetime.now(tz=TZ).replace(hour=13) - timedelta(days=2)
        self._generate_mock_data([self.property_1], leads_count=20, leases_count=10, tours_count=10,
                                 lead_created_date=lead_created_date)

        lead_source_data = calculate_lead_source_data((self.start_date, self.end_date), Property.objects.all())
        mock_values_list.return_value = [lead_source_data]

        lead_source_report = get_lead_source_data(Report.objects, is_performance=True)
        self.assertEqual(len(lead_source_report), 0)

        lead_source_report = get_lead_source_data(Report.objects, is_performance=False)
        self.assertEqual(len(lead_source_report), 1)
        self.assertEqual(lead_source_report[0]['leases'], 10)
        self.assertEqual(lead_source_report[0]['tours'], 10)
