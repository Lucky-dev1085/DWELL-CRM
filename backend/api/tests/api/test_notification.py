from django.urls import reverse
from rest_framework import status
from backend.api.models import Notification
from backend.api.tests import PropertyLevelBaseTestCase


class NotificationTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(NotificationTests, self).setUp()

    def test_list_notification(self):
        """
        Ensure we can list assign notification objects.
        """
        Notification.objects.create(property=self.property, content='test1', type='NEW_LEAD')
        Notification.objects.create(property=self.property, content='test2', type='NEW_TASK')
        endpoint = reverse('notifications-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.count(), 2)

    def test_delete_notification(self):
        """
        Ensure we can delete notification object.
        """
        notification = Notification.objects.create(property=self.property, content='test1', type='NEW_TASK',
                                                   user=self.user)
        endpoint = reverse('notifications-detail', args=[notification.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Notification.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.count(), 0)

    def test_read_all_notification(self):
        Notification.objects.create(property=self.property, content='test1', type='NEW_LEAD', is_read=False,
                                    user=self.user)
        Notification.objects.create(property=self.property, content='test2', type='NEW_TASK', is_read=False,
                                    user=self.user)
        endpoint = reverse('notifications-read-all')
        response = self.client.post(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Notification.objects.filter(is_read=True).count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.filter(is_read=True).count(), 2)

    def test_clear_all_notification(self):
        Notification.objects.create(property=self.property, content='test1', type='NEW_LEAD', is_display=True,
                                    user=self.user)
        Notification.objects.create(property=self.property, content='test2', type='NEW_TASK', is_display=True,
                                    user=self.user)
        endpoint = reverse('notifications-clear-all')
        response = self.client.post(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Notification.objects.filter(is_display=False).count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.filter(is_display=False).count(), 2)

    def test_bulk_clear_notification(self):
        notification1 = Notification.objects.create(property=self.property, content='test1', type='NEW_SMS',
                                                    is_display=True,
                                                    user=self.user)
        notification2 = Notification.objects.create(property=self.property, content='test2', type='NEW_SMS',
                                                    is_display=True,
                                                    user=self.user)
        notification3 = Notification.objects.create(property=self.property, content='test3', type='NEW_SMS',
                                                    is_display=True,
                                                    user=self.user)
        endpoint = reverse('notifications-bulk-clear')
        response = self.client.post(endpoint, data={'ids': [notification1.pk, notification2.pk]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Notification.objects.filter(is_display=False).count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, **header, data={'ids': [notification1.pk, notification2.pk]},
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.filter(is_display=False).count(), 2)
        self.assertEqual(Notification.objects.get(pk=notification3.pk).is_display, True)

        response = self.client.post(endpoint, **header, data={'ids': [notification3.pk]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.filter(is_display=False).count(), 3)
        self.assertEqual(Notification.objects.get(pk=notification3.pk).is_display, False)
