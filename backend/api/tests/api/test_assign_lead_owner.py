from django.urls import reverse
from rest_framework import status
from backend.api.models import AssignLeadOwners
from backend.api.tests import PropertyLevelBaseTestCase


class AssignLeadOwnerTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(AssignLeadOwnerTests, self).setUp()

    def test_create_assign_lead_owner(self):
        """
        Ensure we can create a new assign lead owners object.
        """
        endpoint = reverse('assign_lead_owners-list')
        data = dict(property=self.property.pk, monday=self.user.pk)
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(AssignLeadOwners.objects.count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AssignLeadOwners.objects.count(), 1)
        self.assertEqual(AssignLeadOwners.objects.get(property=self.property.pk).monday, self.user)

    def test_list_assign_lead_owner(self):
        """
        Ensure we can list assign lead owners objects.
        """
        AssignLeadOwners.objects.create(property=self.property)
        endpoint = reverse('assign_lead_owners-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AssignLeadOwners.objects.count(), 1)

    def test_put_assign_lead_owner(self):
        """
        Ensure we can update assign lead owners object.
        """
        assign_lead_owners = AssignLeadOwners.objects.create(property=self.property)
        endpoint = reverse('assign_lead_owners-detail', args=[assign_lead_owners.pk])
        response = self.client.put(endpoint, dict(property=self.property.pk, tuesday=self.user.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(AssignLeadOwners.objects.first().tuesday, None)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint, dict(property=self.property.pk, tuesday=self.user.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assign_lead_owners = AssignLeadOwners.objects.first()
        self.assertEqual(assign_lead_owners.tuesday, self.user)

    def test_delete_assign_lead_owner(self):
        """
        Ensure we can delete assign lead owners object.
        """
        assign_lead_owners = AssignLeadOwners.objects.create(property=self.property)
        endpoint = reverse('assign_lead_owners-detail', args=[assign_lead_owners.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(AssignLeadOwners.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AssignLeadOwners.objects.count(), 0)
