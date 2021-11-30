from django.urls import reverse
from rest_framework import status
from backend.api.models import Activity
from backend.api.tests import LeadLevelBaseTestCase


class ActivityTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(ActivityTests, self).setUp()

    def test_create_activity(self):
        """
        Ensure we can create a new activity object.
        """
        data = dict(content='test', type='TASK_CREATED', property=self.property.pk)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_activity-list', kwargs={'lead_pk': 9999})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Activity.objects.count(), 1)

        endpoint = reverse('lead_activity-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Activity.objects.count(), 2)
        self.assertEqual(Activity.objects.get(type='TASK_CREATED').content, 'test')

    def test_list_activity(self):
        """
        Ensure we can list activity objects.
        """
        Activity.objects.create(content='test1', type='TASK_CREATED', lead=self.lead, property=self.property)
        Activity.objects.create(content='test2', type='TASK_COMPLETED', lead=self.lead, property=self.property)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_activity-list', kwargs={'lead_pk': 9999})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        endpoint = reverse('lead_activity-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Activity.objects.count(), 3)

    def test_put_activity(self):
        """
        Ensure we can update activity object.
        """
        activity = Activity.objects.create(content='test1', type='TASK_CREATED', lead=self.lead, property=self.property)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_activity-detail', kwargs={'lead_pk': 9999, 'pk': activity.pk})
        response = self.client.put(endpoint, dict(content='test2', type='TASK_COMPLETED'), **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        activity = Activity.objects.get(content='test1')
        self.assertEqual(activity.type, 'TASK_CREATED')

        endpoint = reverse('lead_activity-detail', kwargs={'lead_pk': self.lead.pk, 'pk': activity.pk})
        response = self.client.put(endpoint, dict(content='test2', type='TASK_COMPLETED'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        activity = Activity.objects.get(content='test2')
        self.assertEqual(activity.type, 'TASK_COMPLETED')

    def test_delete_activity(self):
        """
        Ensure we can delete activity object.
        """
        activity = Activity.objects.create(content='test1', type='TASK_CREATED', lead=self.lead, property=self.property)
        self.assertEqual(Activity.objects.count(), 2)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_activity-detail', kwargs={'lead_pk': 9999, 'pk': activity.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Activity.objects.count(), 2)

        endpoint = reverse('lead_activity-detail', kwargs={'lead_pk': self.lead.pk, 'pk': activity.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Activity.objects.count(), 1)
