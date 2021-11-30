import datetime

from django.db.models import Q
from django.urls import reverse
from rest_framework import status
from backend.api.models import Survey, Competitor
from backend.api.tests import PropertyLevelBaseTestCase


class SurveyTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(SurveyTests, self).setUp()

    def test_list_survey(self):
        """
        Ensure we can list assign survey objects.
        """
        competitor1 = Competitor.objects.create(property=self.property,
                                                name='{} competitor 1'.format(self.property.name))
        competitor2 = Competitor.objects.create(property=self.property,
                                                name='{} competitor 2'.format(self.property.name))
        survey1 = Survey.objects.create(property=self.property, unit_type='1/1', unit_type_name='A1',
                                        unit_class=Survey.CLASS_ONE_BED, market_rent=1250, effective_rent=1241.67,
                                        concession_amount=100, competitor=competitor1,
                                        date=datetime.datetime(year=2020, month=1, day=1).date())

        Survey.objects.create(property=self.property, unit_type='2/1', unit_type_name='A2',
                              unit_class=Survey.CLASS_TWO_BED, market_rent=1350, effective_rent=1341.67,
                              concession_amount=100, competitor=competitor2,
                              date=datetime.datetime(year=2020, month=2, day=1).date())
        endpoint = reverse('surveys-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], Survey.objects.count())

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, {'competitor_id': competitor1.pk}, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], survey1.id)

    def test_update_surveys(self):
        competitor = Competitor.objects.create(property=self.property, name='{} competitor'.format(self.property.name))

        # create
        date = '2020-02-01'
        updated_surveys = []
        created_surveys = [{'unit_type': '2/1', 'unit_type_name': 'A2', 'unit_class': 'TWO_BED', 'market_rent': 1350.50,
                            'effective_rent': 1342.16, 'concession_amount': 100.10, 'competitor': competitor.id}]
        deleted_surveys = []
        data = dict(date=date, updated_surveys=updated_surveys, created_surveys=created_surveys,
                    deleted_surveys=deleted_surveys)
        endpoint = reverse('surveys-update-surveys')
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        survey = Survey.objects.first()
        self.assertEqual(Survey.objects.count(), 1)
        self.assertEqual(survey.is_first, True)
        self.assertEqual(survey.competitor, competitor)
        self.assertEqual(survey.unit_type, '2/1')
        self.assertEqual(survey.unit_type_name, 'A2')

        # update
        updated_surveys = [{'id': survey.id, 'unit_type': '1/1', 'unit_type_name': 'A1', 'unit_class': 'ONE_BED',
                            'market_rent': 1350.50, 'effective_rent': 1342.16, 'concession_amount': 100.10,
                            'competitor': competitor.id}]
        created_surveys = [{'unit_type': '2/1', 'unit_type_name': 'A2', 'unit_class': 'TWO_BED', 'market_rent': 1450.50,
                            'effective_rent': 1442.16, 'concession_amount': 100.10, 'competitor': competitor.id}]
        deleted_surveys = []
        data = dict(date=date, updated_surveys=updated_surveys, created_surveys=created_surveys,
                    deleted_surveys=deleted_surveys)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Survey.objects.count(), 2)

        survey1 = Survey.objects.filter(id=survey.id).first()
        self.assertEqual(survey1.is_first, True)
        self.assertEqual(survey1.unit_type, '1/1')
        self.assertEqual(survey1.unit_type_name, 'A1')

        survey2 = Survey.objects.filter(~Q(id=survey.id)).first()
        self.assertEqual(survey2.is_first, True)
        self.assertEqual(survey2.unit_type, '2/1')
        self.assertEqual(survey2.unit_type_name, 'A2')

        # delete
        updated_surveys = []
        created_surveys = []
        deleted_surveys = [survey1.id]
        data = dict(date=date, updated_surveys=updated_surveys, created_surveys=created_surveys,
                    deleted_surveys=deleted_surveys)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Survey.objects.count(), 1)
        self.assertEqual(Survey.objects.filter(id=survey1.id).count(), 0)

        # another date same competitor
        date = '2020-01-01'
        updated_surveys = []
        created_surveys = [{'unit_type': '2/1', 'unit_type_name': 'A2', 'unit_class': 'TWO_BED', 'market_rent': 1450.50,
                            'effective_rent': 1442.16, 'concession_amount': 100.10, 'competitor': competitor.id}]
        deleted_surveys = []
        data = dict(date=date, updated=updated_surveys, created_surveys=created_surveys,
                    deleted_surveys=deleted_surveys)
        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Survey.objects.count(), 2)

        survey = Survey.objects.filter(date=datetime.datetime(year=2020, month=1, day=1).date()).first()
        self.assertEqual(survey.is_first, False)
        self.assertEqual(survey.unit_type, '2/1')
        self.assertEqual(survey.unit_type_name, 'A2')
