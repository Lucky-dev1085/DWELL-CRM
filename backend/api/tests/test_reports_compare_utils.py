import pytz

from mock import patch
from django.utils import timezone
from datetime import datetime, timedelta

from backend.api.factories import PropertyFactory, LeadFactory, EmailMessageFactory, ProspectSourceFactory, \
    ProspectLostReasonFactory
from backend.api.models import Property, Lead, Report
from backend.api.tasks.reports.get_reports_data import generate_overview_reports
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports import get_company_wide_averages
from backend.api.views.reports.report_utils import simple_divider, get_engagement_data

from freezegun import freeze_time

TZ = pytz.timezone('America/Phoenix')


class CompareUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(CompareUtilsTests, self).setUp()

    @freeze_time(TZ.localize(datetime(2020, 1, 1, 0, 0)))
    @patch('backend.api.tasks.reports.get_reports_data.get_notice_to_vacate')
    @patch('backend.api.tasks.reports.get_reports_data.get_expected_move_in')
    def test_get_company_wide_averages_overview(self, mock_expected_move_in, mock_get_notice_to_vacate):

        mock_get_notice_to_vacate.return_value = 0
        mock_expected_move_in.return_value = 0

        now = timezone.now()

        PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
        PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)

        response_time = 0
        leads = []
        for property in Property.objects.filter(is_released=True):
            for j in range(10):
                lead = LeadFactory(owner=None, property=property, emails=[])
                lead.email = '{}{}@test.com'.format(property.name, j)
                if lead.status == Lead.LEAD_CLOSED:
                    lead.closed_status_date = lead.created + timedelta(days=5)
                lead.save()
                hours = 1
                if 2 <= j <= 4:
                    hours = 12
                if 5 <= j <= 7:
                    hours = 36
                if 8 <= j <= 9:
                    hours = 72
                response_time += hours
                EmailMessageFactory(lead=lead, receiver_email=lead.email, receiver_name=lead.first_name,
                                    date=lead.created + timedelta(hours=hours), property=property)
                leads.append(lead.id)

        # overview reports
        leads = Lead.objects.filter(id__in=leads)
        filter_date = datetime.today().date()
        generate_overview_reports(filter_date, properties=Property.objects.filter(is_released=True))

        start = TZ.localize(datetime.combine(filter_date, datetime.min.time())).astimezone(tz=pytz.UTC)
        end = TZ.localize(datetime.combine(filter_date, datetime.max.time())).astimezone(tz=pytz.UTC)
        for property in Property.objects.filter(is_released=True):
            engagement_report_data = get_engagement_data((start, end), [property])
            Report.objects.update_or_create(
                property=property, date=filter_date,
                defaults=dict(
                    lead_response_time_business=engagement_report_data['lead_response_time_business'],
                    lead_response_time_non_business=engagement_report_data['lead_response_time_non_business'],
                    sign_lease_time=engagement_report_data['sign_lease_time'],
                    followups_number=engagement_report_data['followups_number'],
                    followups_2_hours=engagement_report_data['followups_2_hours'],
                    followups_24_hours=engagement_report_data['followups_24_hours'],
                    followups_48_hours=engagement_report_data['followups_48_hours'],
                    followups_more_48_hours=engagement_report_data['followups_more_48_hours'])
            )

        result = get_company_wide_averages((datetime.combine(now, datetime.min.time()), now + timedelta(days=1)),
                                           'overview_reports')
        engagement_averages = result['engagement_report']
        # According to new mechanism update on 7th July, we started to count the leads on business hours
        # if it's followed up after next opening time even though it's created in non-business hours
        self.assertEqual(engagement_averages['average_response_time_business'], 1620.0)
        self.assertEqual(engagement_averages['average_response_time_non_business'],
                         round(response_time * 60 / leads.count(), 1))
        self.assertEqual(engagement_averages['average_sign_lease_time'], 5.0)
        self.assertEqual(engagement_averages['average_followups_number'], 1.0)
        self.assertEqual(engagement_averages['followups_2_hours'], [0, 20.0])
        self.assertEqual(engagement_averages['followups_24_hours'], [37.5, 30.0])
        self.assertEqual(engagement_averages['followups_48_hours'], [37.5, 30.0])
        self.assertEqual(engagement_averages['followups_more_48_hours'], [25.0, 20.0])

        activities_averages = result['activity_report']
        activities = leads.count() * 3 + leads.count() + leads.count() * 2
        self.assertEqual(activities_averages['notes'], round(leads.count() * 3 / 3, 2))
        self.assertEqual(activities_averages['emails'], round(leads.count() / 3, 2))
        self.assertEqual(activities_averages['activities'], round(activities / 3, 2))
        self.assertEqual(activities_averages['tasks'], round(leads.count() * 2 / 3, 2))
        self.assertEqual(activities_averages['calls'], 0)

        lead_to_lease_averages = result['lead_to_lease_report']
        all_leads = round(leads.count() / 3, 2)
        leases = round(leads.filter(
            closed_status_date__lte=now + timedelta(days=1),
            closed_status_date__gte=datetime.combine(now, datetime.min.time())).count() / 3, 2)
        tours = round(leads.filter(
            tour_completed_date__lte=now + timedelta(days=1),
            tour_completed_date__gte=datetime.combine(now, datetime.min.time())).count() / 3, 2)
        self.assertEqual(lead_to_lease_averages['leads'], all_leads)
        self.assertEqual(lead_to_lease_averages['leases'], leases)
        self.assertEqual(lead_to_lease_averages['tours'], tours)
        self.assertEqual(lead_to_lease_averages['leased_rate'], simple_divider(
            leads.filter(
                closed_status_date__lte=now + timedelta(days=1),
                closed_status_date__gte=datetime.combine(now, datetime.min.time())).count() / 3 * 100,
            leads.count() / 3))
        self.assertEqual(lead_to_lease_averages['lead_to_tour'], simple_divider(
            leads.filter(
                tour_completed_date__lte=now + timedelta(days=1),
                tour_completed_date__gte=datetime.combine(now, datetime.min.time())).count() / 3 * 100,
            leads.count() / 3))
        self.assertEqual(lead_to_lease_averages['tour_to_lease'], simple_divider(
            leads.filter(
                closed_status_date__lte=now + timedelta(days=1),
                closed_status_date__gte=datetime.combine(now, datetime.min.time())).count() / 3 * 100,
            leads.filter(
                tour_completed_date__lte=now + timedelta(days=1),
                tour_completed_date__gte=datetime.combine(now, datetime.min.time())).count() / 3))

    @freeze_time(TZ.localize(datetime(2020, 1, 1, 0, 0)))
    def test_get_company_wide_averages_marketing(self):
        now = timezone.now()
        property1 = PropertyFactory(client=self.m_client, status='ACTIVE', resman_account_id='1000', is_released=True)
        source1 = ProspectSourceFactory(property=property1, name='test source')
        source1.spends = [{'date': datetime(year=2020, month=2, day=1).strftime('%Y-%m-%d'), 'price': 500}]
        source1.save()

        property2 = PropertyFactory(client=self.m_client, status='ACTIVE', resman_account_id='1001', is_released=True)
        source2 = ProspectSourceFactory(property=property2, name='test source')

        lost_reason_1 = ProspectLostReasonFactory(property=property1, name='Availability')
        lost_reason_2 = ProspectLostReasonFactory(property=property1, name='Pricing')
        lost_reason_3 = ProspectLostReasonFactory(property=property2, name='Pricing')
        lost_reason_4 = ProspectLostReasonFactory(property=property2, name='Inactive')
        for i in range(10):
            LeadFactory(owner=None, property=property1, source=source1, status=Lead.LEAD_LOST,
                        lost_reason=lost_reason_1 if (i % 2) == 0 else lost_reason_2)
            LeadFactory(owner=None, property=property2, source=source2, status=Lead.LEAD_LOST,
                        lost_reason=lost_reason_3 if (i % 2) == 0 else lost_reason_4)

        generate_overview_reports(datetime.today().date(), properties=Property.objects.filter(is_released=True))
        result = get_company_wide_averages((datetime(year=2020, month=1, day=1), now + timedelta(days=1)),
                                           'marketing_reports')

        leads = round(Lead.objects.count() / 3, 2)
        leases = round(Lead.objects.filter(
            closed_status_date__lte=now + timedelta(days=1),
            closed_status_date__gte=datetime(year=2020, month=1, day=1)).count() / 3, 2)
        tours = round(Lead.objects.filter(
            tour_completed_date__lte=now + timedelta(days=1),
            tour_completed_date__gte=datetime(year=2020, month=1, day=1)).count() / 3, 2)
        self.assertEqual(result['lead_source_report'][0]['leads'], leads)
        self.assertEqual(result['lead_source_report'][0]['leases'], leases)
        self.assertEqual(result['lead_source_report'][0]['tours'], tours)
        self.assertEqual(result['lead_lost_report']['lost_leads'],
                         round(Lead.objects.filter(
                             status=Lead.LEAD_LOST, lost_status_date__lte=now + timedelta(days=1),
                             lost_status_date__gte=datetime(year=2020, month=1, day=1)).count() / 3, 2))
