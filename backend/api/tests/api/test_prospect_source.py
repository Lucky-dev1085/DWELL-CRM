from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from backend.api.models import ProspectSource, PhoneNumber
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import ProspectSourceFactory, UserFactory, PropertyFactory, PhoneNumberFactory


class ProspectSourceTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ProspectSourceTests, self).setUp()

    def test_list_property(self):
        """
        Ensure we can list prospect source.
        """
        ProspectSourceFactory(property=self.property, name='test source')
        endpoint = reverse('prospect_sources-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProspectSource.objects.count(), 1)

    def test_put_property(self):
        """
        Ensure we can update prospect source.
        """
        source = ProspectSourceFactory(property=self.property, name='test source')
        endpoint = reverse('prospect_sources-detail', args=[source.pk])
        response = self.client.put(endpoint, dict(name='test2'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(name='test2'), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        source = ProspectSource.objects.first()
        self.assertEqual(source.name, 'test2')

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_available_sources_for_tracking(self, mock_purchase_twilio_number):
        """
        Ensure we can source are filtered according to property and have no phone number.
        """
        mock_purchase_twilio_number.return_value = None
        source = ProspectSourceFactory(property=self.property, name='test source')
        self.assertEqual(ProspectSource.objects.count(), 1)

        endpoint = reverse('prospect_sources-available-sources-for-tracking')
        response = self.client.get(endpoint, {'property': self.property.pk})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        super_user = UserFactory(password='password', is_superuser=True, is_staff=True)
        self.client.force_authenticate(user=super_user)

        response = self.client.get(endpoint, {'property': self.property.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        property1 = PropertyFactory(client=self.m_client, status='ACTIVE')
        source = ProspectSourceFactory(property=property1, name='test source')
        PhoneNumberFactory(property=property1, type=PhoneNumber.TYPE_TRACKING, source=source)
        response = self.client.get(endpoint, {'property': self.property.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        response = self.client.get(endpoint, {'property': property1.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
