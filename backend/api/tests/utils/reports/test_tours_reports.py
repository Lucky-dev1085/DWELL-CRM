from datetime import datetime, timedelta

import pytz
from mock import patch

from backend.api.factories import PropertyFactory, LeadFactory, TaskFactory, ProspectLostReasonFactory
from backend.api.models import Property, Lead, Task, Report
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import calculate_overall_data, get_tours_data

TZ = pytz.timezone('America/Phoenix')


class ToursReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ToursReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(property, leads_count, tour_type=Task.TYPE_VIRTUAL_TOUR, closed_lead_hours_offset=0,
                            lead_created_date=None, is_test_lead=False, is_spam_or_test=False):
        """
        Generate leads and task factories with given parameters.
        :param leads_count: the leads count we will populate
        :param tour_type:
        :param closed_lead_days_offset: closed days offset
        :param lead_created_date:
        :return:
        """
        with patch('requests.get'):
            for index in range(leads_count):
                lead_status = Lead.LEAD_ACTIVE
                lost_reason = None

                if is_test_lead:
                    lead_status = Lead.LEAD_TEST
                if closed_lead_hours_offset:
                    lead_status = Lead.LEAD_CLOSED

                if is_spam_or_test:
                    lead_status = Lead.LEAD_LOST
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )

                lead = LeadFactory(
                    owner=None,
                    property=property,
                    emails=[],
                    status=lead_status,
                    tasks=[],
                    lost_reason=lost_reason
                )

                # By default, all the leads created in business time.
                lead.created = lead_created_date or datetime.now(tz=TZ).replace(hour=13)
                lead.save()

                if closed_lead_hours_offset:
                    lead.closed_status_date = lead.created + timedelta(hours=closed_lead_hours_offset)
                    lead.save()
                TaskFactory(property=property, tour_date=datetime.now(tz=TZ).replace(hour=14),
                            lead=lead, type=tour_type, status='OPEN')

    @staticmethod
    def create_report(property, date, tours_report):
        with patch('requests.get'):
            Report.objects.create(
                property=property, date=date,
                leads=tours_report['leads'],
                in_person_tours=tours_report['in_person_tours'],
                virtual_tours=tours_report['virtual_tours'],
                guided_virtual_tours=tours_report['guided_virtual_tours'],
                facetime_tours=tours_report['facetime_tours'],

                in_person_tours_leases=tours_report['in_person_tours_leases'],
                virtual_tours_leases=tours_report['virtual_tours_leases'],
                guided_virtual_tours_leases=tours_report['guided_virtual_tours_leases'],
                facetime_tours_leases=tours_report['facetime_tours_leases'],
            )

    def test_total_tours(self):
        self._generate_mock_data(self.property_1, leads_count=10)

        self._generate_mock_data(self.property_1, leads_count=17, is_test_lead=True)

        self._generate_mock_data(self.property_1, leads_count=17, is_spam_or_test=True)

        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]

        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['total_tours'], 10)

    def test_total_leases(self):
        self._generate_mock_data(self.property_1, leads_count=10, closed_lead_hours_offset=1)
        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]
        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['total_leases'], 10)

    def test_in_person(self):
        self._generate_mock_data(self.property_1, leads_count=10, closed_lead_hours_offset=1,
                                 tour_type=Task.TYPE_IN_PERSON)
        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]
        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['leases_data']['in_person']['value'], 10)
        self.assertEqual(result['leases_data']['in_person']['percent'], 100)

        self.assertEqual(result['tours_data']['in_person']['value'], 10)
        self.assertEqual(result['tours_data']['in_person']['percent'], 100)

    def test_virtual(self):
        self._generate_mock_data(self.property_1, leads_count=10, closed_lead_hours_offset=1,
                                 tour_type=Task.TYPE_VIRTUAL_TOUR)
        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]
        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['leases_data']['virtual_tour']['value'], 10)
        self.assertEqual(result['leases_data']['virtual_tour']['percent'], 100)

        self.assertEqual(result['tours_data']['virtual_tour']['value'], 10)
        self.assertEqual(result['tours_data']['virtual_tour']['percent'], 100)

    def test_guided_virtual(self):
        self._generate_mock_data(self.property_1, leads_count=10, closed_lead_hours_offset=1,
                                 tour_type=Task.TYPE_GUIDED_VIRTUAL_TOUR)
        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]
        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['leases_data']['guided_virtual_tour']['value'], 10)
        self.assertEqual(result['leases_data']['guided_virtual_tour']['percent'], 100)

        self.assertEqual(result['tours_data']['guided_virtual_tour']['value'], 10)
        self.assertEqual(result['tours_data']['guided_virtual_tour']['percent'], 100)

    def test_facetime(self):
        self._generate_mock_data(self.property_1, leads_count=10,
                                 closed_lead_hours_offset=1, tour_type=Task.TYPE_FACETIME)

        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = [item for sublist in [list(property.leads.values_list('id', flat=True))
                                                      for property in Property.objects.all()] for item in sublist]
        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=False)

        self.assertEqual(result['leases_data']['facetime']['value'], 10)
        self.assertEqual(result['leases_data']['facetime']['percent'], 100)

        self.assertEqual(result['tours_data']['facetime']['value'], 10)
        self.assertEqual(result['tours_data']['facetime']['percent'], 100)

    def test_performance_mode(self):
        lead_created_date = datetime.now(tz=TZ).replace(hour=13) - timedelta(days=2)

        self._generate_mock_data(self.property_1, leads_count=10, lead_created_date=lead_created_date)

        self._generate_mock_data(self.property_1, leads_count=11,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property_1, leads_count=11,
                                 lead_created_date=lead_created_date, is_spam_or_test=True)

        tours_report = get_tours_data((self.start_date, self.end_date), Property.objects.all())
        tours_report['leads'] = []

        self.create_report(self.property_1, self.start_date.date(), tours_report)
        result = calculate_overall_data('tours_report', Report.objects.values(), is_performance=True)

        self.assertEqual(result['total_leases'], 0)
