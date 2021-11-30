import pytz
from json import loads
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.models import Property, WatchList


TZ = pytz.timezone('America/Phoenix')


class WatchlistTests(BaseTestCase):
    def test_add_searched_asset(self):
        """
        Test add searched asset API
        """
        endpoint = reverse('watchlist-list')
        property = Property.objects.first()
        data = dict(
            object_type='property', object_id=property.id
        )
        response = self.client.post(endpoint, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(self.user.watch_lists.filter(property=property).exists())

    def test_add_watchlist(self):
        """
        Test add watchlist API
        """
        endpoint = reverse('watchlist-list')
        property = Property.objects.first()
        data = dict(
            object_type='property', object_id=property.id, is_stored=True
        )
        response = self.client.post(endpoint, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(self.user.watch_lists.filter(property=property, is_stored=True).exists())

    def test_list_watchlist(self):
        """
        Test list watchlist API
        """
        property = Property.objects.first()
        WatchList.objects.create(user=self.user, property=property)

        endpoint = reverse('watchlist-list')
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(len(content['properties']), 1)
        self.assertEqual(content['properties'][0]['id'], property.id)
