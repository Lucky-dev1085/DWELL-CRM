from django.urls import reverse

from rest_framework import status
from backend.api.models import Lead, ChatProspect
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import ChatProspectFactory


class ProspectChatTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ProspectChatTests, self).setUp()

    def test_text_me_api_should_create_lead(self):
        endpoint = reverse('text_me')

        prospect = ChatProspectFactory(property=self.property)

        data = dict(prospect=prospect.external_id, first_name='Testo', last_name='User', phone_number='(450) 419-3828')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lead.objects.count(), 0)

        header = {'HTTP_CLIENT_ID': self.property.client_external_id}
        response = self.client.post(endpoint, data, format='json', **header)
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        lead = Lead.objects.filter(first_name='Testo', last_name='User').first()
        self.assertEqual(lead.phone_number, '(450) 419-3828')

        prospect = ChatProspect.objects.get(id=prospect.id)
        self.assertEqual(prospect.lead.id, lead.id)

    def test_text_me_api_should_handle_duplicated_lead(self):
        endpoint = reverse('text_me')

        prospect = ChatProspectFactory(property=self.property)
        old_lead = Lead.objects.create(
            first_name='Testo', last_name='User', phone_number='(450) 111-1111', property=self.property
        )

        data = dict(prospect=prospect.external_id, first_name='chao', last_name='User', phone_number='(450) 111-1111')
        header = {'HTTP_CLIENT_ID': self.property.client_external_id}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        lead = Lead.objects.filter(first_name='chao', last_name='User', property=self.property).first()
        self.assertEqual(lead.id, old_lead.id)
        self.assertEqual(lead.phone_number, '(450) 111-1111')
        self.assertEqual(lead.first_name, 'chao')
