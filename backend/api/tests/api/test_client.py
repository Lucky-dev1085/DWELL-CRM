from django.urls import reverse
from rest_framework import status
from backend.api.models import Client
from backend.api.factories import ClientFactory
from backend.api.tests import BaseTestCase


class ClientTests(BaseTestCase):
    def setUp(self):
        super(ClientTests, self).setUp()

    def test_create_client(self):
        """
        Ensure we can create a new client object.
        """
        endpoint = reverse('client-list')
        data = dict(name='test', status='ACTIVE')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.get().name, 'test')

    def test_list_client(self):
        """
        Ensure we can list client objects.
        """
        ClientFactory(status='ACTIVE', creator=self.user)
        ClientFactory(status='ACTIVE', creator=self.user)
        endpoint = reverse('property-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Client.objects.count(), 2)

    def test_put_client(self):
        """
        Ensure we can update client object.
        """
        client = ClientFactory(status='ACTIVE', creator=self.user)
        endpoint = reverse('client-detail', args=[client.pk])
        response = self.client.put(endpoint, dict(name=client.name, status='INACTIVE'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        client1 = Client.objects.first()
        self.assertEqual(client1.name, client.name)
        self.assertEqual(client1.status, 'INACTIVE')

    def test_delete_client(self):
        """
        Ensure we can delete client object.
        """
        client = ClientFactory(status='ACTIVE', creator=self.user)
        endpoint = reverse('client-detail', args=[client.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 0)

    def test_list_client_access_by_ll_admin(self):
        client = ClientFactory(status='ACTIVE', creator=self.user)
        ClientFactory(status='INACTIVE', creator=self.user)

        self.user.clients.add(client)
        endpoint = reverse('client-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

    def test_list_client_access_by_c_admin(self):
        client = ClientFactory(creator=self.user)
        self.customer.clients.add(client)
        self.c_admin.clients.add(client)
        self.client.force_authenticate(user=self.c_admin)

        endpoint = reverse('client-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 1)
        self.assertEqual(response.data.get('results')[0].get('name'), client.name)

    def test_list_client_access_by_g_admin(self):
        client1 = ClientFactory(creator=self.user)
        client2 = ClientFactory(creator=self.user)

        self.client.force_authenticate(user=self.g_admin)

        self.customer.clients.set([client1, client2])
        self.g_admin.clients.set([client1, client2])
        endpoint = reverse('client-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_should_allow_only_list_action(self):
        client = ClientFactory(status='ACTIVE', creator=self.user)

        self.client.force_authenticate(user=self.g_admin)

        # list
        endpoint = reverse('client-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Client.objects.count(), 1)

        # create
        data = dict(name='test', status='ACTIVE')
        endpoint = reverse('client-list')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Client.objects.count(), 1)

        # delete
        endpoint = reverse('client-detail', args=[client.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Client.objects.count(), 1)

        # update
        endpoint = reverse('client-detail', args=[client.pk])
        response = self.client.put(endpoint, dict(name='test2', status='INACTIVE'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        client1 = Client.objects.first()
        self.assertEqual(client1.name, client.name)
        self.assertEqual(client1.status, 'ACTIVE')
