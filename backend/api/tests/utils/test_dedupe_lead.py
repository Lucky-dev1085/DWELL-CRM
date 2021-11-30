from datetime import datetime, timedelta
from django.utils import timezone

from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.models import AssignLeadOwners, Lead
from backend.api.factories import LeadFactory, FloorPlanFactory, UnitFactory, ProspectLostReasonFactory, TaskFactory
from backend.api.utils import dedupe_lead


class DedupeLeadUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(DedupeLeadUtilsTests, self).setUp()
        self.original_lead = LeadFactory(property=self.property, status='ACTIVE')

        self.lead_details = dict(
            first_name='testo',
            last_name='user',
            email=self.original_lead.email,
            phone_number=self.original_lead.phone_number,
        )

        AssignLeadOwners.objects.create(
            property=self.property, is_enabled=True, monday=self.g_admin, tuesday=self.g_admin, wednesday=self.g_admin,
            thursday=self.g_admin, friday=self.g_admin, saturday=self.g_admin, sunday=self.g_admin
        )

    def test_scenario_1(self):
        # Update to the latest information provided by the lead when Phone and Email match
        original_lead = LeadFactory(property=self.property, status='ACTIVE', beds=1)
        plan1 = FloorPlanFactory(property=self.property, plan='A1')
        plan2 = FloorPlanFactory(property=self.property, plan='B1')

        unit1 = UnitFactory(property=self.property, floor_plan=plan1, unit=1000)
        unit2 = UnitFactory(property=self.property, floor_plan=plan1, unit=1001)

        original_lead.floor_plan.add(plan1)
        original_lead.units.add(unit1)

        lead_details = dict(
            first_name='testo',
            last_name='user',
            phone_number=original_lead.phone_number,
            email=original_lead.email,
            move_in_date=datetime(2021, 5, 20).date(),
            beds=3,
            floor_plan=[plan1, plan2],
            units=[unit1, unit2]
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())
        self.assertEqual(lead.beds, 3)
        self.assertListEqual(list(lead.floor_plan.values_list('plan', flat=True)), ['A1', 'B1'])
        self.assertListEqual(list(lead.units.values_list('unit', flat=True)), ['1000', '1001'])

    def test_scenario_2(self):
        # If there is a Match on Last name + Phone number then update all other data, including Email address
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name=original_lead.last_name,
            phone_number=original_lead.phone_number,
            email='testo@gmail.com',
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, 'testo@gmail.com')
        self.assertEqual(lead.secondary_email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_3(self):
        # If there is a match on a phone number, but no match on other data (email address, last or
        # first name), create a new lead and disassociate the matching phone number from the old lead
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name='user',
            phone_number=original_lead.phone_number,
            email='testo@gmail.com',
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertNotEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, 'testo@gmail.com')
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(Lead.objects.get(pk=original_lead.pk).phone_number, None)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_4(self):
        # If there is a match on a phone number, but no match on other data (email address, last or
        # first name), we should:
        # 1. add the different email address to the lead's account
        # 2. make the old email address the secondary (so the new email address is featured)
        # 3. accept email from both accounts, but send to the new / updated email address
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name=None,
            last_name=None,
            phone_number=original_lead.phone_number,
            email='testo@gmail.com',
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, original_lead.first_name)
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, 'testo@gmail.com')
        self.assertEqual(lead.secondary_email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_5(self):
        # If there is a match on a phone number, but no other data to match on (email address, last or
        # first name), we can assume it is the existing lead and to update the existing lead data
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name=None,
            last_name=None,
            phone_number=original_lead.phone_number,
            email=None,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, original_lead.first_name)
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_6(self):
        # If there is a match on a phone number, but no email address and no other data matches (last or first name),
        # create a new lead.
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name='user',
            phone_number=original_lead.phone_number,
            email=None,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertNotEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, None)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_7(self):
        # If there is a match on email address, but no match on other data (phone number, last or first name),
        # create a new lead and disassociate the matching email address from the old lead
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name='user',
            phone_number='1111111111',
            email=original_lead.email,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertNotEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, '1111111111')
        self.assertEqual(Lead.objects.get(pk=original_lead.pk).email, None)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_8(self):
        # If there is a match on email address, but no phone number and no other data matches (last or
        # first name), we should assume it is the existing lead and to update the existing lead data
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name='user',
            phone_number=None,
            email=original_lead.email,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_9(self):
        # If there is a Match on Last name + Phone number then update all other data, including Email address
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name=original_lead.last_name,
            phone_number='1111111111',
            email=original_lead.email,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.secondary_phone_number, '1111111111')
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_10(self):
        # If there is a Match on Last name + Phone then update all other data
        original_lead = LeadFactory(property=self.property, status='ACTIVE')
        lead_details = dict(
            first_name='testo',
            last_name=original_lead.last_name,
            phone_number=original_lead.phone_number,
            email=None,
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, original_lead.email)
        self.assertEqual(lead.phone_number, original_lead.phone_number)
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_scenario_11(self):
        # If the first / last name matches, email / phone is empty in existing lead, then we should override
        original_lead = LeadFactory(property=self.property, status='ACTIVE', email=None, phone_number=None)
        lead_details = dict(
            first_name=original_lead.first_name,
            last_name=original_lead.last_name,
            phone_number='1111111111',
            email='testo@gmail.com',
            move_in_date=datetime(2021, 5, 20).date()
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertEqual(lead.pk, original_lead.pk)
        self.assertEqual(lead.first_name, original_lead.first_name)
        self.assertEqual(lead.last_name, original_lead.last_name)
        self.assertEqual(lead.email, 'testo@gmail.com')
        self.assertEqual(lead.phone_number, '1111111111')
        self.assertEqual(lead.move_in_date, datetime(2021, 5, 20).date())

    def test_dedupe_test_lead(self):
        self.original_lead.status = 'TEST'
        self.original_lead.save()
        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertNotEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, self.original_lead.email)
        self.assertEqual(lead.phone_number, self.original_lead.phone_number)

    def test_dedupe_deleted_lead(self):
        self.original_lead.status = 'DELETED'
        self.original_lead.save()
        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertNotEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.first_name, 'testo')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.email, self.original_lead.email)
        self.assertEqual(lead.phone_number, self.original_lead.phone_number)

    def test_dedupe_lost_lead(self):
        # lost lead should be reactivated unless it's spam or test
        lost_reason = ProspectLostReasonFactory(property=self.property)
        self.original_lead.status = 'LOST'
        self.original_lead.lost_reason = lost_reason
        self.original_lead.save()

        TaskFactory(lead=self.original_lead, status='OPEN', property=self.property)

        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.tasks.exclude(status='COMPLETED').count(), 0)
        self.assertTrue((timezone.now() - lead.acquisition_date).total_seconds() < 10)

        # it should not reactivate the lead if original lead is lost as spam or test reason
        spam_lost_reason = ProspectLostReasonFactory(property=self.property, name='Spam')

        self.original_lead.lost_reason = spam_lost_reason
        self.original_lead.save()

        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.status, 'LOST')

    def test_dedupe_leased_lead(self):
        # Leased lead that has less last activity (or move in date) less than last 9 months,
        # then we should neither reactivate nor create new lead
        self.original_lead.status = 'CLOSED'
        self.original_lead.last_activity_date = timezone.now() - timedelta(days=30 * 3)
        self.original_lead.save()

        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.status, 'CLOSED')

        # Leased lead that has less last activity (or move in date) older than last 9 months,
        # then we should reactivate the lead
        self.original_lead.last_activity_date = timezone.now() - timedelta(days=30 * 10)
        self.original_lead.move_in_date = timezone.now().date() - timedelta(days=30 * 10)
        self.original_lead.save()

        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.status, 'ACTIVE')
        self.assertTrue((timezone.now() - lead.acquisition_date).total_seconds() < 10)

    def test_new_lead_contain_auto_assign_owner(self):
        lead_details = dict(
            first_name='Testo',
            last_name='User',
            email='testouser@gmail.com'
        )
        lead, _ = dedupe_lead(self.property, **lead_details)

        self.assertNotEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.owner, self.g_admin)

    def test_reset_stage_if_lead_do_not_activity_in_last_21_days(self):
        self.original_lead.stage = Lead.STAGE_CONTACT_MADE
        self.original_lead.last_activity_date = timezone.now() - timedelta(days=22)
        self.original_lead.save()
        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.stage, Lead.STAGE_INQUIRY)

    def test_keep_stage_if_lead_has_activity_in_last_21_days(self):
        self.original_lead.stage = Lead.STAGE_CONTACT_MADE
        self.original_lead.last_activity_date = timezone.now() - timedelta(days=15)
        self.original_lead.save()
        lead, _ = dedupe_lead(self.property, **self.lead_details)

        self.assertEqual(lead.pk, self.original_lead.pk)
        self.assertEqual(lead.stage, Lead.STAGE_CONTACT_MADE)
