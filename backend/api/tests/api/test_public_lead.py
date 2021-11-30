from django.urls import reverse
from rest_framework import status
from backend.api.models import Lead, VendorAuth, ProspectSource, ReasonForMoving, PetType
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import LeadFactory, TaskFactory


class PublicLeadTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(PublicLeadTests, self).setUp()
        ProspectSource.objects.create(property=self.property, name='Apartment.com')
        self.property.shared_email = 'bellagio@proeprty.com'
        self.property.save()
        self.vendor = VendorAuth.objects.create(source='Apartment.com')
        self.header = {'HTTP_X_EMAIL': 'bellagio@proeprty.com', 'HTTP_CLIENT_ID': self.vendor.client_id,
                       'HTTP_SECRET_KEY': self.vendor.secret_key}
        self.client.logout()

        ReasonForMoving.objects.create(property=self.property, reason='EMPLOYMENT')
        PetType.objects.create(property=self.property, name='DOG')

    def test_create_lead(self):
        """
        Ensure we can create a new lead.
        """
        endpoint = reverse('public_lead-list')

        data = dict(
            property=self.property.pk, first_name='test1', last_name='test1', comments='comments',
            moving_reason='EMPLOYMENT', pet_type='DOG'
        )
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Lead.objects.count(), 0)

        response = self.client.post(endpoint, data, format='json', **self.header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)
        lead = Lead.objects.first()
        self.assertEqual(lead.first_name, 'test1')
        self.assertEqual(lead.last_name, 'test1')
        self.assertEqual(lead.source.name, 'Apartment.com')
        self.assertEqual(lead.moving_reason.reason, 'EMPLOYMENT')
        self.assertEqual(lead.pet_type.name, 'DOG')
        self.assertEqual(lead.vendor, self.vendor)

        # Testing "delete opened tasks" for lost lead.
        lead.status = Lead.LEAD_LOST
        lead.save()
        TaskFactory(property=self.property, lead=lead, status='OPEN')

        self.assertEqual(lead.tasks.count(), 1)

        # duplicate check
        response = self.client.post(endpoint, data, format='json', **self.header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)

        # Should remove the tasks and reset the status of lead to Active
        self.assertEqual(lead.tasks.count(), 0)

        lead = Lead.objects.get(pk=lead.pk)
        self.assertEqual(lead.status, 'ACTIVE')

    def test_list_lead(self):
        """
        Ensure we can list leads.
        """
        LeadFactory(property=self.property)
        LeadFactory(property=self.property, vendor=self.vendor)
        LeadFactory(property=self.property, vendor=self.vendor)
        endpoint = reverse('public_lead-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(endpoint, **self.header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = response.json()
        self.assertEqual(content['count'], 2)

    def test_put_lead(self):
        """
        Ensure we can update lead.
        """
        lead = LeadFactory(property=self.property, stage='INQUIRY', vendor=self.vendor)
        endpoint = reverse('public_lead-detail', args=[lead.pk])
        response = self.client.put(endpoint, dict(stage='TOUR_SET'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Lead.objects.first().stage, 'INQUIRY')

        body = dict(
            stage='TOUR_SET', first_name='test', last_name='user', moving_reason='EMPLOYMENT', pet_type='DOG'
        )
        response = self.client.put(endpoint, body, **self.header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead = Lead.objects.first()
        self.assertEqual(lead.stage, 'TOUR_SET')
        self.assertEqual(lead.first_name, 'test')
        self.assertEqual(lead.last_name, 'user')
        self.assertEqual(lead.moving_reason.reason, 'EMPLOYMENT')
        self.assertEqual(lead.pet_type.name, 'DOG')

    def test_delete_lead(self):
        """
        Ensure we can not delete lead object using public API.
        """
        lead = LeadFactory(property=self.property)
        endpoint = reverse('public_lead-detail', args=[lead.pk])

        response = self.client.delete(endpoint, **self.header)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_should_not_list_task(self):
        """
        External vendor can not list the task
        """
        endpoint = reverse('task-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
