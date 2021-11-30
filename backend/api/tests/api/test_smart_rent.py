import pytz

from django.utils.dateparse import parse_datetime
from django.urls import reverse
from unittest.mock import patch
from datetime import timedelta
from django.utils import timezone

from backend.api.models import Task, Event
from backend.api.factories import LeadFactory, TaskFactory
from backend.api.tests import PropertyLevelBaseTestCase


tour_created_payload = payload = {
    'occurred_at': '2021-04-26T02:09:41.921947Z',
    'organization': {'uuid': 'cf233e3f-a815-4adc-8e24-44911b3d225c'},
    'prospect': {'city': None, 'desired_move_in_date': '2021-04-28', 'email': 'chao@liftlytics.com',
                 'first_name': 'Chao', 'id': 326658, 'is_real_estate_agent': False, 'last_name': 'Yun',
                 'phone_number': '4806089893', 'realtor_info': None, 'state': None,
                 'street_address_1': None, 'street_address_2': None, 'zip_code': None},
    'tour': {'deleted_at': None, 'deleted_reason': None, 'end': '2021-04-29T21:30:00Z', 'id': 965324,
             'inserted_at': '2021-04-26T02:08:58.164191', 'is_finalized': True, 'previous_tour_id': None,
             'source': None, 'start': '2021-04-29T21:00:00Z', 'tour_now': False},
    'trigger': 'tour_created',
    'units': [{'access_codes': [{'device': {'deleted_at': None, 'internal_name': 'Front Door - Lock'},
                                 'id': 13071618, 'times_used': 0}], 'id': 2708947, 'remote_id': None,
               'tour_marketing_name': '1101-1A', 'tour_status': 'active'}]
}


class SmartRentWebhookTests(PropertyLevelBaseTestCase):

    def test_tour_created(self):
        self.property.smart_rent_group_id = 3175
        self.property.save()

        endpoint = reverse('smart_rent-tour-created')

        prospect_payload = {'group': {'id': 3175}}
        with patch('backend.api.permissions.vendor.get_prospect', return_value=prospect_payload):
            response = self.client.post(endpoint, data=tour_created_payload, format='json')
            self.assertEqual(response.status_code, 200)

        tour = Task.objects.get(smart_rent_id=965324)

        tour_date = parse_datetime('2021-04-29T21:00:00Z').astimezone(tz=pytz.timezone('America/Phoenix'))
        self.assertEqual(tour.tour_date, tour_date)

    def test_update_verified_state(self):
        self.property.smart_rent_group_id = 3175
        self.property.save()

        endpoint = reverse('smart_rent-tour-created')

        lead = LeadFactory(property=self.property, smart_rent_id=326658)
        Task.objects.create(type=Task.TYPE_SELF_GUIDED_TOUR, tour_date=parse_datetime('2021-04-29T21:00:00Z'),
                            property=self.property, smart_rent_id=965324, lead=lead, status='PENDING')

        prospect_payload = {'group': {'id': 3175}}
        with patch('backend.api.permissions.vendor.get_prospect', return_value=prospect_payload),\
                patch('backend.api.views.smart_rent.send_tour_event.delay') as mock_send_tour_event, \
                    patch('backend.api.views.smart_rent.delete_event.delay') as mock_delete_event:
            response = self.client.post(endpoint, data=tour_created_payload, format='json')
            self.assertEqual(response.status_code, 200)
            mock_send_tour_event.assert_called_once()
            mock_delete_event.assert_not_called()

        tour = Task.objects.get(smart_rent_id=965324)
        self.assertEqual(tour.status, 'OPEN')

    def test_tour_date_update_should_send_new_calendar_event(self):
        self.property.smart_rent_group_id = 3175
        self.property.save()

        endpoint = reverse('smart_rent-tour-created')

        lead = LeadFactory(property=self.property, smart_rent_id=326658)
        task = Task.objects.create(type=Task.TYPE_SELF_GUIDED_TOUR, tour_date=timezone.now() + timedelta(days=1),
                                   property=self.property, smart_rent_id=965324, lead=lead, status='PENDING')
        Event.objects.create(property=self.property, tour=task, external_id='111', title='Self Guided Tour')

        prospect_payload = {'group': {'id': 3175}}
        with patch('backend.api.permissions.vendor.get_prospect', return_value=prospect_payload), \
                patch('backend.api.views.smart_rent.delete_event.delay') as mock_delete_event, \
                patch('backend.api.views.smart_rent.send_tour_event.delay') as mock_send_tour_event:
            response = self.client.post(endpoint, data=tour_created_payload, format='json')
            self.assertEqual(response.status_code, 200)
            mock_delete_event.assert_called_once()
            mock_send_tour_event.assert_called_once()

        tour = Task.objects.get(smart_rent_id=965324)
        tour_date = parse_datetime('2021-04-29T21:00:00Z').astimezone(tz=pytz.timezone('America/Phoenix'))
        self.assertEqual(tour.tour_date, tour_date)

    def test_tour_cancelled(self):
        self.property.smart_rent_group_id = 3175
        self.property.save()
        lead = LeadFactory(property=self.property, smart_rent_id=1887)
        task = TaskFactory(type=Task.TYPE_SELF_GUIDED_TOUR, tour_date=timezone.now() + timedelta(days=1),
                           property=self.property, smart_rent_id=965324, lead=lead)

        endpoint = reverse('smart_rent-tour-cancelled')
        payload = {
            'occurred_at': '2021-04-26T03:09:19.857389Z',
            'organization': {'uuid': 'cf233e3f-a815-4adc-8e24-44911b3d225c'},
            'prospect': {'city': None, 'desired_move_in_date': '2021-04-28', 'email': 'chao@liftlytics.com',
                         'first_name': 'Chao', 'id': 326658, 'is_real_estate_agent': False, 'last_name': 'Yun',
                         'phone_number': '4806089893', 'realtor_info': None, 'state': None,
                         'street_address_1': None, 'street_address_2': None, 'zip_code': None},
            'tour': {'deleted_at': '2021-04-26T03:09:19.837225Z', 'deleted_reason': 'deleted_by_user',
                     'end': '2021-04-29T21:30:00Z', 'id': 965324, 'inserted_at': '2021-04-26T02:08:58.164191',
                     'is_finalized': True, 'previous_tour_id': None, 'source': None,
                     'start': '2021-04-29T21:00:00Z', 'tour_now': False},
            'trigger': 'tour_cancelled',
            'units': [
                {
                    'access_codes': [{'device': {'deleted_at': None, 'internal_name': 'Front Door - Lock'},
                                      'id': 13071618, 'times_used': 0}], 'id': 2708947, 'remote_id': None,
                    'tour_marketing_name': '1101-1A', 'tour_status': 'cancelled'
                }
            ]
        }

        response = self.client.post(endpoint, data=payload, format='json')
        self.assertEqual(response.status_code, 200)

        task = Task.objects.get(pk=task.pk)
        self.assertEqual(task.is_cancelled, True)
