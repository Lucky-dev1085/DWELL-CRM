import pytz
from json import loads
from django.db.models import Sum, Min, Max, Q
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.management.commands.compete_initial_data import generate_units_mock_data
from backend.compete.models import Submarket, Market, Property, UnitType, Unit


TZ = pytz.timezone('America/Phoenix')


class MarketTests(BaseTestCase):
    def setUp(self):
        super(MarketTests, self).setUp()
        generate_units_mock_data()

    def test_retrieve_market(self):
        """
        Test market retrieve API
        """
        market = Market.objects.first()
        endpoint = reverse('market-detail', args=[market.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['name'], market.name)
        self.assertEqual(content['properties_count'], market.properties.count())
        self.assertEqual(len(content['unit_types']), 4)
        self.assertEqual(
            content['units_count'], market.properties.aggregate(Sum('units_count')).get('units_count__sum')
        )
        self.assertEqual(
            content['available_units_count'], Unit.objects.filter(property__in=market.properties, on_market=True).count()
        )
        self.assertEqual(
            content['properties_offering_concession'], market.properties.exclude(concession_amount=None).count()
        )
        self.assertEqual(
            content['min_concession'],
            market.properties.aggregate(Min('concession_amount')).get('concession_amount__min')
        )
        self.assertEqual(
            content['max_concession'],
            market.properties.aggregate(Max('concession_amount')).get('concession_amount__max')
        )

    def test_ltn_occupancy(self):
        """
        Test ltn occupancy of market
        """
        market = Market.objects.first()
        endpoint = reverse('market-detail', args=[market.id])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        available_counts = Unit.objects.filter(property__in=market.properties, on_market=True).count()
        total_unit_counts = market.properties.aggregate(Sum('units_count')).get('units_count__sum')
        self.assertEqual(
            content['ltn_occupancy'],
            round((total_unit_counts - available_counts) / total_unit_counts * 100, 2)
        )

        property = market.properties.first()
        property.is_lease_up = True
        property.completed_units_count = property.units_count
        property.units_count = property.units_count + 50
        property.save()

        endpoint = reverse('market-detail', args=[market.id])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        self.assertEqual(
            content['ltn_occupancy'],
            round((total_unit_counts - available_counts) / (total_unit_counts + 50) * 100, 2)
        )

    def test_submarket_breakdown(self):
        """
        Test submarket breakdown API
        """
        market = Market.objects.first()
        endpoint = reverse('submarket_breakdown-list', kwargs={'market_pk': market.id})
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(content['count'], market.submarkets.filter(is_mtr_group=False).count())

    def test_mtr_group_submarket_breakdown(self):
        """
        Test MTR Group submarket breakdown API
        """
        market = Market.objects.first()
        endpoint = reverse('overall_mtr_group_submarkets-list', kwargs={'market_pk': market.id})
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(content['count'], market.submarkets.filter(is_mtr_group=True).count())


class SubMarketTests(BaseTestCase):
    def setUp(self):
        super(SubMarketTests, self).setUp()
        generate_units_mock_data()

    def test_retrieve_submarket(self):
        """
        Test submarket retrieve API
        """
        submarket = Submarket.objects.first()
        endpoint = reverse('submarket-detail', args=[submarket.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['name'], submarket.name)
        self.assertEqual(content['properties_count'], submarket.properties.count())
        self.assertEqual(len(content['unit_types']), 6)
        self.assertEqual(
            content['units_count'], submarket.properties.aggregate(Sum('units_count')).get('units_count__sum')
        )
        self.assertEqual(
            content['available_units_count'], Unit.objects.filter(property__in=submarket.properties.all(), on_market=True).count()
        )
        self.assertEqual(
            content['properties_offering_concession'], submarket.properties.exclude(concession_amount=None).count()
        )
        self.assertEqual(
            content['min_concession'],
            submarket.properties.aggregate(Min('concession_amount')).get('concession_amount__min')
        )
        self.assertEqual(
            content['max_concession'],
            submarket.properties.aggregate(Max('concession_amount')).get('concession_amount__max')
        )

    def test_retrieve_mtr_group_submarket(self):
        """
        Test MTR group submarket retrieve API
        """
        submarket = Submarket.objects.filter(is_mtr_group=True).first()
        endpoint = reverse('submarket-detail', args=[submarket.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        properties = Property.objects.filter(submarket__in=submarket.mtr_submarkets.all())
        self.assertEqual(content['name'], submarket.name)
        self.assertEqual(content['properties_count'], properties.count())
        self.assertTrue(content['is_mtr_group'])
        self.assertEqual(
            content['units_count'], properties.aggregate(Sum('units_count')).get('units_count__sum')
        )
        self.assertEqual(
            content['available_units_count'], Unit.objects.filter(property__in=properties.all(), on_market=True).count()
        )
        self.assertEqual(
            content['properties_offering_concession'], properties.exclude(concession_amount=None).count()
        )
        self.assertEqual(
            content['min_concession'],
            properties.aggregate(Min('concession_amount')).get('concession_amount__min')
        )
        self.assertEqual(
            content['max_concession'],
            properties.aggregate(Max('concession_amount')).get('concession_amount__max')
        )

    def test_submarket_breakdown(self):
        """
        Test submarket breakdown API of MTR group
        """
        submarket = Submarket.objects.filter(is_mtr_group=True).first()
        endpoint = reverse('mtr_group_submarkets-list', args=[submarket.id])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)
        self.assertEqual(content['count'], submarket.mtr_submarkets.count())

    def test_retrieve_mt_submarket(self):
        """
        Test MT exclusive submarket retrieve API
        """
        submarket = Submarket.objects.get(is_mt_exclusive_group=True, name='MT - Central East Phoenix')
        endpoint = reverse('submarket-detail', args=[submarket.id])
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['name'], submarket.name)
        self.assertEqual(content['properties_count'], submarket.mt_properties.count())
        self.assertEqual(
            content['units_count'], submarket.mt_properties.aggregate(Sum('units_count')).get('units_count__sum')
        )
        self.assertEqual(
            content['available_units_count'], Unit.objects.filter(property__in=submarket.mt_properties.all(), on_market=True).count()
        )
        self.assertEqual(
            content['properties_offering_concession'], submarket.mt_properties.exclude(concession_amount=None).count()
        )
        self.assertEqual(
            content['min_concession'],
            submarket.mt_properties.aggregate(Min('concession_amount')).get('concession_amount__min')
        )
        self.assertEqual(
            content['max_concession'],
            submarket.mt_properties.aggregate(Max('concession_amount')).get('concession_amount__max')
        )

    def test_ltn_occupancy(self):
        """
        Test ltn occupancy of submarket
        """
        submarket = Submarket.objects.first()
        endpoint = reverse('submarket-detail', args=[submarket.id])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        available_counts = Unit.objects.filter(property__in=submarket.properties.all(), on_market=True).count()
        total_unit_counts = submarket.properties.aggregate(Sum('units_count')).get('units_count__sum')
        self.assertEqual(
            content['ltn_occupancy'],
            round((total_unit_counts - available_counts) / total_unit_counts * 100, 2)
        )

        property = submarket.properties.first()
        property.is_lease_up = True
        property.completed_units_count = property.units_count
        property.units_count = property.units_count + 50
        property.save()

        endpoint = reverse('submarket-detail', args=[submarket.id])
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        self.assertEqual(
            content['ltn_occupancy'],
            round((total_unit_counts - available_counts) / (total_unit_counts + 50) * 100, 2)
        )


class ExploreMarketsTests(BaseTestCase):
    def test_explore_markets(self):
        """
        Test explore markets API
        """
        endpoint = reverse('explore_market-list')
        response = self.client.get(endpoint, data=dict(keyword=''))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(len(content['markets']), Market.objects.count())
        self.assertEqual(len(content['submarkets']), Submarket.objects.count())
        self.assertEqual(len(content['properties']), Property.objects.count())

        response = self.client.get(endpoint, data=dict(keyword='a'))

        content = loads(response.content)
        self.assertEqual(len(content['markets']), Market.objects.filter(name__icontains='a').count())
        self.assertEqual(len(content['submarkets']), Submarket.objects.filter(name__icontains='a').count())
        self.assertEqual(len(content['properties']), Property.objects.filter(name__icontains='a').count())


class RentCompsTests(BaseTestCase):
    def test_rent_comps_list(self):
        """
        Test rent comps list API
        """
        market = Market.objects.first()
        endpoint = reverse('market_rent_comps-list', kwargs=dict(market_pk=market.id))
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        unit_types = UnitType.objects.filter(property__in=market.properties) \
            .exclude(Q(units_count=None) | Q(units_count=0))

        self.assertEqual(content['count'], unit_types.count())
