from datetime import datetime, timedelta

import pytz
from mock import patch

from backend.api.factories import PropertyFactory, ProspectLostReasonFactory, LeadFactory
from backend.api.models import Property, Lead
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import get_lead_lost_data, get_lead_to_lease_data

TZ = pytz.timezone('America/Phoenix')


class LeadLostReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LeadLostReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True,
                                              resman_account_id='1000')
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True,
                                              resman_account_id='1001')
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(property, inactive_count=0,
                            availability_count=0, pricing_count=0, lead_created_date=None, is_spam_or_test=False):
        """
        Generate lead factories with given parameters.
        :param inactive_count: lost leads with inactive lost reason
        :param availability_count: lost leads with availability lost reason
        :param pricing_count: lost leads with pricing lost reason
        :return:
        """
        with patch('requests.get'):
            lost_reason_1 = ProspectLostReasonFactory(property=property, name='Availability')
            lost_reason_2 = ProspectLostReasonFactory(property=property, name='Pricing')
            lost_reason_3 = ProspectLostReasonFactory(property=property, name='Inactive')

            for index in range(availability_count):
                lost_reason = None
                if is_spam_or_test:
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )

                lead = LeadFactory(
                    owner=None,
                    property=property,
                    status=Lead.LEAD_LOST,
                    lost_reason=lost_reason_1 if not lost_reason else lost_reason
                )
                lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                lead.closed_status_date = datetime.now(tz=TZ).replace(hour=15)
                lead.save()

            for index in range(pricing_count):
                lead = LeadFactory(
                    owner=None,
                    property=property,
                    status=Lead.LEAD_LOST,
                    lost_reason=lost_reason_2 if not lost_reason else lost_reason
                )
                lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                lead.closed_status_date = datetime.now(tz=TZ).replace(hour=15)
                lead.save()

            for index in range(inactive_count):
                lead = LeadFactory(
                    owner=None,
                    property=property,
                    status=Lead.LEAD_LOST,
                    lost_reason=lost_reason_3 if not lost_reason else lost_reason
                )
                lead.created = lead_created_date if lead_created_date else datetime.now(tz=TZ).replace(hour=13)
                lead.closed_status_date = datetime.now(tz=TZ).replace(hour=15)
                lead.save()

    def test_lost_leads_one_property(self):
        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5, availability_count=5)

        self._generate_mock_data(self.property_1, inactive_count=10,
                                 pricing_count=5, availability_count=5, is_spam_or_test=True)

        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())
        lead_lost_report = get_lead_lost_data([lead_to_lease_report], Property.objects.all(), is_performance=False)

        self.assertEqual(lead_lost_report['lost_leads'], 20)

    def test_lost_leads_multiple_properties(self):
        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5, availability_count=5)
        self._generate_mock_data(self.property_2, inactive_count=5, pricing_count=0, availability_count=5)

        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5,
                                 availability_count=5, is_spam_or_test=True)
        self._generate_mock_data(self.property_2, inactive_count=5, pricing_count=0,
                                 availability_count=5, is_spam_or_test=True)

        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())
        lead_lost_report = get_lead_lost_data([lead_to_lease_report], Property.objects.all(), is_performance=False)

        self.assertEqual(lead_lost_report['lost_leads'], 30)
        self.assertEqual(lead_lost_report['inactive']['value'], 15)
        self.assertEqual(lead_lost_report['pricing']['value'], 5)
        self.assertEqual(lead_lost_report['availability']['value'], 10)

    def test_drilldown_mode(self):
        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5, availability_count=5)
        self._generate_mock_data(self.property_2, inactive_count=5, pricing_count=0, availability_count=5)

        self._generate_mock_data(self.property_1, inactive_count=10,
                                 pricing_count=5, availability_count=5, is_spam_or_test=True)
        self._generate_mock_data(self.property_2, inactive_count=5,
                                 pricing_count=0, availability_count=5, is_spam_or_test=True)
        lead_to_lease_report_p1 = get_lead_to_lease_data((self.start_date, self.end_date), [self.property_1])
        lead_to_lease_report_p2 = get_lead_to_lease_data((self.start_date, self.end_date), [self.property_2])
        lead_to_lease_report = [
            {**lead_to_lease_report_p1, 'property_id': self.property_1.id},
            {**lead_to_lease_report_p2, 'property_id': self.property_2.id}
        ]
        lead_lost_report = get_lead_lost_data(lead_to_lease_report, Property.objects.all(),
                                              is_drilldown=True, is_performance=False)

        property1_data = next(item for item in lead_lost_report if item['property'] == self.property_1.id)
        property2_data = next(item for item in lead_lost_report if item['property'] == self.property_2.id)

        self.assertEqual(property1_data['lost_leads'], 20)
        self.assertEqual(property2_data['lost_leads'], 10)

        self.assertEqual(property1_data['inactive']['value'], 10)
        self.assertEqual(property2_data['inactive']['value'], 5)

        self.assertEqual(property1_data['pricing']['value'], 5)
        self.assertEqual(property2_data['pricing']['value'], 0)

        self.assertEqual(property1_data['availability']['value'], 5)
        self.assertEqual(property2_data['availability']['value'], 5)


    def test_performance_mode(self):
        lead_created_date = datetime.now(tz=TZ).replace(hour=13) - timedelta(days=2)
        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5, availability_count=5,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property_1, inactive_count=10, pricing_count=5, availability_count=5,
                                 lead_created_date=lead_created_date, is_spam_or_test=True)
        self._generate_mock_data(self.property_2, inactive_count=5, pricing_count=0, availability_count=5,
                                 lead_created_date=lead_created_date)
        self._generate_mock_data(self.property_2, inactive_count=5, pricing_count=0, availability_count=5,
                                 lead_created_date=lead_created_date, is_spam_or_test=True)
        lead_to_lease_report = get_lead_to_lease_data((self.start_date, self.end_date), Property.objects.all())
        lead_lost_report = get_lead_lost_data([lead_to_lease_report], Property.objects.all(),
                                              is_performance=True)

        self.assertEqual(lead_lost_report['lost_leads'], 0)
        self.assertEqual(lead_lost_report['inactive']['value'], 0)
        self.assertEqual(lead_lost_report['pricing']['value'], 0)
        self.assertEqual(lead_lost_report['availability']['value'], 0)
