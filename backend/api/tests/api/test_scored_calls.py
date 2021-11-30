import random
from json import loads
from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from backend.api.models import ScoredCall, CallScoringQuestion
from backend.api.tests import CallScoringBaseTestBase


class ScoredCallsTests(CallScoringBaseTestBase):
    def test_list_scored_calls(self):
        """
        Ensure we list all scored calls
        """
        self.client.force_authenticate(user=self.call_scorer)
        endpoint = reverse('scored_calls-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        content = loads(response.content)
        print(content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ScoredCall.objects.count(), content['count'])

    def test_create_scored_calls(self):
        """
        Ensure that we can score the calls
        """
        call = self.property.calls.filter(scored_calls=None).first()
        yes_questions = list(set(random.choices(CallScoringQuestion.objects.values_list('id', flat=True), k=3)))
        omitted_questions = list(set(random.choices(
            CallScoringQuestion.objects.exclude(pk__in=yes_questions).values_list('id', flat=True)
        )))

        data = dict(property=self.property.pk, call=call.pk, questions=yes_questions,
                    omitted_questions=omitted_questions)
        endpoint = reverse('scored_calls-list')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(call.scored_calls.count(), 1)

        scored_call = call.scored_calls.first()
        self.assertListEqual(sorted(list(scored_call.questions.values_list('id', flat=True))), sorted(yes_questions))
        self.assertListEqual(sorted(list(scored_call.omitted_questions.values_list('id', flat=True))),
                             sorted(omitted_questions))
        self.assertTrue(scored_call.scored_at > timezone.now() - timedelta(seconds=10))

    def test_require_rescore(self):
        """
        Test Require rescore API
        """
        scored_call = self.property.scored_calls.first()
        prev_score = scored_call.score

        data = dict(reason='Q1 and Q2 is not scored incorrectly.', date_period='THIS_MONTH', type='property',
                    compare_value='PREVIOUS_PERIOD')
        endpoint = reverse('scored_calls-require-rescore',  args=[scored_call.pk])

        header = {'HTTP_X_NAME': 'test1'}
        self.client.post(endpoint, data, format='json', **header)
        scored_call = self.property.scored_calls.get(pk=scored_call.pk)
        self.assertEqual(scored_call.rescore_reason, 'Q1 and Q2 is not scored incorrectly.')
        self.assertEqual(scored_call.rescore_status, 'REQUIRED')
        self.assertEqual(scored_call.prev_score, prev_score)

    def test_rescore_call(self):
        """
        Test rescore call API
        """
        scored_call = self.property.scored_calls.first()
        scored_call.reason = 'Quality issue.'
        scored_call.prev_score = scored_call.score
        scored_call.rescore_status = 'REQUIRED'
        scored_call.call_scorer = self.user
        scored_call.save()

        yes_questions = list(set(random.choices(CallScoringQuestion.objects.values_list('id', flat=True), k=3)))
        omitted_questions = list(set(random.choices(
            CallScoringQuestion.objects.exclude(pk__in=yes_questions).values_list('id', flat=True)
        )))

        data = dict(questions=yes_questions, omitted_questions=omitted_questions, id=scored_call.id)
        endpoint = reverse('scored_calls-detail',  args=[scored_call.pk])

        header = {'HTTP_X_NAME': 'test1'}
        self.client.put(endpoint, data, format='json', **header)
        scored_call = self.property.scored_calls.get(pk=scored_call.pk)
        self.assertEqual(scored_call.rescore_status, 'RESCORED')
        self.assertTrue(scored_call.scored_at > timezone.now() - timedelta(seconds=10))
