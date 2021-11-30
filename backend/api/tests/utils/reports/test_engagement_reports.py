import pytz
import random

from datetime import datetime, timedelta, time
from django.utils import timezone

from freezegun import freeze_time
from mock import patch

from backend.api.factories import SMSContentFactory, LeadFactory, EmailMessageFactory, ProspectLostReasonFactory
from backend.api.models import Property, Lead, Report, Note, Activity, Holiday
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.tasks import generate_engagement_reports
from backend.api.views.reports.report_utils import get_engagement_data, calculate_overall_data, get_audition_data

TZ = pytz.timezone('America/Phoenix')


@freeze_time(TZ.localize(datetime(2020, 1, 1, 8, 10)))
class EngagementReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(EngagementReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property.shared_email = 'shared@example.com'
            self.property.save()
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_data(
            property, leads_count, followup_delay_hours=0, closed_lead_days_offset=0, followup_delay_minutes=0,
            lead_created_date=None, emails_count=1, assign_lead=True, email='', sms_count=0,
            sms_followup_delay_hours=0, is_test_lead=False, is_lost_reason_lead=False):
        """
        Generate leads and email message factories with given parameters.
        By default all the leads are created in business time.
        :param leads_count: the leads count we will populate
        :param followup_delay_hours: follow up hours offset
        :param closed_lead_days_offset: closed days offset
        :param emails_count: emails count per property
        :param sms_count: the sms messages count that will be populated
        :param sms_followup_delay_hours: specific delay hours for sms follow up
        :return:
        """
        sms_followup_delay_hours = sms_followup_delay_hours or followup_delay_hours

        with patch('requests.get'):
            for index in range(leads_count):
                status = Lead.LEAD_ACTIVE
                lost_reason = None
                if is_lost_reason_lead:
                    status = Lead.LEAD_LOST
                    lost_reason = ProspectLostReasonFactory(
                        name='Spam',
                        property=property,
                    )

                if closed_lead_days_offset:
                    status = Lead.LEAD_CLOSED

                if is_test_lead:
                    lead = LeadFactory(
                        owner=None,
                        property=property,
                        emails=[],
                        notes=[],
                        status=Lead.LEAD_TEST,
                        stage=Lead.STAGE_INQUIRY
                    )
                else:
                    lead = LeadFactory(
                        owner=None,
                        property=property,
                        emails=[],
                        notes=[],
                        status=status,
                        stage=Lead.STAGE_INQUIRY,
                        lost_reason=lost_reason
                    )

                if Lead.objects.exclude(id=lead.id).filter(property=property, email=lead.email).first():
                    lead.email = lead.email.replace('@', '{}@'.format(random.randint(0, 100)), 1)
                    lead.save()

                # By default, all the leads created in business time.
                lead.acquisition_date = lead_created_date or datetime.now(tz=TZ).replace(hour=13)
                lead.created = lead_created_date or datetime.now(tz=TZ).replace(hour=13)
                if not assign_lead:
                    lead.email = email
                    lead.acquisition_date = lead.acquisition_date.replace(minute=index)
                    lead.created = lead.created.replace(minute=index)
                lead.save()

                for j in range(emails_count):
                    EmailMessageFactory(
                        lead=lead if assign_lead else None,
                        receiver_email=lead.email,
                        receiver_name=lead.first_name,
                        sender_email=property.shared_email,
                        date=lead.created + timedelta(hours=followup_delay_hours,
                                                      minutes=followup_delay_minutes),
                        property=property
                    )

                for j in range(sms_count):
                    SMSContentFactory(
                        lead=lead if assign_lead else None,
                        sender_number=property.sms_tracking_number,
                        receiver_number=lead.phone_number,
                        date=lead.created + timedelta(hours=sms_followup_delay_hours,
                                                      minutes=followup_delay_minutes),
                        property=property
                    )

                if closed_lead_days_offset:
                    lead.closed_status_date = lead.acquisition_date + timedelta(days=closed_lead_days_offset)
                    lead.save()

    def test_followup_2_hours(self):
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=2)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=1, is_test_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=3, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=1, is_lost_reason_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=3, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # 10 active leads responded in 2 hours, 10 test leads responded in 1 hour,
        # so the avg response time should be 2.0, because we don't count test leads
        self.assertEqual(result['average_response_time_business'], 2.0 * 60)

        # 100% leads responded in 2 hours, because we don't count test leads (who responded in 3 hours)
        self.assertEqual(result['followups_2_hours'], [100.0, 0])

    def test_followup_24_hours(self):
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=24)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=23, is_test_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=25, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=23, is_lost_reason_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=25, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # All the 10 leads responded in 24 hours, so the avg response time should be 24.0
        self.assertEqual(result['average_response_time_business'], 24.0 * 60)

        # All the leads responded in 24 hours, meaning 100% leads responded in 24 hours.
        self.assertEqual(result['followups_24_hours'], [100.0, 0])

    def test_followup_48_hours(self):
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=48)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=47, is_test_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=49, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=47, is_lost_reason_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=49, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # All the 10 leads responded in 48 hours, so the avg response time should be 48.0
        self.assertEqual(result['average_response_time_business'], 48.0 * 60)

        # All the leads responded in 48 hours, meaning 100% leads responded in 48 hours.
        self.assertEqual(result['followups_48_hours'], [100.0, 0])

    def test_followup_more_48_hours(self):
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=50)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=51, is_test_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=47, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=51, is_lost_reason_lead=True)
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=47, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # All the 10 leads responded in 50 hours, so the avg response time should be 50.0
        self.assertEqual(result['average_response_time_business'], 50.0 * 60)

        # All the leads responded in 50 hours, meaning 100% leads responded after 48 hours.
        self.assertEqual(result['followups_more_48_hours'], [100.0, 0])

    def test_avg_sign_lease_time(self):
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=5)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=10)

        # Test leads
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=6,
                                 is_test_lead=True)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=11,
                                 is_test_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), [self.property])
        result = calculate_overall_data('engagement_report', [engagement_report])

        # (5 leads * 5 sign lease time + 5 leads * 10 sign lease time) / (10 total leads count) = 7.5
        self.assertEqual(result['average_sign_lease_time'], 7.5)

    def test_avg_followup_number(self):
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=5,
                                 emails_count=2)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=48, closed_lead_days_offset=1)

        # Test leads
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2, closed_lead_days_offset=5,
                                 emails_count=3, is_test_lead=True)
        engagement_report = get_engagement_data((self.start_date, self.end_date), [self.property])
        result = calculate_overall_data('engagement_report', [engagement_report])

        # The second mock data should not count as all emails sent after leased, so only first mock data should work
        # (5 leads count * 2 emails per lead) / 5 total leads = 2
        self.assertEqual(result['average_followups_number'], 2)

    def test_avg_followup_number_notes(self):
        # Lead created on 10:00
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)

        self._generate_mock_data(self.property, leads_count=5, closed_lead_days_offset=5, emails_count=0,
                                 lead_created_date=today)

        lead = Lead.objects.filter(property=self.property).first()
        note = Note.objects.create(lead=lead, is_follow_up=True, text='Test followup note')
        note.created = today + timedelta(hours=1)
        note.save()

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # One lead, one followup which is note
        self.assertEqual(result['average_followups_number'], 1)

    def test_avg_followup_number_stage(self):
        # Lead created on 10:00
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)

        self._generate_mock_data(self.property, leads_count=5, closed_lead_days_offset=5, emails_count=0,
                                 lead_created_date=today)

        lead = Lead.objects.filter(property=self.property).first()
        lead.stage = Lead.STAGE_APPLICATION_PENDING
        lead.save()

        activity = Activity.objects.filter(
            type=Activity.LEAD_UPDATED,
            lead=lead.id,
            content='Stage updated to Application pending'
        ).first()
        activity.created = lead.acquisition_date + timedelta(hours=1)
        activity.save()

        lead.stage = Lead.STAGE_APPLICATION_COMPLETE
        lead.save()

        activity = Activity.objects.filter(
            type=Activity.LEAD_UPDATED,
            lead=lead.id,
            content='Stage updated to Application complete'
        ).first()
        activity.created = lead.acquisition_date + timedelta(hours=2)
        activity.save()

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # One lead, two followups which are stage change
        self.assertEqual(result['average_followups_number'], 2)

    def test_business_time_filtering(self):
        """
        All engagement metrics will be use same filtered leads by business time, so we just need to verify this filtering
        on one metric, for this test, we will use average_response_time_business, average_non_response_time_business
        :return:
        """
        # business time
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=5)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=4, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=4, is_lost_reason_lead=True)

        # non business time (3 am should be non business time by default setting)
        lead_created_date = datetime.now(tz=TZ).replace(hour=3, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # (5 leads * (5 * 60) delay * 1 email per lead +
        # 5 leads * ((24 - 6) * 60) delay * 1 email per lead ) / 10 emails = 690
        self.assertEqual(result['average_response_time_business'], 690)

        # (5 leads * 24 hours delay * 1 email per lead) / 5 emails = 24
        self.assertEqual(result['average_response_time_non_business'], 24 * 60)

    def test_guest_emails_should_not_involved(self):
        """
        Guest card emails should be involved any computation of reports.
        :return:
        """
        # business time
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=6)

        # Set all the emails to guest card in force
        self.property.leads.first().email_messages.all().update(is_guest_card_email=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # As we have only guest card emails, there's no first followed up
        self.assertEqual(result['average_response_time_business'], 0)

    def test_before_closing_time_filtering(self):
        """
        If lead was created less than 1 hour before than property close time, we should count response time from
         next business string time (property opening time)
        :return:
        """

        # non business time (during 1 hour before closing)
        lead_created_date = datetime.now(tz=TZ).replace(hour=16, minute=40)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        followup_date = lead_created_date + timedelta(hours=24)
        open_time = TZ.localize(datetime.combine(followup_date, time(9, 0)))
        response_time_non_business = round((followup_date - open_time).total_seconds() / 60, 1)

        self.assertEqual(result['average_response_time_business'], 0)

        # (5 leads * (next workday open time - (lead created date + 24 hours delay)) * 1 email per lead) / 5 emails
        self.assertEqual(result['average_response_time_non_business'], response_time_non_business)

    def test_on_closed_days_filtering(self):
        """
        If lead was created on property closed day, we should count response time from next business string time
         (property opening time)
        :return:
        """

        # non business time (closed day)
        lead_created_date = datetime.now(tz=TZ).replace(hour=13)
        lead_created_date_business_hours = self.property.business_hours.filter(
            weekday=lead_created_date.weekday()).first()
        lead_created_date_business_hours.is_workday = False
        lead_created_date_business_hours.save()

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        followup_date = lead_created_date + timedelta(hours=24)
        open_time = TZ.localize(datetime.combine(followup_date, time(9, 0)))
        response_time_non_business = round((followup_date - open_time).total_seconds() / 60, 1)

        self.assertEqual(result['average_response_time_business'], 0)

        # (5 leads * (next workday open time - (lead created date + 24 hours delay)) * 1 email per lead) / 5 emails
        self.assertEqual(result['average_response_time_non_business'], response_time_non_business)

        # non business time (fixed holiday)
        lead_created_date_business_hours.is_workday = True
        lead_created_date_business_hours.save()

        Holiday.objects.create(date=datetime.now(tz=TZ))
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_lost_reason_lead=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        followup_date = lead_created_date + timedelta(hours=24)
        open_time = TZ.localize(datetime.combine(followup_date, time(9, 0)))
        response_time_non_business = round((followup_date - open_time).total_seconds() / 60, 1)

        self.assertEqual(result['average_response_time_business'], 0)

        # (5 leads * (next workday open time - (lead created date + 24 hours delay)) * 1 email per lead) / 5 emails
        self.assertEqual(result['average_response_time_non_business'], response_time_non_business)

        # non business time (floating holiday)
        Holiday.objects.create(name='Thanksgiving Day')
        lead_created_date = lead_created_date.replace(year=2020, month=11, day=26, hour=13)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=23,
                                 lead_created_date=lead_created_date, is_lost_reason_lead=True)

        start_date = TZ.localize(datetime.combine(lead_created_date, datetime.min.time()))
        end_date = TZ.localize(datetime.combine(lead_created_date, datetime.max.time()))
        engagement_report = get_engagement_data((start_date, end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        followup_date = lead_created_date + timedelta(hours=24)
        open_time = TZ.localize(datetime.combine(followup_date, time(9, 0)))
        response_time_non_business = round((followup_date - open_time).total_seconds() / 60, 1)

        self.assertEqual(result['average_response_time_business'], 0)

        # (5 leads * (next workday open time - (lead created date + 24 hours delay)) * 1 email per lead) / 5 emails
        self.assertEqual(result['average_response_time_non_business'], response_time_non_business)

    def test_responded_before_closing_time(self):
        """
        If lead was created less than 1 hour before than property close time and was responded to during this 1 hour,
        we should count response time like followup delay
        :return:
        """

        # non business time (during 1 hour before closing)
        lead_created_date = datetime.now(tz=TZ).replace(hour=16, minute=40)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_minutes=30,
                                 lead_created_date=lead_created_date)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 0)

        self.assertEqual(result['average_response_time_non_business'], 30.0)

    def test_responded_after_closing_time(self):
        """
        If lead was created less than 1 hour before than property close time and was responded to after this 1 hour
        and before opening on next working day, we should not count response time
        :return:
        """

        # non business time (during 1 hour before closing)
        lead_created_date = datetime.now(tz=TZ).replace(hour=16, minute=40)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=1,
                                 lead_created_date=lead_created_date)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 0)
        self.assertEqual(result['average_response_time_non_business'], 0)

    def test_responded_on_closed_days(self):
        """
        If lead was created on property closed day and responded on closed day, we should not count response time
        :return:
        """

        # non business time (closed day)
        lead_created_date = datetime.now(tz=TZ).replace(hour=13)
        lead_created_date_business_hours = self.property.business_hours.filter(
            weekday=lead_created_date.weekday()).first()
        lead_created_date_business_hours.is_workday = False
        lead_created_date_business_hours.save()

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=1,
                                 lead_created_date=lead_created_date)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 0)
        self.assertEqual(result['average_response_time_non_business'], 0)

    def test_business_time_historical_filtering(self):
        """
        If lead was created on business time and business time was changed after, lead still counts as business
        :return:
        """
        # business time
        self._generate_mock_data(self.property, leads_count=10, followup_delay_hours=5)

        # business hours
        self.assertEqual(self.property.business_hours.first().start_time, time(9, 0))
        self.assertEqual(self.property.business_hours.first().end_time, time(17, 30))

        # lead is in business hours
        self.assertTrue(self.property.business_hours.first().start_time <=
                        self.property.leads.first().acquisition_date.astimezone(tz=TZ).time() <=
                        self.property.business_hours.first().end_time)

        self.property.business_hours.update(
            start_time=timezone.now().replace(hour=0, minute=0, second=0, microsecond=0,
                                              tzinfo=pytz.timezone('America/Phoenix')),
            end_time=timezone.now().replace(hour=8, minute=0, second=0, microsecond=0,
                                            tzinfo=pytz.timezone('America/Phoenix')))

        # business hours changed
        self.assertEqual(self.property.business_hours.first().start_time, time(0, 0))
        self.assertEqual(self.property.business_hours.first().end_time, time(8, 0))

        # lead is not business hours after change
        self.assertFalse(self.property.business_hours.first().start_time <=
                         self.property.leads.first().acquisition_date.astimezone(tz=TZ).time() <=
                         self.property.business_hours.first().end_time)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # leads still count as business
        self.assertEqual(result['average_response_time_business'], 5 * 60)
        self.assertEqual(result['average_response_time_non_business'], 0)

    # def test_business_time_unassigned_lead_filtering(self):
    #     """
    #     If emails have unassigned lead, we take the most recent lead with email the same as receiver email
    #     :return:
    #     """
    #     self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=5, assign_lead=False,
    #                              email='test1@test.com')
    #
    #     lead_created_date = datetime.now(tz=TZ).replace(hour=1)
    #     self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=5,
    #                              lead_created_date=lead_created_date, assign_lead=False,
    #                              email='test2@test.com')
    #
    #     engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
    #     last_lead_business = Lead.objects.filter(property=self.property,
    #                                              email='test1@test.com').order_by('-created').first()
    #     self.assertEqual(engagement_report['lead_response_time_business'][0]['lead'], last_lead_business.id)
    #
    #     last_lead_non_business = Lead.objects.filter(property=self.property,
    #                                                  email='test2@test.com').order_by('-created').first()
    #     self.assertEqual(engagement_report['lead_response_time_non_business'][0]['lead'], last_lead_non_business.id)

    def test_followed_up_after_next_working_hours(self):
        """
        If the lead was created on non-business hours and followed up after next working hours then we should count
        it as business-hours as well.
        :return:
        """
        # Lead created on 01:00
        today = datetime.now(tz=TZ).replace(hour=1, minute=0, second=0)
        # The first follow up will be on 10:00
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=11, lead_created_date=today)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 3 * 60)
        self.assertEqual(result['average_response_time_non_business'], 11 * 60)

    def test_generate_engagement_reports(self):
        """
        Simple test for overwrite engagement report task
        :return:
        """
        # Lead created on 23:00
        today = datetime.now(tz=TZ).replace(hour=23, minute=0, second=0)

        # The first follow up will be on 10:00
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=11, lead_created_date=today)

        lead = self.property.leads.first()
        created_date = self.property.leads.first().acquisition_date.astimezone(tz=TZ).date()
        Report.objects.create(
            date=created_date,
            property=self.property,
            followups_2_hours=[0, 0],
            followups_24_hours=[0, 0],
            followups_48_hours=[0, 0],
            followups_more_48_hours=[0, 0],
        )
        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()

        self.assertDictEqual(report.lead_response_time_business[0], {'lead': lead.pk, 'type': 'Email', 'minutes': 60.0,
                                                                     'first_followup_date':
                                                                         (lead.acquisition_date + timedelta(
                                                                             hours=11)).isoformat()})
        self.assertDictEqual(report.lead_response_time_non_business[0],
                             {'lead': lead.pk, 'type': 'Email', 'minutes': 11.0 * 60,
                              'first_followup_date': (lead.acquisition_date + timedelta(hours=11)).isoformat()})

        # test for SMS follow up lead
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=0, sms_count=1,
                                 lead_created_date=today)
        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        lead = self.property.leads.last()
        self.assertDictEqual(report.lead_response_time_business[1], {'lead': lead.pk, 'type': 'SMS', 'minutes': 120.0,
                                                                     'first_followup_date':
                                                                         (lead.acquisition_date + timedelta(
                                                                             hours=12)).isoformat()})

        # test for mixed follow up lead but first follow up source is sms
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=15, emails_count=1, sms_count=1,
                                 lead_created_date=today, sms_followup_delay_hours=14)
        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        lead = self.property.leads.last()
        self.assertDictEqual(report.lead_response_time_business[2], {'lead': lead.pk, 'type': 'SMS', 'minutes': 240.0,
                                                                     'first_followup_date':
                                                                         (lead.acquisition_date + timedelta(
                                                                             hours=14)).isoformat()})

        # test for note follow up lead
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=1, sms_count=0,
                                 lead_created_date=today)
        lead = self.property.leads.last()
        note = Note.objects.create(lead=lead, is_follow_up=True, text='Hi, we followed up the lead by email.')
        note.created = today + timedelta(hours=11)
        note.save()

        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        self.assertDictEqual(report.lead_response_time_business[3], {'lead': lead.pk, 'type': 'Note', 'minutes': 60.0,
                                                                     'first_followup_date':
                                                                         (lead.acquisition_date + timedelta(
                                                                             hours=11)).isoformat()})

        # test for lead stage changes
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=100, emails_count=1, sms_count=0,
                                 lead_created_date=today)
        lead = self.property.leads.last()
        lead.stage = Lead.STAGE_TOUR_SET
        lead.save()

        activity = Activity.objects.get(lead=lead, type=Activity.LEAD_UPDATED)
        activity.created = today + timedelta(hours=2)
        activity.save()

        generate_engagement_reports(today)
        report = Report.objects.filter(date=created_date).first()
        self.assertDictEqual(report.lead_response_time_business[4], {'lead': lead.pk, 'type': 'Stage update',
                                                                     'minutes': 120.0,
                                                                     'first_followup_date':
                                                                         (lead.acquisition_date + timedelta(
                                                                             hours=2)).isoformat()})

    def test_sms_engagement_report(self):
        """
        Simple test for overwrite SMS messages engagement report task
        :return:
        """
        # Lead created on 10:00
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        # The first follow up will be on 10:00
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=3, sms_count=1, emails_count=0,
                                 lead_created_date=today, closed_lead_days_offset=2)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 3 * 60)
        self.assertEqual(result['average_followups_number'], 1)

        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=2, emails_count=1,
                                 lead_created_date=today, closed_lead_days_offset=2)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        # (2 + 3) / 2 hours * 60 = 150 minutes
        self.assertEqual(result['average_response_time_business'], 150)
        self.assertEqual(result['average_followups_number'], 1)

    def test_note_followup(self):
        """
        This test verify how the note followup will be involved in engagement reports.
        :return:
        """
        # Lead created on 10:00
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        # The lead was followed up by email on 13:00
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=3, lead_created_date=today)

        lead = Lead.objects.filter(property=self.property).first()

        # The lead was followed up by note on 11:00
        note = Note.objects.create(lead=lead, is_follow_up=True, text='Hi, we followed up the lead by email.')
        note.created = today + timedelta(hours=1)
        note.save()

        lead.status = Lead.LEAD_CLOSED
        lead.save()
        lead.closed_status_date = today + timedelta(hours=2)
        lead.save()

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], 60.0)
        # note was before lease, email after
        self.assertEqual(result['average_followups_number'], 1)

    def test_lead_stage_followup(self):
        """
        This test verify how the lead stage changes will be involved in engagement reports.
        :return:
        """
        # Lead created on 10:00
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0) - timedelta(days=1)
        # The lead was followed up by email on 13:00
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=100, lead_created_date=today)

        lead = Lead.objects.filter(property=self.property).first()

        # The lead stage changed to contact_made on 11:00
        lead.stage = Lead.STAGE_CONTACT_MADE
        lead.save()

        followup_time = lead.updated
        followup_hours = round((lead.updated - today).total_seconds() / 60, 1)

        lead.status = Lead.LEAD_CLOSED
        lead.save()
        lead.closed_status_date = followup_time + timedelta(hours=2)
        lead.save()

        engagement_report = get_engagement_data(
            (self.start_date - timedelta(days=1), self.end_date),
            Property.objects.all()
        )
        result = calculate_overall_data('engagement_report', [engagement_report])

        self.assertEqual(result['average_response_time_business'], followup_hours)
        # stage change was before lease, email after
        self.assertEqual(result['average_followups_number'], 1)

    def test_audition_data(self):
        # business time
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=5)

        # non business time (3 am should be non business time by default setting)
        lead_created_date = datetime.now(tz=TZ).replace(hour=3)
        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=24,
                                 lead_created_date=lead_created_date)

        self._generate_mock_data(self.property, leads_count=5, followup_delay_hours=2,
                                 lead_created_date=lead_created_date)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        audition_responses = get_audition_data([engagement_report], 'responses')

        # only business (lead created in business time and was responded in business time)
        lead_business = next((lead for lead in engagement_report['lead_response_time_business']
                              if lead['minutes'] == 5 * 60))
        audition_lead_business = next((lead for lead in audition_responses if lead['id'] == lead_business['lead']))
        self.assertEqual(lead_business['minutes'], audition_lead_business['response_time_business'])
        self.assertEqual(lead_business['minutes'], audition_lead_business['response_time_overall'])

        # non business and business (lead was created in non business time, but was responded in business time)
        lead_non_business = next((lead for lead in engagement_report['lead_response_time_non_business']
                                  if lead['minutes'] == 24 * 60))
        lead_non_business_in_business = next((lead for lead in engagement_report['lead_response_time_business']
                                              if lead['lead'] == lead_non_business['lead']))
        audition_lead_non_business = next((lead for lead in audition_responses
                                           if lead['id'] == lead_non_business['lead']))
        self.assertEqual(lead_non_business_in_business['minutes'], audition_lead_non_business['response_time_business'])
        self.assertEqual(lead_non_business['minutes'], audition_lead_non_business['response_time_overall'])

        # only non business (lead created in non business time and was responded in non business time)
        lead_non_business = next((lead for lead in engagement_report['lead_response_time_non_business']
                                  if lead['minutes'] == 2 * 60))
        audition_lead_non_business = next((lead for lead in audition_responses
                                           if lead['id'] == lead_non_business['lead']))
        self.assertEqual(0, audition_lead_non_business['response_time_business'])
        self.assertEqual(lead_non_business['minutes'], audition_lead_non_business['response_time_overall'])

    def test_generate_engagement_reports_test_lead(self):
        """
        Simple test for overwrite engagement report task
        :return:
        """
        # Lead created on 23:00
        today = datetime.now(tz=TZ).replace(hour=23, minute=0, second=0)

        # The first follow up will be on 10:00
        self._generate_mock_data(self.property, leads_count=1,
                                 followup_delay_hours=11, lead_created_date=today, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=1,
                                 followup_delay_hours=11, lead_created_date=today, is_lost_reason_lead=True)

        created_date = self.property.leads.first().acquisition_date.astimezone(tz=TZ).date()
        Report.objects.create(
            date=created_date,
            property=self.property,
            followups_2_hours=[0, 0],
            followups_24_hours=[0, 0],
            followups_48_hours=[0, 0],
            followups_more_48_hours=[0, 0],
        )
        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()

        self.assertEqual(report.lead_response_time_business, [])
        self.assertEqual(report.lead_response_time_non_business, [])

        # test for SMS follow up lead
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=0, sms_count=1,
                                 lead_created_date=today, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=0, sms_count=1,
                                 lead_created_date=today, is_lost_reason_lead=True)

        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        self.assertEqual(report.lead_response_time_business, [])

        # test for mixed follow up lead but first follow up source is sms
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=15, emails_count=1, sms_count=1,
                                 lead_created_date=today, sms_followup_delay_hours=14, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=15, emails_count=1, sms_count=1,
                                 lead_created_date=today, sms_followup_delay_hours=14, is_lost_reason_lead=True)

        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        self.assertEqual(report.lead_response_time_business, [])

        # test for note follow up lead
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=1, sms_count=0,
                                 lead_created_date=today, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=12, emails_count=1, sms_count=0,
                                 lead_created_date=today, is_lost_reason_lead=True)

        lead = self.property.leads.last()
        note = Note.objects.create(lead=lead, is_follow_up=True, text='Hi, we followed up the lead by email.')
        note.created = today + timedelta(hours=11)
        note.save()

        generate_engagement_reports(today + timedelta(days=1))
        report = Report.objects.filter(date=created_date).first()
        self.assertEqual(report.lead_response_time_business, [])

        # test for lead stage changes
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=100, emails_count=1, sms_count=0,
                                 lead_created_date=today, is_test_lead=True)

        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=100, emails_count=1, sms_count=0,
                                 lead_created_date=today, is_lost_reason_lead=True)
        lead = self.property.leads.last()
        lead.stage = Lead.STAGE_TOUR_SET
        lead.save()

        activity = Activity.objects.get(lead=lead, type=Activity.LEAD_UPDATED)
        activity.created = today + timedelta(hours=2)
        activity.save()

        generate_engagement_reports(today)
        report = Report.objects.filter(date=created_date).first()
        self.assertEqual(report.lead_response_time_business, [])

    def test_newly_acquired_lead_business_time(self):
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=2,
                                 emails_count=1, lead_created_date=today)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        Report.objects.create(
            property=self.property, date=today.date(),
            lead_response_time_business=engagement_report['lead_response_time_business'],
            followups_2_hours=engagement_report['followups_2_hours'],
        )
        lead = self.property.leads.first()

        self.assertDictEqual(
            engagement_report['lead_response_time_business'][0],
            {'lead': lead.id, 'first_followup_date': '2020-01-01T19:00:00+00:00', 'minutes': 120.0, 'type': 'Email'}
        )
        self.assertEqual(engagement_report['followups_2_hours'], [1, 0])

        lead.acquisition_date = today + timedelta(days=2)
        lead.save()

        note = Note.objects.create(lead=lead, is_follow_up=True, text='Test followup note')
        note.created = today + timedelta(days=2, hours=1)
        note.save()

        engagement_report = get_engagement_data((today + timedelta(days=1),
                                                 today + timedelta(days=3)), Property.objects.all())
        self.assertEqual(engagement_report['lead_response_time_business'], [])
        self.assertEqual(engagement_report['followups_2_hours'], [0, 0])

    def test_newly_acquired_lead_non_business_time(self):
        today = datetime.now(tz=TZ).replace(hour=0, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=2,
                                 emails_count=1, lead_created_date=today)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        Report.objects.create(
            property=self.property, date=today.date(),
            lead_response_time_non_business=engagement_report['lead_response_time_non_business'],
            followups_2_hours=engagement_report['followups_2_hours'],
        )
        lead = self.property.leads.first()

        self.assertDictEqual(
            engagement_report['lead_response_time_non_business'][0],
            {'lead': lead.id, 'first_followup_date': '2020-01-01T09:00:00+00:00', 'minutes': 120.0, 'type': 'Email'}
        )
        self.assertEqual(engagement_report['followups_2_hours'], [0, 1])

        lead.acquisition_date = today + timedelta(days=2)
        lead.save()

        note = Note.objects.create(lead=lead, is_follow_up=True, text='Test followup note')
        note.created = today + timedelta(days=2, hours=1)
        note.save()

        engagement_report = get_engagement_data((today + timedelta(days=1),
                                                 today + timedelta(days=3)), Property.objects.all())
        self.assertEqual(engagement_report['lead_response_time_non_business'], [])
        self.assertEqual(engagement_report['followups_2_hours'], [0, 0])

    def test_remove_reactivated_lead_from_engagement_report(self):
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1,
                                 followup_delay_hours=2, emails_count=1,
                                 sms_count=0, lead_created_date=today)
        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        report = Report.objects.create(
            property=self.property, date=today.date(),
            lead_response_time_business=engagement_report['lead_response_time_business'],
            followups_2_hours=engagement_report['followups_2_hours'],
        )
        lead = self.property.leads.first()

        self.assertEqual(report.lead_response_time_business, [
            {'lead': lead.id, 'first_followup_date': '2020-01-01T19:00:00+00:00', 'minutes': 120.0, 'type': 'Email'}])
        self.assertEqual(report.followups_2_hours, [1, 0])

        from backend.api.tasks.reports.get_reports_data import remove_reactivated_lead_from_engagement_report
        remove_reactivated_lead_from_engagement_report(lead.id)
        report = Report.objects.get(property=self.property)

        self.assertEqual(report.lead_response_time_business, [])
        self.assertEqual(report.followups_2_hours, [0, 0])

    def test_remove_reactivated_lead_with_status_closed_from_engagement_report(self):
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1,
                                 followup_delay_hours=2, emails_count=1,
                                 sms_count=0, lead_created_date=today, closed_lead_days_offset=True)
        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        report = Report.objects.create(
            property=self.property, date=today.date(),
            sign_lease_time=engagement_report['sign_lease_time'],
            followups_number=engagement_report['followups_number'],
        )
        lead = self.property.leads.first()

        self.assertEqual(report.sign_lease_time, [{'lead': lead.id, 'days': 1}])
        self.assertEqual(report.followups_number, [{'lead': lead.id, 'followups': 1}])

        from backend.api.tasks.reports.get_reports_data import remove_reactivated_lead_from_engagement_report
        remove_reactivated_lead_from_engagement_report(lead.id)
        report = Report.objects.get(property=self.property)

        self.assertEqual(report.sign_lease_time, [])
        self.assertEqual(report.followups_number, [])

    def test_newly_acquired_lead_with_status_closed(self):
        today = datetime.now(tz=TZ).replace(hour=10, minute=0, second=0)
        self._generate_mock_data(self.property, leads_count=1, followup_delay_hours=2,
                                 emails_count=1, lead_created_date=today, closed_lead_days_offset=True)

        engagement_report = get_engagement_data((self.start_date, self.end_date), Property.objects.all())
        Report.objects.create(
            property=self.property, date=today.date(),
            sign_lease_time=engagement_report['sign_lease_time'],
            followups_number=engagement_report['followups_number'],
        )
        lead = self.property.leads.first()

        self.assertEqual(engagement_report['sign_lease_time'], [{'lead': lead.id, 'days': 1}])
        self.assertEqual(engagement_report['followups_number'], [{'lead': lead.id, 'followups': 1}])

        lead.acquisition_date = today + timedelta(days=2)
        lead.save()
        note = Note.objects.create(lead=lead, is_follow_up=True, text='Test followup note')
        note.created = today + timedelta(days=2, hours=1)
        note.save()

        engagement_report = get_engagement_data((today + timedelta(days=1),
                                                 today + timedelta(days=3)), Property.objects.all())
        self.assertEqual(engagement_report['sign_lease_time'], [])
        self.assertEqual(engagement_report['followups_number'], [])
