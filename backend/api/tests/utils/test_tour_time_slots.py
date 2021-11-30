from datetime import timedelta

import pytz
from django.urls import reverse
from django.utils import timezone
from django.utils.http import urlencode
from rest_framework import status

from backend.api.factories import TaskFactory
from backend.api.models import Task
from backend.api.tests import PropertyLevelBaseTestCase


class TourTimeSlotsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(TourTimeSlotsTests, self).setUp()
        self.property.timezone = pytz.timezone('America/Phoenix')
        self.property.save()

    def test_completed_tour(self):
        # task is open, should affect times
        tour_date = (timezone.now().replace(hour=13, minute=0, second=0, microsecond=0) + timedelta(days=2)).astimezone(
            self.property.timezone).replace(hour=13, minute=0, second=0, microsecond=0)
        tour = TaskFactory(type=Task.TYPE_IN_PERSON, tour_date=tour_date, status=Task.TASK_OPEN,
                           property=self.property)

        header = {'HTTP_X_NAME': 'test1'}
        query_kwargs = {'date': tour_date.strftime('%Y-%m-%d')}
        endpoint = '{}?{}'.format(reverse('tour_available_time'), urlencode(query_kwargs))
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(tour.tour_date in response.data['times'])

        # task became completed, should not affect times
        tour.status = Task.TASK_COMPLETED
        tour.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(tour.tour_date in response.data['times'])

    def test_cancelled_tour(self):
        # task is not cancelled, should affect times
        tour_date = (timezone.now().replace(hour=13, minute=0, second=0, microsecond=0) + timedelta(days=2)).astimezone(
            self.property.timezone).replace(hour=13, minute=0, second=0, microsecond=0)
        tour = TaskFactory(type=Task.TYPE_IN_PERSON, tour_date=tour_date, status=Task.TASK_OPEN,
                           property=self.property, is_cancelled=False)

        header = {'HTTP_X_NAME': 'test1'}
        query_kwargs = {'date': tour_date.strftime('%Y-%m-%d')}
        endpoint = '{}?{}'.format(reverse('tour_available_time'), urlencode(query_kwargs))
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(tour.tour_date in response.data['times'])

        # task became cancelled, should not affect times
        tour.is_cancelled = True
        tour.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(tour.tour_date in response.data['times'])

    def test_current_tour(self):
        tour_date = (timezone.now().replace(hour=13, minute=0, second=0, microsecond=0) + timedelta(days=2)).astimezone(
            self.property.timezone).replace(hour=13, minute=0, second=0, microsecond=0)
        tour = TaskFactory(type=Task.TYPE_IN_PERSON, tour_date=tour_date, status=Task.TASK_OPEN,
                           property=self.property)

        header = {'HTTP_X_NAME': 'test1'}
        query_kwargs = {'date': tour_date.strftime('%Y-%m-%d'), 'tour': tour.id}
        endpoint = '{}?{}'.format(reverse('tour_available_time'), urlencode(query_kwargs))
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(tour.tour_date in response.data['times'])

    def test_non_standard_times(self):
        # 13:00 and 13:30 should not be in times
        tour_date = (timezone.now().replace(hour=13, minute=15, second=0, microsecond=0) + timedelta(days=2)).astimezone(
            self.property.timezone).replace(hour=13, minute=15, second=0, microsecond=0)
        tour = TaskFactory(type=Task.TYPE_IN_PERSON, tour_date=tour_date, status=Task.TASK_OPEN,
                           property=self.property)

        header = {'HTTP_X_NAME': 'test1'}
        query_kwargs = {'date': tour_date.strftime('%Y-%m-%d')}
        endpoint = '{}?{}'.format(reverse('tour_available_time'), urlencode(query_kwargs))
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(tour.tour_date - timedelta(minutes=15) in response.data['times'])
        self.assertFalse(tour.tour_date + timedelta(minutes=15) in response.data['times'])
