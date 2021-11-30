from json import loads
from django.urls import reverse
from rest_framework import status

from backend.api.models import User, Customer, Property, Client
from backend.api.factories import UserFactory, PropertyFactory, ClientFactory
from backend.api.tests import PropertyLevelBaseTestCase


class CustomerTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(CustomerTests, self).setUp()
        client = ClientFactory()
        property = PropertyFactory(client=client)
        self.data = dict(
            user=dict(
                first_name='customer',
                last_name='admin',
                email='customermadin@gmail.com',
                password='password',
                status='ACTIVE'
            ),
            properties=[property.pk],
            clients=[client.pk],
            customer_name='Mark Taylor'
        )

    def test_create_customer_permission_check(self):
        """
        Ensure generic and customer admin are not able to create customer
        :return:
        """
        self.client.force_authenticate(user=self.g_admin)
        endpoint = reverse('customer-list')
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.c_admin)
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_customer(self):
        """
        Ensure we can create a new customer object.
        """
        endpoint = reverse('customer-list')
        response = self.client.post(endpoint, data=self.data, format='json')

        print(response.content)
        print(response)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        content = loads(response.content)
        self.assertEqual(User.objects.get(pk=content['user']['id']).first_name, 'customer')
        self.assertEqual(Customer.objects.get(pk=content['id']).customer_name, 'Mark Taylor')

    def test_list_customer(self):
        """
        Ensure we can list customer objects.
        """
        endpoint = reverse('customer-list')
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)
        self.assertEqual(content['count'], 1)
        self.assertEqual(content['results'][0]['customer_name'], self.customer.customer_name)

    def test_put_customer(self):
        """
        Ensure we can update customer object.
        """
        endpoint = reverse('customer-detail', args=[self.customer.pk])
        user = dict(email='test3@gmail.com', role=User.C_ADMIN, status='ACTIVE', id=self.c_admin.pk)
        data = dict(user=user, customer_name='New Customer', properties=[self.property.pk], clients=[self.m_client.pk])
        response = self.client.put(endpoint, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='test3@gmail.com')
        customer = Customer.objects.get(pk=self.customer.pk)
        self.assertEqual(user.role, User.C_ADMIN)
        self.assertEqual(user.status, 'ACTIVE')
        self.assertEqual(customer.customer_name, 'New Customer')

    def test_delete_customer(self):
        """
        Ensure all clients, properties, users of customer should be deleted when customer is removed.
        """
        self.customer.properties.add(self.property)
        self.customer.clients.add(self.property.client)
        user1 = UserFactory(customer=self.customer)
        user2 = UserFactory(customer=self.customer)
        endpoint = reverse('customer-detail', args=[self.customer.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.c_admin.pk).exists())
        self.assertFalse(Customer.objects.filter(pk=self.customer.pk).exists())
        self.assertFalse(User.objects.filter(pk=user1.pk).exists())
        self.assertFalse(User.objects.filter(pk=user2.pk).exists())
        self.assertFalse(Property.objects.filter(pk=self.property.pk).exists())
        self.assertFalse(Client.objects.filter(pk=self.property.client.pk).exists())

    # def test_properties_and_clients_should_unique_between_customers(self):
    #     """
    #     Ensure clients and properties should not be overlapped between customers.
    #     :return:
    #     """
    #     client = ClientFactory()
    #     property = PropertyFactory(client=client)
    #     customer = CustomerFactory()
    #     customer.clients.add(client)
    #     customer.properties.add(property)
    #
    #     endpoint = reverse('customer-list')
    #     self.data['clients'] = [client.pk]
    #     self.data['properties'] = [property.pk]
    #     response = self.client.post(endpoint, data=self.data, format='json')
    #
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('clients', loads(response.content).keys())
