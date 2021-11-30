from json import loads
from django.urls import reverse
from django.utils import timezone
from unittest.mock import patch

from rest_framework import status

from backend.api.models import Conversion, Lead
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import TaskFactory, EmailMessageFactory


class ConversionTests(PropertyLevelBaseTestCase):
    def setUp(self):
        self.client.logout()
        super(ConversionTests, self).setUp()

    def test_create_conversion(self):
        """
        Ensure we can create a new conversion object.
        """
        endpoint = reverse('conversion-list')
        data = dict(first_name='test1', last_name='user1', email='test1@gmail.com', type=Conversion.APPLY_NOW,
                    phone_number='45321343', unit_id='A1B1')
        header = {'HTTP_X_DOMAIN': self.property.domain}
        response = self.client.post(endpoint, data=data, **header)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        content = loads(response.content)
        self.assertEqual(Conversion.objects.get(pk=content['id']).email, 'test1@gmail.com')
        self.assertEqual(Conversion.objects.get(pk=content['id']).property.pk, self.property.pk)

        self.assertEqual(Lead.objects.count(), 1)
        lead = Lead.objects.first()
        self.assertEqual(lead.email, 'test1@gmail.com')
        self.assertEqual(lead.property.pk, self.property.pk)

        # Testing "delete opened tasks" for lost lead.
        lead.status = Lead.LEAD_LOST
        lead.save()
        TaskFactory(property=self.property, lead=lead, status='OPEN')

        self.assertEqual(lead.tasks.count(), 1)

        self.client.post(endpoint, data=data, **header)

        # The new conversion should be created but new lead should not be created.
        self.assertEqual(Conversion.objects.count(), 2)
        self.assertEqual(Lead.objects.count(), 1)

        # Should remove the tasks and reset the status of lead to Active
        self.assertEqual(lead.tasks.count(), 0)

        lead = Lead.objects.get(pk=lead.pk)
        self.assertEqual(lead.status, Lead.LEAD_ACTIVE)
        self.assertEqual(lead.stage, Lead.STAGE_INQUIRY)

    def test_guest_card_email_without_nylas(self):
        """
        Ensure guest card email without nylas
        """
        endpoint = reverse('conversion-list')
        data = dict(first_name='test1', last_name='user1', email='test1@gmail.com', type=Conversion.APPLY_NOW,
                    phone_number='45321343', unit_id='A1B1')
        header = {'HTTP_X_DOMAIN': self.property.domain}

        self.property.nylas_access_token = None
        self.property.save()

        with patch('backend.api.serializer.conversion.send_guest_card_emails_without_nylas.apply_async') as mock_method:
            self.client.post(endpoint, data=data, **header)
            self.assertTrue(mock_method.called)

    def test_guest_card_email_nylas(self):
        """
        Ensure guest card email with nylas
        """
        endpoint = reverse('conversion-list')
        data = dict(first_name='test1', last_name='user1', email='test1@gmail.com', type=Conversion.APPLY_NOW,
                    phone_number='45321343', unit_id='A1B1')
        header = {'HTTP_X_DOMAIN': self.property.domain}

        self.property.nylas_access_token = 'nylas access token'
        self.property.save()

        with patch('backend.api.serializer.conversion.send_guest_card_email.apply_async') as mock_method:
            self.client.post(endpoint, data=data, **header)
            self.assertTrue(mock_method.called)

    def test_prevent_multiple_guest_card_email_per_day(self):
        """
        Ensure we don't send more than one welcome email per day
        """
        endpoint = reverse('conversion-list')
        data = dict(first_name='test1', last_name='user1', email='test1@gmail.com', type=Conversion.APPLY_NOW,
                    phone_number='45321343', unit_id='A1B1')

        lead_fields = data.copy()
        lead_fields.pop('type', None)
        lead_fields.pop('unit_id', None)
        lead = Lead.objects.create(property=self.property, **lead_fields)
        header = {'HTTP_X_DOMAIN': self.property.domain}

        self.property.nylas_access_token = 'nylas access token'
        self.property.save()

        EmailMessageFactory(is_guest_card_email=True, property=self.property, date=timezone.now(), lead=lead)

        with patch('backend.api.serializer.conversion.send_guest_card_email.apply_async') as mock_method:
            self.client.post(endpoint, data=data, **header)
            self.assertFalse(mock_method.called)
