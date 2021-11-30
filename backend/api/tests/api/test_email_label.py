from django.urls import reverse
from rest_framework import status
from backend.api.models import EmailLabel
from backend.api.tests import PropertyLevelBaseTestCase


class EmailLabelTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(EmailLabelTests, self).setUp()

    def test_create_email_label(self):
        """
        Ensure we can create a new email label object.
        """
        endpoint = reverse('email_labels-list')
        data = dict(name='test', external_id='test', property=self.property.pk)
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailLabel.objects.count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EmailLabel.objects.count(), 1)
        self.assertEqual(EmailLabel.objects.first().name, 'test')

    def test_list_email_label(self):
        """
        Ensure we can list assign email label objects.
        """
        EmailLabel.objects.create(name='test1', external_id='test1', property=self.property)
        EmailLabel.objects.create(name='test2', external_id='test2', property=self.property)
        endpoint = reverse('email_labels-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailLabel.objects.count(), 2)

    def test_put_email_label(self):
        """
        Ensure we can update email label object.
        """
        label = EmailLabel.objects.create(name='test1', external_id='test1', property=self.property)
        endpoint = reverse('email_labels-detail', args=[label.pk])
        response = self.client.put(endpoint, dict(property=self.property.pk, name='test2', external_id='test2'),
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailLabel.objects.first().name, 'test1')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(property=self.property.pk, name='test2'),
                                   format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        label = EmailLabel.objects.first()
        self.assertEqual(label.name, 'test2')

    def test_delete_email_label(self):
        """
        Ensure we can delete email label object.
        """
        label = EmailLabel.objects.create(name='test1', external_id='test1', property=self.property)
        endpoint = reverse('email_labels-detail', args=[label.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailLabel.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(EmailLabel.objects.count(), 0)
