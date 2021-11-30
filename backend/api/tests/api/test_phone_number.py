from unittest.mock import patch
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import PhoneNumber, User
from backend.api.factories import PhoneNumberFactory, ProspectSourceFactory, PropertyFactory, ClientFactory, UserFactory


class PhoneNumberTests(APITestCase):
    def setUp(self):
        self.user = UserFactory(password='password', role=User.LL_ADMIN)
        self.m_client = ClientFactory(status='ACTIVE', creator=self.user)
        self.super_user = UserFactory(password='password', is_superuser=True, is_staff=True)
        self.property = PropertyFactory(client=self.m_client, status='ACTIVE')
        self.source = ProspectSourceFactory(property=self.property, name='test source')

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_create_phone_number(self, mock_purchase_twilio_number):
        mock_purchase_twilio_number.return_value = None
        endpoint = reverse('phone_number-list')
        data = dict(property=self.property.pk, type=PhoneNumber.TYPE_TRACKING, phone_number='1234456789',
                    source=self.source.pk)
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(PhoneNumber.objects.count(), 0)

        self.client.force_authenticate(user=self.super_user)
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PhoneNumber.objects.count(), 1)

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_update_phone_number(self, mock_purchase_twilio_number):
        mock_purchase_twilio_number.return_value = None
        phone_number = PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_TRACKING, source=self.source)

        endpoint = reverse('phone_number-detail', args=[phone_number.pk])
        response = self.client.put(endpoint, dict(type=PhoneNumber.TYPE_SMS))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(PhoneNumber.objects.first().type, PhoneNumber.TYPE_TRACKING)

        self.client.force_authenticate(user=self.super_user)
        response = self.client.put(endpoint, dict(type=PhoneNumber.TYPE_SMS))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PhoneNumber.objects.first().type, PhoneNumber.TYPE_SMS)

    @patch('backend.api.views.phone_number.get_twilio_available_numbers')
    def test_twilio_available_number_list(self, mock_get_twilio_available_numbers):
        mock_get_twilio_available_numbers.return_value = []
        endpoint = reverse('phone_number-twilio-phone-number')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.super_user)
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(endpoint, {'area_code': 420})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('backend.api.models.phone_number.purchase_twilio_number')
    def test_delete_phone_number(self, mock_purchase_twilio_number):
        mock_purchase_twilio_number.return_value = None
        phone_number = PhoneNumberFactory(property=self.property, type=PhoneNumber.TYPE_TRACKING, source=self.source)
        self.assertEqual(PhoneNumber.objects.count(), 1)

        endpoint = reverse('phone_number-detail', args=[phone_number.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.super_user)
        response = self.client.delete(endpoint)
        self.assertEqual(PhoneNumber.objects.count(), 0)
