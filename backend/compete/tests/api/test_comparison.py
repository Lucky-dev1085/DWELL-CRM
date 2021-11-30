import pytz
from json import loads
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.models import Submarket, Comparison


TZ = pytz.timezone('America/Phoenix')


class ComparisonTests(BaseTestCase):
    def test_create_comparison(self):
        """
        Test create comparison API
        """
        endpoint = reverse('comparison-list')
        submarket1 = Submarket.objects.first()
        submarket2 = Submarket.objects.last()
        data = dict(
            subject_asset_type=Comparison.SUB_MARKET, subject_sub_market=submarket1.id,
            compared_asset_type=Comparison.SUB_MARKET, compared_sub_market=submarket2.id
        )
        response = self.client.post(endpoint, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        content = loads(response.content)

        self.assertEqual(content['subject_asset_type'], Comparison.SUB_MARKET)
        self.assertEqual(content['subject_sub_market'], submarket1.id)
        self.assertEqual(content['compared_asset_type'], Comparison.SUB_MARKET)
        self.assertEqual(content['compared_sub_market'], submarket2.id)

    def test_list_comparisons(self):
        """
        Test list comparisons API
        """
        endpoint = reverse('comparison-list')
        submarket1 = Submarket.objects.first()
        submarket2 = Submarket.objects.last()
        Comparison.objects.create(
            subject_asset_type=Comparison.SUB_MARKET, subject_sub_market=submarket1,
            compared_asset_type=Comparison.SUB_MARKET, compared_sub_market=submarket2, user=self.user
        )
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], 1)
        self.assertEqual(content['results'][0]['subject_sub_market'], submarket1.id)
        self.assertEqual(content['results'][0]['compared_sub_market'], submarket2.id)
