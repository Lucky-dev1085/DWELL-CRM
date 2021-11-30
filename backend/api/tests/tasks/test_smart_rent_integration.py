from datetime import timedelta, datetime
from unittest.mock import patch

import redis
from django.conf import settings
from django.utils import timezone

from backend.api.factories import TaskFactory, LeadFactory
from backend.api.models import Task
from backend.api.tasks import create_tour, create_prospect, update_tour, cancel_tour, update_prospect
from backend.api.tasks.smartrent.utils import get_tours_list, refresh_access_token, get_access_token, get_group_list

from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.tests.test_base import MockResponse


class SmartRentTasksTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(SmartRentTasksTests, self).setUp()

        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '')
        r.set('smart_rent_refresh_token', '')
        self.property.smart_rent_group_id = 'smart_rent_group_id'
        self.property.save()
        self.lead = LeadFactory(property=self.property, smart_rent_id=1887)
        self.tour = TaskFactory(type=Task.TYPE_SELF_GUIDED_TOUR, tour_date=timezone.now() + timedelta(days=1),
                                property=self.property, lead=self.lead)

    def test_get_access_token(self):
        with patch('requests.post', return_value=MockResponse(json_data={}, status_code=400)):
            access_token = get_access_token()
            self.assertEqual(access_token, None)

        mock_response = {'access_token': '{AccessToken}',
                         'expires': datetime.timestamp(timezone.now() + timedelta(hours=1)),
                         'refresh_token': '{RefreshToken}',
                         'user_id': 1740}
        with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
            access_token = get_access_token()
            self.assertEqual(access_token, mock_response.get('access_token'))

    def test_refresh_access_token(self):
        with patch('requests.post', return_value=MockResponse(json_data={}, status_code=400)):
            access_token = refresh_access_token('{RefreshToken}')
            self.assertEqual(access_token, None)

        mock_response = {'access_token': '{AccessToken}',
                         'expires': datetime.timestamp(timezone.now() + timedelta(hours=1)),
                         'refresh_token': '{RefreshToken}',
                         'user_id': 1740}
        with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
            access_token = refresh_access_token('{RefreshToken}')
            self.assertEqual(access_token, mock_response.get('access_token'))

    def test_get_group_list(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        with patch('requests.get', return_value=MockResponse(json_data={}, status_code=400)):
            groups = get_group_list()
            self.assertEqual(len(groups), 0)

        mock_response = {'records': [{'id': 3178}, {'id': 3175}], 'total_pages': 2}
        with patch('requests.get', return_value=MockResponse(json_data=mock_response, status_code=200)):
            groups = get_group_list()
            self.assertEqual(len(groups), 4)

    def test_create_prospect(self):
        lead = LeadFactory(property=self.property)
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        with patch('requests.post', return_value=MockResponse(json_data={}, status_code=400)):
            result_lead = create_prospect(lead.id)
            self.assertEqual(result_lead, None)

        mock_response = {'id': 1887}
        with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
            # lead doesn't exist
            result_lead = create_prospect(lead.id + 1)
            self.assertEqual(result_lead, None)

            result_lead = create_prospect(lead.id)
            self.assertEqual(result_lead.smart_rent_id, mock_response.get('id'))

    def test_create_tour(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        with patch('requests.post', return_value=MockResponse(json_data={}, status_code=400)):
            create_tour(self.lead.id, self.tour.id)
            self.assertEqual(Task.objects.get(pk=self.tour.pk).smart_rent_id, None)

        mock_response = {'id': 2705}
        with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
            # tour doesn't exist
            result_tour = create_tour(self.lead.id, self.tour.id + 1)
            self.assertEqual(result_tour, None)

            create_tour(self.lead.id, self.tour.id)
            self.assertEqual(Task.objects.get(pk=self.tour.pk).smart_rent_id, mock_response.get('id'))

            # lead doesn't have smart rent id
            self.lead.smart_rent_id = None
            self.lead.save()
            self.tour.smart_rent_id = None
            self.tour.save()

            create_tour(self.lead.id, self.tour.id)
            self.assertEqual(Task.objects.get(pk=self.tour.pk).smart_rent_id, mock_response.get('id'))

    def test_get_tours_list(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        with patch('requests.get', return_value=MockResponse(json_data={}, status_code=400)):
            tours = get_tours_list(self.property.smart_rent_group_id)
            self.assertEqual(len(tours), 0)

        mock_response = {'records': [{'id': 3178}, {'id': 3175}], 'total_pages': 2}
        with patch('requests.get', return_value=MockResponse(json_data=mock_response, status_code=200)):
            tours = get_tours_list(self.property.smart_rent_group_id)
            self.assertEqual(len(tours), 4)

    def test_cancel_tour(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        with patch('requests.delete', return_value=MockResponse(json_data={}, status_code=400)):
            is_succeed = cancel_tour(self.lead.id, self.tour.id)
            self.assertFalse(is_succeed)

        with patch('requests.delete', return_value=MockResponse(status_code=202)):
            is_succeed = cancel_tour(self.lead.id, self.tour.id)
            self.assertTrue(is_succeed)

    def test_update_tour(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        self.tour.smart_rent_id = 2700
        self.tour.save()

        mock_response = {'id': 2705}
        with patch('requests.delete', return_value=MockResponse(status_code=202)):
            with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
                update_tour(self.lead.id, self.tour.id)
                tour = Task.objects.get(pk=self.tour.pk)
                self.assertEqual(tour.smart_rent_id, 2705)

    # todo should find reason why it's not working in code build
    # def test_delete_prospect(self):
    #     r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
    #     r.set('smart_rent_access_token', '{AccessToken}')
    #     r.set('smart_rent_refresh_token', '{RefreshToken}')
    #
    #     self.tour.smart_rent_id = 1000
    #     self.tour.save()
    #
    #     with patch('backend.api.tasks.smartrent.delete_prospect.cancel_tour') as mock_cancel_tour, \
    #             patch('requests.delete', return_value=MockResponse(status_code=202)):
    #         delete_prospect(self.lead.id)
    #         mock_cancel_tour.assert_called_once_with(self.lead.id, self.tour.id, remove_smart_rent_id=True)
    #         self.assertIsNone(Lead.objects.get(pk=self.lead.pk).smart_rent_id)

    def test_update_prospect(self):
        r = redis.Redis.from_url(settings.SMART_RENT_REDIS)
        r.set('smart_rent_access_token', '{AccessToken}')
        r.set('smart_rent_refresh_token', '{RefreshToken}')

        self.tour.smart_rent_id = 1000
        self.tour.save()

        with patch('requests.patch', return_value=MockResponse(status_code=200)):
            self.assertTrue(update_prospect(self.lead.id))
