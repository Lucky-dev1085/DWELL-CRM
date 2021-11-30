from django.urls import reverse
from rest_framework import status
from backend.api.models import Portfolio
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import ClientFactory, PropertyFactory


class PortfolioTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(PortfolioTests, self).setUp()

    def test_list_portfolios(self):
        """
        Ensure we can list assign portfolio objects.
        """
        m_client = ClientFactory(status='ACTIVE', creator=self.user)
        property = PropertyFactory(creator=self.user, client=m_client)
        mt_portfolio = Portfolio.objects.create(name='Mark Taylor portfolio', type=Portfolio.TYPE_MARK_TAYLOR)
        mt_portfolio.properties.set([self.property.pk, property.pk])

        s_portfolio = Portfolio.objects.create(name='Submarket portfolio', type=Portfolio.TYPE_SUBMARKET)
        s_portfolio.properties.set([self.property.pk])

        am_portfolio = Portfolio.objects.create(name='Asset Manager portfolio', type=Portfolio.TYPE_ASSET_MANAGER)
        am_portfolio.properties.set([property.pk])
        endpoint = reverse('portfolios-list')

        self.user.has_advanced_reports_access = False
        self.user.save()
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.user.has_advanced_reports_access = True
        self.user.save()
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Portfolio.objects.count(), 3)
