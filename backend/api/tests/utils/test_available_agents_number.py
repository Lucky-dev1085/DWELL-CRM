from django.urls import reverse

from backend.api.factories import PropertyFactory, ChatProspectFactory
from backend.api.models import User
from django.utils.http import urlencode
from backend.api.tests import PropertyLevelBaseTestCase


def get_available_agents_count(property):
    return User.objects.filter(
        last_property=property,
        is_available=True,
        is_team_account=True).count()


class AvailableAgentsNumberUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(AvailableAgentsNumberUtilsTests, self).setUp()
        self.user.is_available = True
        self.user.is_team_account = True
        self.user.last_property = self.property
        self.user.save()

        self.other_property = PropertyFactory(
            name='test2', domain='http://test2.com', creator=self.user, client=self.m_client, is_released=True)
        self.prospect = ChatProspectFactory(property=self.property)

    def test_chat_settings(self):
        data = dict(property=self.property.pk)
        header = {'HTTP_X_NAME': 'test1', 'HTTP_CLIENT_ID': str(self.property.client_external_id)}
        query_kwargs = {'uuid': str(self.prospect.external_id)}
        endpoint = f'{reverse("chat_settings")}?{urlencode(query_kwargs)}'

        response = self.client.get(endpoint, data, format='json', **header)
        self.assertEqual(response.data['available_agents_number'], 1)

        self.user.last_property = self.other_property
        self.user.save()

        response = self.client.get(endpoint, data, format='json', **header)
        self.assertEqual(response.data['available_agents_number'], 0)

    def test_is_available_changed(self):
        endpoint = reverse('user-detail', args=[self.user.pk])
        header = {'HTTP_CLIENT_ID': str(self.property.client_external_id)}

        response = self.client.get(endpoint)
        self.assertEqual(response.data['is_available'], True)
        available_agents_count = get_available_agents_count(self.property)
        self.assertEqual(available_agents_count, 1)

        response = self.client.patch(endpoint, dict(is_available=False), **header)
        self.assertEqual(response.data['is_available'], False)
        available_agents_count = get_available_agents_count(self.property)
        self.assertEqual(available_agents_count, 0)

    def test_last_property(self):
        endpoint = reverse('user-detail', args=[self.user.pk])
        header = {'HTTP_CLIENT_ID': str(self.property.client_external_id)}

        available_agents_count = get_available_agents_count(self.property)
        self.assertEqual(available_agents_count, 1)

        self.client.patch(endpoint, dict(last_property=self.other_property.pk), **header)
        available_agents_count = get_available_agents_count(self.property)
        self.assertEqual(available_agents_count, 0)
