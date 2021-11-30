import random
import pytz
from json import loads
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.models import Submarket, Market, Property, Alert
from backend.compete.factories import AlertFactory, AlertLogFactory, AlertLogDetailFactory, UnitFactory


TZ = pytz.timezone('America/Phoenix')


class PropertyTests(BaseTestCase):
    def test_retrieve_property(self):
        """
        Test property retrieve API
        """
        property = Property.objects.get(name='Arcadia Cove')
        endpoint = reverse('property-detail', args=[property.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['name'], property.name)
        self.assertEqual(content['submarket'], property.submarket.name)
        self.assertEqual(content['market'], property.submarket.market.name)
        self.assertEqual(len(content['unit_types']), 3)
        self.assertEqual(content['address'], property.address)
        self.assertEqual(content['phone_number'], property.phone_number)
        self.assertEqual(content['website'], property.website)
        self.assertEqual(content['units_count'], property.units_count)
        self.assertEqual(content['concession_description'], property.concession_description)
        self.assertEqual(content['concession_amount'], property.concession_amount)

    def test_list_property(self):
        """
        Test property list API
        """

        endpoint = reverse('property-list')
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)
        self.assertEqual(len(content['results']), Property.objects.all().count())

    def test_lease_up_property(self):
        """
        Test unit type reports of lease up property
        """
        property = Property.objects.get(name='Arcadia Cove')
        property.completed_units_count = 300
        property.units_count = 350
        property.is_lease_up = True
        property.save()

        one_bedroom = property.unit_types.filter(name='ONE_BEDROOM').first()
        one_bedroom.units_count = 20
        one_bedroom.save()

        for i in range(10):
            UnitFactory(beds=1, unit_type=one_bedroom, property=property)

        endpoint = reverse('property-detail', args=[property.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        unit_types = content['unit_types']
        self.assertEqual(len(unit_types), 3)
        one_bedroom = next((item for item in unit_types if item['name'] == 'ONE_BEDROOM'), None)
        self.assertEqual(content['completed_units_count'], 300)
        self.assertEqual(one_bedroom['distribution'], 6.67)

    def test_add_market_environment(self):
        """
        Test add market environment API
        """
        property = Property.objects.first()
        submarket = Submarket.objects.first()
        competitors = random.choices(Property.objects.exclude(pk=property.pk).values_list('id', flat=True))
        data = dict(market=submarket.market.id, submarket=submarket.id, competitors=competitors)
        endpoint = reverse('property-add-market-environment', args=[property.id])
        response = self.client.post(endpoint, data=data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        property = Property.objects.get(id=property.id)
        self.assertEqual(property.submarket.market.id, submarket.market.id)
        self.assertEqual(property.submarket.id, submarket.id)
        self.assertListEqual(list(property.competitors.values_list('id', flat=True)), competitors)

    def test_alert_subscriptions(self):
        """
        Test alert subscriptions API
        """
        property = Property.objects.first()

        alert = AlertFactory(type=Alert.BENCHMARK, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS, user=self.user)
        alert.markets.set(Market.objects.all())
        alert_log = AlertLogFactory(alert=alert)
        AlertLogDetailFactory(property=property, alert_log=alert_log)

        endpoint = reverse('property-alert-subscriptions', args=[property.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]['id'], alert.id)
        self.assertEqual(len(content[0]['logs']), 1)


class PropertyBreakdownTests(BaseTestCase):
    def test_property_breakdown(self):
        """
        Test property breakdown API
        """
        property = Property.objects.first()
        endpoint = reverse('competitors-list', kwargs=dict(property_pk=property.id))
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], property.competitors.count())

    def test_submarket_breakdown(self):
        """
        Test submarket breakdown API
        """
        submarket = Submarket.objects.first()
        endpoint = reverse('sub_market_properties-list', kwargs=dict(sub_market_pk=submarket.id))
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], submarket.properties.count())


class CompetitorSetTests(BaseTestCase):
    def test_competitor_set(self):
        """
        Test competitor set API
        """
        endpoint = reverse('competitor_set-list')
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], Property.objects.exclude(competitors=None).count())
