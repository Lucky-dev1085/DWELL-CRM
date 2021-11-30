# import pytz
#
# from django.utils.dateparse import parse_datetime
# from django.urls import reverse
# from unittest.mock import patch
#
# from backend.api.models import Task
# from backend.api.tests import PropertyLevelBaseTestCase
#
#
# class TourSchedulerTests(PropertyLevelBaseTestCase):
#
#     def test_book_self_guided_tour(self):
#         from backend.api.factories import ChatProspectFactory
#         ChatProspectFactory(property=self.property)
#         request_data = dict(
#             is_from_mt=True,
#             tour_date='2021-04-29T21:00:00Z',
#             first_name='Test',
#             last_name='User',
#             email='testuser@gmail.com',
#             phone_number='4512321231',
#             move_in_date='2021-5-15',
#             beds=3
#         )
#         endpoint = reverse('book_tour')
#
#         with patch('backend.api.views.tour_scheduler.create_tour.delay') as mock_create_tour:
#             header = {'HTTP_CLIENT_ID': self.property.client_external_id}
#             response = self.client.post(endpoint, data=request_data, format='json', **header)
#             self.assertEqual(response.status_code, 200)
#             mock_create_tour.assert_called_once()
#
#         tour_id = response.json().get('tour_id')
#         tour = Task.objects.get(pk=tour_id)
#
#         tour_date = parse_datetime('2021-04-29T21:00:00Z').astimezone(tz=pytz.timezone('America/Phoenix'))
#         self.assertEqual(tour.tour_date, tour_date)
#         self.assertEqual(tour.lead.first_name, 'Test')
#         self.assertEqual(tour.lead.last_name, 'User')
