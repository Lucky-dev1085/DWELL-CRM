from django.urls import reverse
from rest_framework import status
from backend.api.models import Roommate
from backend.api.tests import LeadLevelBaseTestCase
from backend.api.factories import RommateFactory


class RoommateTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(RoommateTests, self).setUp()

    def test_create_roommate(self):
        """
        Ensure we can create a new roommate object.
        """
        data = dict(property=self.property.pk, lead=self.lead.pk, first_name='test', last_name='test')
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_roommate-list', kwargs={'lead_pk': 9999})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Roommate.objects.count(), 0)

        endpoint = reverse('lead_roommate-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Roommate.objects.count(), 1)
        roommate = Roommate.objects.first()
        self.assertEqual(roommate.first_name, 'test')
        self.assertTrue(roommate.lead.last_activity_date)

    def test_list_roommate(self):
        """
        Ensure we can list roommate objects.
        """
        RommateFactory(property=self.property, lead=self.lead)
        RommateFactory(property=self.property, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_roommate-list', kwargs={'lead_pk': 9999})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        endpoint = reverse('lead_roommate-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Roommate.objects.count(), 2)

    def test_put_roommate(self):
        """
        Ensure we can update roommate object.
        """
        roommate = RommateFactory(property=self.property, lead=self.lead, first_name='test1')
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_roommate-detail', kwargs={'lead_pk': 9999, 'pk': roommate.pk})
        response = self.client.put(endpoint, dict(property=self.property.pk, lead=self.lead.pk, first_name='test2'),
                                   **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        roommate = Roommate.objects.first()
        self.assertEqual(roommate.first_name, 'test1')

        endpoint = reverse('lead_roommate-detail', kwargs={'lead_pk': self.lead.pk, 'pk': roommate.pk})
        response = self.client.put(endpoint, dict(property=self.property.pk, lead=self.lead.pk, first_name='test2',
                                                  last_name='test2'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        roommate = Roommate.objects.first()
        self.assertEqual(roommate.first_name, 'test2')
        self.assertTrue(roommate.lead.last_activity_date)

    def test_delete_roommate(self):
        """
        Ensure we can delete roommate object.
        """
        roommate = RommateFactory(property=self.property, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_roommate-detail', kwargs={'lead_pk': 9999, 'pk': roommate.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Roommate.objects.count(), 1)

        endpoint = reverse('lead_roommate-detail', kwargs={'lead_pk': self.lead.pk, 'pk': roommate.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Roommate.objects.count(), 0)
