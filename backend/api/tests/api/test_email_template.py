from django.urls import reverse
from rest_framework import status
from backend.api.models import EmailTemplate
from backend.api.tests import PropertyLevelBaseTestCase


class EmailTemplateTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(EmailTemplateTests, self).setUp()

    def test_create_email_template(self):
        """
        Ensure we can create a new email template object.
        """
        endpoint = reverse('email_templates-list')
        data = dict(property=self.property.pk, name='test', subject='test')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EmailTemplate.objects.order_by('-created').first().name, 'test')
        self.assertEqual(EmailTemplate.objects.order_by('-created').first().subject, 'test')

    def test_list_email_template(self):
        """
        Ensure we can list assign email template objects.
        """
        EmailTemplate.objects.create(property=self.property, name='test1', subject='test1')
        EmailTemplate.objects.create(property=self.property, name='test2', subject='test2')
        endpoint = reverse('email_templates-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailTemplate.objects.count(), 3)

    def test_put_email_template(self):
        """
        Ensure we can update email template object.
        """
        email_template = EmailTemplate.objects.create(property=self.property, name='test1', subject='test1')
        endpoint = reverse('email_templates-detail', args=[email_template.pk])
        response = self.client.put(endpoint, dict(property=self.property.pk, name='test2', subject='test2'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailTemplate.objects.order_by('-created').first().name, 'test1')
        self.assertEqual(EmailTemplate.objects.order_by('-created').first().subject, 'test1')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(property=self.property.pk, name='test2', subject='test2'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        email_template = EmailTemplate.objects.order_by('-created').first()
        self.assertEqual(email_template.name, 'test2')
        self.assertEqual(email_template.subject, 'test2')

    def test_delete_email_template(self):
        """
        Ensure we can delete email template object.
        """
        email_template = EmailTemplate.objects.create(property=self.property, name='test1', subject='test1')
        endpoint = reverse('email_templates-detail', args=[email_template.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailTemplate.objects.count(), 2)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(EmailTemplate.objects.count(), 1)
