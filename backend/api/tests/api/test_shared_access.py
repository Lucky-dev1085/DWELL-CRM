import datetime

from django.urls import reverse
from rest_framework import status

from backend.api.factories import LeadFactory, TaskFactory, RommateFactory, NoteFactory, CallFactory, \
    EmailMessageFactory
from backend.api.factories import PropertyFactory
from backend.api.models import Activity
from backend.api.tests import PropertyLevelBaseTestCase


class SharedAccessTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(SharedAccessTests, self).setUp()
        self.property_1 = PropertyFactory(name='test-1', client=self.m_client, status='ACTIVE', is_released=True)
        self.property_2 = PropertyFactory(name='test-2', client=self.m_client, status='ACTIVE', is_released=True)
        self.lead_1 = LeadFactory(property=self.property_1, emails=[])  # shared lead
        self.lead_2 = LeadFactory(property=self.property_2, emails=[])  # source lead

    def test_get_lead(self):
        endpoint = reverse('lead-detail', kwargs={'pk': self.lead_2.id})
        header = {'HTTP_X_NAME': 'test-1'}

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_activities(self):
        Activity.objects.create(content='test1', type='TASK_CREATED', lead=self.lead_2, property=self.property_2)
        Activity.objects.create(content='test2', type='TASK_COMPLETED', lead=self.lead_2, property=self.property_2)

        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('lead_activity-list', kwargs={'lead_pk': self.lead_2.id})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_tasks(self):
        TaskFactory(due_date=datetime.date.today() + datetime.timedelta(days=1), owner=self.user,
                    lead=self.lead_2, property=self.property_2)
        TaskFactory(due_date=datetime.date.today() + datetime.timedelta(days=1), owner=self.user,
                    lead=self.lead_2, property=self.property_2)

        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead_2.id})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_roommates(self):
        RommateFactory(property=self.property_2, lead=self.lead_2)
        RommateFactory(property=self.property_2, lead=self.lead_2)
        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('lead_roommate-list', kwargs={'lead_pk': self.lead_2.id})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_notes(self):
        NoteFactory(property=self.property_2, lead=self.lead_2)
        NoteFactory(property=self.property_2, lead=self.lead_2)
        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('lead_note-list', kwargs={'lead_pk': self.lead_2.id})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_calls(self):
        CallFactory(property=self.property_2, lead=self.lead_2)
        CallFactory(property=self.property_2, lead=self.lead_2)
        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('calls-list')
        response = self.client.get(endpoint, {'lead_id': self.lead_2.id}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 0)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, {'lead_id': self.lead_2.id}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

    def test_get_email(self):
        EmailMessageFactory(property=self.property_2, lead=self.lead_2)
        EmailMessageFactory(property=self.property_2, lead=self.lead_2)
        header = {'HTTP_X_NAME': 'test-1'}
        endpoint = reverse('email_messages-list')
        response = self.client.get(endpoint, {'lead_id': self.lead_2.id}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 0)

        self.lead_1.source_lead = self.lead_2
        self.lead_1.save()

        response = self.client.get(endpoint, {'lead_id': self.lead_2.id}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)
