from json import loads

import pytz
from django.urls import reverse
from rest_framework import status

from backend.compete.factories import AlertLogFactory, AlertLogDetailFactory, AlertUnitRentLogFactory
from backend.compete.models import Market, Property, Alert, AlertLogDetail
from backend.compete.tests.test_base import BaseTestCase

TZ = pytz.timezone('America/Phoenix')


class AlertTests(BaseTestCase):
    def test_create_benchmark_alert(self):
        """
        Test create benchmark alert API
        """
        endpoint = reverse('alert-list')
        data = dict(
            name='Benchmark Alert', type=Alert.BENCHMARK, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS,
            markets=Market.objects.values_list('id', flat=True), user=self.user
        )
        response = self.client.post(endpoint, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        content = loads(response.content)

        self.assertEqual(content['name'], 'Benchmark Alert')
        self.assertEqual(content['type'], Alert.BENCHMARK)
        self.assertEqual(content['track_assets_mode'], Alert.TRACK_ASSETS_IN_MARKETS)

    def test_create_threshold_alert(self):
        """
        Test create threshold alert API
        """
        endpoint = reverse('alert-list')
        data = dict(
            name='Threshold Alert', type=Alert.THRESHOLD, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS,
            baseline=Alert.PREVIOUS_DAY, condition_subject=Alert.OCCUPANCY, condition_type=Alert.INCREASES,
            condition_value=1, markets=Market.objects.values_list('id', flat=True), user=self.user
        )
        response = self.client.post(endpoint, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        content = loads(response.content)

        self.assertEqual(content['name'], 'Threshold Alert')
        self.assertEqual(content['type'], Alert.THRESHOLD)
        self.assertEqual(content['track_assets_mode'], Alert.TRACK_ASSETS_IN_MARKETS)

    def test_list_alerts(self):
        """
        Test alert list API
        """
        endpoint = reverse('alert-list')
        alert = Alert.objects.create(
            name='Benchmark Alert', type=Alert.BENCHMARK, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS,
            user=self.user
        )
        alert.markets.set(Market.objects.all())
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)
        self.assertEqual(content['count'], 1)
        self.assertEqual(content['results'][0]['name'], 'Benchmark Alert')


class AlertLogDetailsTests(BaseTestCase):
    def test_benchmark_alert_log_details(self):
        """
        Test list benchmark alert log details API
        """
        alert = Alert.objects.create(
            name='Benchmark Alert', type=Alert.BENCHMARK, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS,
            user=self.user
        )
        property = Property.objects.first()
        alert_log = AlertLogFactory(alert=alert)
        AlertLogDetailFactory(property=property, alert_log=alert_log)
        AlertLogDetailFactory(property=property, alert_log=alert_log)

        endpoint = reverse('alert_log_details-list', kwargs=dict(alert_log_pk=alert_log.id))
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], 2)

    def test_threshold_alert_log_details(self):
        """
        Test list threshold alert log details API
        """
        alert = Alert.objects.create(
            name='Threshold Alert', type=Alert.THRESHOLD, track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS,
            user=self.user, baseline=Alert.LAST_WEEK, condition_subject=Alert.RENT, condition_type=Alert.DECREASES,
            condition_value=1, condition_unit_types=['STUDIO', 'ONE_BEDROOM']
        )
        property = Property.objects.first()
        alert_log = AlertLogFactory(alert=alert, condition_subject=alert.condition_subject, baseline=alert.baseline)
        alert_log_details = AlertLogDetail.objects.create(property=property, alert_log=alert_log)
        AlertUnitRentLogFactory(alert_log_detail=alert_log_details, unit_type='STUDIO')

        alert_log_details = AlertLogDetail.objects.create(property=property, alert_log=alert_log)
        AlertUnitRentLogFactory(alert_log_detail=alert_log_details, unit_type='ONE_BEDROOM')

        endpoint = reverse('alert_log_details-list', kwargs=dict(alert_log_pk=alert_log.id))
        response = self.client.get(f'{endpoint}?unit_type=STUDIO')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)
        self.assertEqual(content['count'], 1)

        endpoint = reverse('alert_log_details-list', kwargs=dict(alert_log_pk=alert_log.id))
        response = self.client.get(f'{endpoint}?unit_type=ONE_BEDROOM')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)
        self.assertEqual(content['count'], 1)
