from json import loads
from django.urls import reverse
from rest_framework import status

from backend.api.models import User, Client, Property
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import UserFactory, PropertyFactory


class UserTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(UserTests, self).setUp()
        self.data = dict(
            first_name='test3', last_name='test3', email='test3@gmail.com', password='password123psswrd',
            role=User.LL_ADMIN, properties=[self.property.pk], clients=[self.m_client.pk], status='ACTIVE',
            customer=None
        )

    def test_create_ll_admin(self):
        """
        Ensure only LL admins are able to create LL admin
        """
        endpoint = reverse('user-list')
        self.client.force_authenticate(self.c_admin)
        response = self.client.post(endpoint, data=self.data, format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(self.p_admin)
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(self.user)
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 5)
        self.assertEqual(User.objects.get(email='test3@gmail.com').first_name, 'test3')

    def test_create_c_admin_by_ll_admin(self):
        """
        Ensure customer field is required when it's created by LL admin
        :return:
        """
        endpoint = reverse('user-list')
        self.data['role'] = User.C_ADMIN
        self.data['customer'] = None

        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.data['customer'] = self.customer.pk
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_c_admin_by_c_admin(self):
        """
        Ensure that customer admin can only update his account but not able to create another customer account
        :return:
        """
        endpoint = reverse('user-list')
        self.data['role'] = User.C_ADMIN

        self.client.force_authenticate(self.c_admin)
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        endpoint = reverse('user-detail', args=[self.c_admin.pk])
        response = self.client.patch(endpoint, data=dict(phone_number='1432545343'), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_user_by_g_admin(self):
        """
        Ensure generic user is not able to create user
        :return:
        """
        endpoint = reverse('user-list')
        self.data['role'] = User.C_ADMIN

        self.client.force_authenticate(self.g_admin)
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_change_role_to_ll_admin_should_have_full_access(self):
        """
        Ensure changing role to Dwell Admin should have access to all properties / clients.
        :return:
        """
        endpoint = reverse('user-detail', args=[self.g_admin.pk])
        self.client.force_authenticate(self.user)
        response = self.client.patch(endpoint, data=dict(role=User.LL_ADMIN), format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(pk=self.g_admin.pk).clients.count(), Client.objects.count())
        self.assertEqual(User.objects.get(pk=self.g_admin.pk).properties.count(), Property.objects.count())

    def test_create_g_admin_by_ll_admin(self):
        """
        Ensure that generic admin creation require customer field when it's created by ll admin
        :return:
        """
        endpoint = reverse('user-list')
        self.data['role'] = User.G_ADMIN
        self.data['customer'] = None

        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.data['customer'] = self.customer.pk
        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_g_admin_by_p_admin(self):
        """
        Ensure that customer will be autofilled of current user when it's created by Customer or Generic admin
        :return:
        """
        endpoint = reverse('user-list')
        self.data['role'] = User.G_ADMIN
        self.data['customer'] = self.p_admin.customer.pk

        self.client.force_authenticate(self.p_admin)

        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        content = loads(response.content)
        self.assertEqual(content['customer'], self.p_admin.customer.pk)

    def test_generic_admin_permission_limit(self):
        """
        Ensure generic admin does not have any permission of Users CRUD actions except for current_user and team_mates
        API
        :return:
        """
        self.client.force_authenticate(self.g_admin)
        endpoint = reverse('user-list')
        response = self.client.get(endpoint, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(endpoint, data=self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        endpoint = reverse('user-detail', args=[self.g_admin.pk])
        response = self.client.get(endpoint, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        endpoint = reverse('user-detail', args=[self.g_admin.pk])
        response = self.client.patch(endpoint, data=dict(first_name='Testo'), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        endpoint = reverse('user-current-user')
        response = self.client.get(endpoint, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        endpoint = reverse('user-team-members')
        response = self.client.get(endpoint, HTTP_X_NAME=self.property.external_id, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_user(self):
        """
        Ensure we can list user objects.
        :return:
        """
        user1 = UserFactory()
        user2 = UserFactory()
        property_1 = PropertyFactory(client=self.m_client)
        property_2 = PropertyFactory(client=self.m_client)
        user1.client.add(self.m_client)
        user2.client.add(self.m_client)
        user1.properties.add(property_1)
        user2.properties.add(property_2)

        endpoint = reverse('user-list')
        response = self.client.get(endpoint, HTTP_X_NAME=property_1.external_id)
        content = loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in content['results']]
        self.assertIn(user1.pk, ids)

        response = self.client.get(endpoint)
        content = loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in content['results']]
        self.assertIn(user1.pk, ids)
        self.assertIn(user2.pk, ids)

    def test_put_user(self):
        """
        Ensure we can update user object.
        """
        user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')

        endpoint = reverse('user-detail', args=[user.pk])
        response = self.client.put(endpoint,
                                   dict(email='test3@gmail.com', role=User.C_ADMIN, properties=[self.property.pk],
                                        status='INACTIVE'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='test3@gmail.com')
        self.assertEqual(user.role, User.C_ADMIN)
        self.assertEqual(user.status, 'INACTIVE')

    def test_delete_user(self):
        """
        Ensure we can delete user object.
        """
        user = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')

        endpoint = reverse('user-detail', args=[user.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 4)
