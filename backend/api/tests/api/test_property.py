import random

from json import loads
from unittest.mock import patch
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from backend.api.models import Property, EmailLabel, PhoneNumber, ScoredCall, CallScoringQuestion
from backend.api.tests import BaseTestCase, CallScoringBaseTestBase
from backend.api.factories import PropertyFactory, ClientFactory, ProspectSourceFactory, PhoneNumberFactory,\
    UserFactory


class PropertyTests(BaseTestCase):
    def setUp(self):
        super(PropertyTests, self).setUp()
        self.m_client = ClientFactory(status='ACTIVE', creator=self.user)

    def test_create_property(self):
        """
        Ensure we can create a new site object.
        """
        endpoint = reverse('property-list')
        data = dict(name='test', domain='http://test.com', client_id=self.m_client.pk)
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Property.objects.count(), 1)
        self.assertEqual(Property.objects.get().name, 'test')

    def test_list_property(self):
        """
        Ensure we can create a new site object.
        """
        PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        endpoint = reverse('property-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Property.objects.count(), 2)

    def test_put_property(self):
        """
        Ensure we can create a new property object.
        """
        site = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        self.user.properties.add(site)
        endpoint = reverse('property-detail', args=[site.pk])
        response = self.client.put(endpoint, dict(name='test2', domain='http://test2.com', client_id=self.m_client.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        site1 = Property.objects.first()
        self.assertEqual(site1.name, 'test2')
        self.assertEqual(site1.domain, 'http://test2.com')

    def test_delete_property(self):
        """
        Ensure we can create a new property object.
        """
        site = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        self.user.properties.add(site)
        endpoint = reverse('property-detail', args=[site.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Property.objects.count(), 0)

    def test_list_property_limit(self):
        """
        Ensure we can create a new property object.
        """
        PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        endpoint = reverse('property-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Property.objects.count(), 2)

    def test_list_property_access_by_ll_admin(self):
        site1 = PropertyFactory(client=self.m_client, is_released=True)
        PropertyFactory(client=self.m_client, is_released=True)

        self.user.properties.add(site1)
        endpoint = reverse('property-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

    def test_should_allow_only_list_action(self):
        site1 = PropertyFactory(creator=self.user, client=self.m_client)

        self.client.force_authenticate(user=self.g_admin)

        # list
        endpoint = reverse('property-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Property.objects.count(), 1)

        # create
        data = dict(name='test', domain='http://test.com', client_id=self.m_client.pk)
        endpoint = reverse('property-list')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Property.objects.count(), 1)

        # delete
        endpoint = reverse('property-detail', args=[site1.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Property.objects.count(), 1)

        # update
        endpoint = reverse('property-detail', args=[site1.pk])
        response = self.client.put(endpoint, dict(name='test2', domain='http://test2.com', client_id=self.m_client.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        site2 = Property.objects.first()
        self.assertEqual(site2.name, site1.name)
        self.assertEqual(site2.domain, site1.domain)

    def test_update_nylas_sync_settings(self):
        site1 = PropertyFactory(creator=self.user, client=self.m_client,
                                nylas_sync_option=Property.NYLAS_SYNC_OPTION_ALL,
                                nylas_status=Property.NYLAS_STATUS_CONNECTED)
        label = EmailLabel.objects.create(name='test', external_id='test', property=site1)
        self.user.properties.add(site1)
        self.property = site1
        endpoint = reverse('property-update-nylas-sync-settings')
        header = {'HTTP_X_NAME': site1.name}
        response = self.client.put(endpoint, dict(nylas_sync_option=Property.NYLAS_SYNC_OPTION_LABELED,
                                                  nylas_status=Property.NYLAS_STATUS_DISCONNECTED,
                                                  nylas_selected_labels=[label.pk]), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('nylas_sync_option'), Property.NYLAS_SYNC_OPTION_LABELED)
        self.assertEqual(response.data.get('nylas_status'), Property.NYLAS_STATUS_DISCONNECTED)

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_filtered_sms_property(self, mock_purchase_twilio_number):
        mock_purchase_twilio_number.return_value = None
        super_user = UserFactory(password='password', is_superuser=True, is_staff=True)
        property1 = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        property2 = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)
        source1 = ProspectSourceFactory(property=property1, name='test source')
        self.assertEqual(Property.objects.count(), 2)

        endpoint = reverse('property-filtered-sms-property')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=super_user)

        PhoneNumberFactory(property=property1, type=PhoneNumber.TYPE_TRACKING, source=source1)

        response = self.client.get(endpoint, {'type': PhoneNumber.TYPE_TRACKING})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        response = self.client.get(endpoint, {'type': PhoneNumber.TYPE_SMS})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        PhoneNumberFactory(property=property1, type=PhoneNumber.TYPE_SMS)
        response = self.client.get(endpoint, {'type': PhoneNumber.TYPE_SMS})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        PhoneNumberFactory(property=property2, type=PhoneNumber.TYPE_SMS)
        response = self.client.get(endpoint, {'type': PhoneNumber.TYPE_SMS})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_property_admin_list(self):
        super_user = UserFactory(password='password', is_superuser=True, is_staff=True)
        property = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)

        endpoint = reverse('retrieve-property', args=[property.pk])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=super_user)
        endpoint = reverse('retrieve-property', args=[property.pk])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_property_admin_update(self):
        property = PropertyFactory(creator=self.user, client=self.m_client, is_released=True)

        endpoint = reverse('update-property', kwargs={'pk':property.id})
        response = self.client.post(endpoint, {'phone_number':'389478934', 'name':property.name})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(endpoint, {'phone_number':'123999999', 'name':property.name})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(Property.objects.get(pk=property.pk).phone_number, '389478934')

    def test_current_property_of_call_score(self):
        self.user.is_call_scorer = True
        self.user.save()

        endpoint = reverse('property-current-property')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'call-rescores'}

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(content['external_id'], 'call-rescores')
        self.assertEqual(content['name'], 'Call Rescores')


class CallScoringPropertyTests(CallScoringBaseTestBase):
    def test_check_call_scoring_state_for_current_property(self):
        """
        Check call scoring state for current property
        """
        self.client.force_authenticate(user=self.call_scorer)
        call = self.property.calls.filter(scored_calls=None).first()
        yes_questions = list(set(random.choices(CallScoringQuestion.objects.values_list('id', flat=True), k=3)))
        omitted_questions = list(set(random.choices(
            CallScoringQuestion.objects.exclude(pk__in=yes_questions).values_list('id', flat=True)
        )))
        scored_call = ScoredCall.objects.create(
            property=call.property, call=call, call_scorer=self.call_scorer, scored_at=timezone.now()
        )
        scored_call.questions.set(CallScoringQuestion.objects.filter(id__in=yes_questions))
        scored_call.omitted_questions.set(CallScoringQuestion.objects.filter(id__in=omitted_questions))

        endpoint = reverse('property-current-property')
        header = {'HTTP_X_NAME': self.property.external_id}
        response = self.client.get(endpoint, **header)
        content = loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['has_scored_calls_today'], True)
