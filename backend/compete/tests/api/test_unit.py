import pytz
from json import loads
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.models import Property


TZ = pytz.timezone('America/Phoenix')


class UnitTests(BaseTestCase):
    def test_property_unit_list(self):
        """
        Test property unit list API
        """
        property = Property.objects.first()

        endpoint = reverse('property_unit-list', kwargs=dict(property_pk=property.id))
        response = self.client.get(endpoint)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = loads(response.content)

        self.assertEqual(content['count'], property.units.count())
