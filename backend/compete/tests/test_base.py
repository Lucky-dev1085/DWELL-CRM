from django.urls import include, path

from backend.api.tests.test_base import PropertyLevelBaseTestCase
from backend.compete.management.commands.compete_initial_data import generate_compete_demo_data


class BaseTestCase(PropertyLevelBaseTestCase):
    urlpatterns = [
        path('api/v1/compete/', include('backend.compete.urls')),
    ]

    def setUp(self):
        super(BaseTestCase, self).setUp()
        generate_compete_demo_data(properties_limit=3)


class MockResponse(object):

    def __init__(self, json_data=None, content=None, status_code=None, text=None):
        self.json_data = json_data
        self.content = content
        self.status_code = status_code
        self.text = text

    def json(self):
        return self.json_data
