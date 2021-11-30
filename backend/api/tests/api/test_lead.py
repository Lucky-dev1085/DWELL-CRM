from datetime import timedelta, datetime

from unittest.mock import patch
from collections import namedtuple

from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from backend.api.models import Lead, LeadsFilter, LeadsFilterItem, User, PhoneNumber, Task
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import LeadFactory, UserFactory, ProspectLostReasonFactory, CallFactory, PhoneNumberFactory,\
    TaskFactory


class LeadTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LeadTests, self).setUp()

    def test_create_lead(self):
        """
        Ensure we can create a new lead object.
        """
        endpoint = reverse('lead-list')

        data = dict(property=self.property.pk, first_name='test1', last_name='test1')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)
        lead = Lead.objects.first()
        self.assertEqual(lead.first_name, 'test1')
        self.assertEqual(lead.last_name, 'test1')

        # duplicate check
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(int(response.data.get('id')[0]), lead.pk)
        self.assertEqual(response.data.get('message')[0], 'It looks like a lead with name test1 test1 already exists.')

    def test_list_lead(self):
        """
        Ensure we can list assign lead objects.
        """
        LeadFactory(property=self.property)
        LeadFactory(property=self.property)
        endpoint = reverse('lead-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Lead.objects.count(), 2)

    def test_put_lead(self):
        """
        Ensure we can update lead object.
        """
        lead = LeadFactory(property=self.property, stage='INQUIRY')
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.put(endpoint, dict(stage='TOUR_SET'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.first().stage, 'INQUIRY')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(stage='TOUR_SET'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.first()
        self.assertEqual(lead.stage, 'TOUR_SET')

    def test_delete_lead(self):
        """
        Ensure we can delete lead object.
        """
        lead = LeadFactory(property=self.property)
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Lead.objects.count(), 0)

    def test_bulk_update_lead(self):
        owner1 = UserFactory(role=User.LL_ADMIN)
        owner2 = UserFactory(role=User.LL_ADMIN)

        lost_reason = ProspectLostReasonFactory(name='Cancelled')

        lead1 = LeadFactory(property=self.property, stage='INQUIRY', status='ACTIVE', owner=owner1)
        lead2 = LeadFactory(property=self.property, stage='TOUR_SET', status='ACTIVE', owner=owner1)
        endpoint = reverse('lead-bulk-update')
        response = self.client.put(endpoint,
                                   dict(ids=[lead1.pk, lead2.pk], stage='APPLICATION_COMPLETE'), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}

        response = self.client.put(endpoint, dict(ids=[lead1.pk, lead2.pk], stage='invalid'), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.put(endpoint, dict(ids=[lead1.pk, lead2.pk], stage='APPLICATION_COMPLETE'
                                                  , compare_field='stage'), format='json', **header)

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(Lead.objects.filter(stage='APPLICATION_COMPLETE').count(), 2)

        response = self.client.put(endpoint, dict(ids=[lead1.pk, lead2.pk], status='LOST',
                                                  lost_reason=None, compare_field='status'), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.put(endpoint, dict(ids=[lead1.pk, lead2.pk], status='LOST', lost_reason=lost_reason.pk,
                                                  compare_field='status'), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(Lead.objects.filter(lost_reason=lost_reason).count(), 2)

        response = self.client.put(endpoint, dict(ids=[lead1.pk, lead2.pk], owner=owner2.pk, compare_field='owner'),
                                   format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(Lead.objects.filter(owner=owner2).count(), 2)

    def test_bulk_delete_lead(self):
        lead1 = LeadFactory(property=self.property, stage='INQUIRY', email=[], tasks=[], notes=[])
        lead2 = LeadFactory(property=self.property, stage='TOUR_SET', email=[], tasks=[], notes=[])
        endpoint = reverse('lead-bulk-delete')
        response = self.client.delete(endpoint, dict(ids=[lead1.pk, lead2.pk]), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.count(), 2)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, dict(ids=[lead1.pk, lead2.pk]), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Lead.objects.count(), 0)

    def test_list_lead_names(self):
        LeadFactory(property=self.property)
        LeadFactory(property=self.property)
        endpoint = reverse('lead-names')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filtered_leads_count(self):
        lead1 = LeadFactory(property=self.property, first_name='test1', last_name='test1', owner=None, email=None,
                            emails=[], tasks=[], notes=[])
        lead2 = LeadFactory(property=self.property, first_name='test2', last_name='test2', owner=None, email=None,
                            emails=[], tasks=[], notes=[])
        data = dict(
            property=self.property.pk,
            filter_items=[dict(compare_field='first_name',
                               compare_operator=LeadsFilterItem.OPERATOR_STARTS_WITH,
                               compare_value=['test'])],
            filter_type=LeadsFilter.TYPE_ALL,
            is_active_only=False
        )
        endpoint = reverse('lead-filtered-leads-count')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 0)

        lead1.email = 'test1@gmail.com'
        lead1.save()
        lead2.email = 'test2@gmail.com'
        lead2.save()
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

        data = dict(property=self.property.pk, filter_items=[dict(compare_field='first_name',
                                                                  compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                                  compare_value=['test1']),
                                                             dict(compare_field='last_name',
                                                                  compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                                  compare_value=['test2'])],
                    filter_type=LeadsFilter.TYPE_ANY, is_active_only=False)
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

        data = dict(property=self.property.pk, filter_items=[dict(compare_field='first_name',
                                                                  compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                                  compare_value=['test1']),
                                                             dict(compare_field='last_name',
                                                                  compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                                  compare_value=['test2'])],
                    filter_type=LeadsFilter.TYPE_ANY, check_lead_owner=True)
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 0)

    def test_put_lead_mobile_number(self):
        """
        Ensure we can update lead object mobile number and last_activity_date.
        """
        lead = LeadFactory(property=self.property, stage='INQUIRY')
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.put(endpoint, dict(stage='TOUR_SET'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.first().stage, 'INQUIRY')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(stage='TOUR_SET'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.first()
        last_activity_date = lead.last_activity_date
        self.assertEqual(lead.stage, 'TOUR_SET')

        call = CallFactory(property=self.property)
        response = self.client.patch(endpoint, dict(phone_number=call.prospect_phone_number), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.first()
        self.assertTrue(lead.last_activity_date)
        self.assertNotEqual(lead.last_activity_date, last_activity_date)
        last_activity_date1 = lead.last_activity_date

        response = self.client.patch(endpoint, dict(phone_number='123456789'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.first()
        self.assertTrue(lead.last_activity_date)
        self.assertEqual(lead.last_activity_date, last_activity_date1)

    @patch('backend.api.serializer.sms.send_twilio_message')
    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_lead_sms(self, mock_purchase_twilio_number, mock_send_twilio_message):
        lead1 = LeadFactory(property=self.property, stage='INQUIRY')
        LeadFactory(property=self.property, stage='INQUIRY', phone_number=None)
        endpoint = reverse('lead-sms-contacts')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        self.assertFalse(response.data[0].get('last_message'))

        twilio_sms = dict({'sid': 'testsid', 'date_created': timezone.now()})
        TwilioObject = namedtuple('TwilioObject', twilio_sms.keys())
        twilio_sms = TwilioObject(**twilio_sms)
        mock_purchase_twilio_number.return_value = None
        PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_SMS)
        endpoint = reverse('lead_sms-list', kwargs={'lead_pk': lead1.pk})
        mock_send_twilio_message.return_value = twilio_sms
        data = dict(lead=lead1.pk, message='Test', is_team_message=True)
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        endpoint = reverse('lead-sms-contacts')
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response.data[0].get('last_message'))
        self.assertEqual(response.data[0].get('id'), lead1.pk)

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_lead_can_text_flag(self, mock_purchase_twilio_number):
        mock_purchase_twilio_number.return_value = None
        lead = LeadFactory(property=self.property, stage='INQUIRY')
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # todo should be enabled when we release sms feature
        # self.assertFalse(response.data['lead_can_text'])

        PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_SMS)
        endpoint = reverse('lead-detail', args=[lead.pk])
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # todo should be enabled when we release sms feature
        # self.assertTrue(response.data['lead_can_text'])

    def test_tour_completed_stage_update(self):
        """
        Ensure tour completed stage change updates the tour completed date to current time.
        """
        lead = LeadFactory(property=self.property, stage='INQUIRY')
        endpoint = reverse('lead-detail', args=[lead.pk])
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.patch(endpoint, dict(stage=Lead.STAGE_TOUR_COMPLETED), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.get(pk=lead.pk)
        self.assertEqual(lead.stage, 'TOUR_COMPLETED')
        self.assertTrue(lead.tour_completed_date > timezone.now() - timedelta(seconds=20))

    def test_delete_stage_should_delete_opened_tasks(self):
        """
        Ensure deleted status delete opened tasks
        """
        lead = LeadFactory(property=self.property, status='ACTIVE')
        TaskFactory(property=self.property, type=Task.TYPE_SELF_GUIDED_TOUR, status='OPEN',
                    tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=lead)

        endpoint = reverse('lead-detail', args=[lead.pk])
        header = {'HTTP_X_NAME': 'test1'}

        response = self.client.patch(endpoint, dict(status=Lead.LEAD_DELETED), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.get(pk=lead.pk)
        self.assertEqual(lead.status, 'DELETED')
        self.assertEqual(lead.tasks.exclude(status='COMPLETED').count(), 0)

    def test_delete_stage_should_cancel_tours_and_prospect_from_smart_rent(self):
        """
        Ensure deleted status change cancels tour and deletes prospect.
        """
        lead = LeadFactory(property=self.property, status='ACTIVE', smart_rent_id=1000)
        TaskFactory(property=self.property, type=Task.TYPE_SELF_GUIDED_TOUR, status='OPEN',
                    tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=lead, smart_rent_id=1000)

        endpoint = reverse('lead-detail', args=[lead.pk])
        header = {'HTTP_X_NAME': 'test1'}

        with patch('backend.api.serializer.lead.delete_prospect.delay') as mock_delete_prospect:
            response = self.client.patch(endpoint, dict(status=Lead.LEAD_DELETED), **header)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            lead = Lead.objects.get(pk=lead.pk)
            self.assertEqual(lead.status, 'DELETED')
            mock_delete_prospect.assert_called_once_with(lead.pk)

    def test_sync_move_in_date_update_to_smart_rent(self):
        """
        Ensure move in date change should sync to smart rent
        """
        lead = LeadFactory(property=self.property, status='ACTIVE', smart_rent_id=1000,
                           move_in_date=datetime(2021, 5, 12).date())
        endpoint = reverse('lead-detail', args=[lead.pk])
        header = {'HTTP_X_NAME': 'test1'}

        with patch('backend.api.serializer.lead.update_prospect.delay'):
            response = self.client.patch(endpoint, dict(move_in_date='2021-05-13'), **header)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            lead = Lead.objects.get(pk=lead.pk)
            self.assertEqual(lead.move_in_date, datetime(2021, 5, 13).date())
            # todo should cover connection.on_commit in mock patch
            # mock_update_prospect.assert_called_once_with(lead.pk)
