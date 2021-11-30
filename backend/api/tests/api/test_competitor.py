from django.urls import reverse
from rest_framework import status
from backend.api.models import Competitor
from backend.api.tests import PropertyLevelBaseTestCase


class CompetitorTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(CompetitorTests, self).setUp()

    def test_create_competitor(self):
        """
        Ensure we can create a new competitor object.
        """
        data = dict(property=self.property.pk, name='test competitor', address_line_1='test',
                    address_line_2='test', city='test', state='test', zip_code='12345', phone_number='4802037430',
                    fax_number='2125551234')
        endpoint = reverse('competitors-list')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Competitor.objects.count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Competitor.objects.count(), 1)
        competitor = Competitor.objects.first()
        self.assertEqual(competitor.name, 'test competitor')
        self.assertEqual(competitor.property, self.property)

    def test_list_competitor(self):
        """
        Ensure we can list assign competitor objects.
        """
        Competitor.objects.create(property=self.property, name='test competitor 1')
        Competitor.objects.create(property=self.property, name='test competitor 2')
        endpoint = reverse('competitors-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], Competitor.objects.count())

    def test_put_competitor(self):
        """
        Ensure we can update competitor object.
        """
        competitor = Competitor.objects.create(property=self.property, name='test competitor 1')
        endpoint = reverse('competitors-detail', args=[competitor.pk])
        response = self.client.put(endpoint, dict(name='test competitor 2'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Competitor.objects.first().name, 'test competitor 1')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(name='test competitor 2'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Competitor.objects.first().name, 'test competitor 2')

    def test_delete_competitor(self):
        """
        Ensure we can delete competitor object.
        """
        competitor = Competitor.objects.create(property=self.property, name='test competitor 1')
        endpoint = reverse('competitors-detail', args=[competitor.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Competitor.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Competitor.objects.count(), 0)


