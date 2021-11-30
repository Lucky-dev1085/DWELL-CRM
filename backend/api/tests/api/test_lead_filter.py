from datetime import datetime, time

import pytz
from django.db.models import Max, Q
from django.urls import reverse
from rest_framework import status

from backend.api.factories import PropertyFactory, LeadFactory, TaskFactory
from backend.api.models import LeadsFilter, LeadsFilterItem, Lead, Task
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.filters import get_filtered_leads


class LeadsFilterTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(LeadsFilterTests, self).setUp()

    def test_create_leads_filter(self):
        """
        Ensure we can create a new leads filter object.
        """
        endpoint = reverse('leads_filter-list')

        data = dict(name='test', property=self.property.pk, filter_items=[dict(compare_field='last_name',
                                                                               compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                                               compare_value=['test'])])
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(LeadsFilter.objects.count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeadsFilter.objects.count(), 1)
        self.assertEqual(LeadsFilter.objects.first().name, 'test')

    def test_list_leads_filter(self):
        """
        Ensure we can list leads filter objects.
        """
        LeadsFilter.objects.create(name='test1', property=self.property)
        LeadsFilter.objects.create(name='test2', property=self.property)
        endpoint = reverse('leads_filter-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(LeadsFilter.objects.count(), 2)

    def test_put_leads_filter(self):
        """
        Ensure we can update leads filter object.
        """
        leadsFilter = LeadsFilter.objects.create(name='test1', property=self.property)
        endpoint = reverse('leads_filter-detail', args=[leadsFilter.pk])
        response = self.client.put(endpoint,
                                   dict(name='test2',
                                        filter_items=[dict(compare_field='last_name',
                                                           compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                           compare_value=['test'])]),
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(LeadsFilter.objects.first().name, 'test1')

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.put(endpoint,
                                   dict(name='test2', property=self.property.pk,
                                        filter_items=[
                                            dict(compare_field='last_name',
                                                 compare_operator=LeadsFilterItem.OPERATOR_IS,
                                                 compare_value=['test'])]),
                                   format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        leadsFilter = LeadsFilter.objects.first()
        self.assertEqual(leadsFilter.name, 'test2')

    def test_delete_leads_filter(self):
        """
        Ensure we can delete leads filter object.
        """
        leadsFilter = LeadsFilter.objects.create(name='test1', property=self.property)
        endpoint = reverse('leads_filter-detail', args=[leadsFilter.pk])
        response = self.client.delete(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(LeadsFilter.objects.count(), 1)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(LeadsFilter.objects.count(), 0)

    def test_get_filtered_leads(self):
        property = PropertyFactory(client=self.m_client, status='ACTIVE')

        for i in range(5):
            LeadFactory(first_name='test', beds=0, owner=None, property=property, tasks=[])
            LeadFactory(owner=None, beds=5, property=property, tasks=[])
            lead = LeadFactory(owner=None, beds=0, property=property, tasks=[])
            TaskFactory(property=self.property, due_date=datetime(2020, 1, 5),
                        owner=self.user, actor=self.user, lead=lead, type=Task.TYPE_FOLLOW_FIRST, status='OPEN')
            LeadFactory(owner=self.user, beds=0, property=property, tasks=[])

        leads = Lead.objects.filter(property=property)
        # text operator (first name)
        filter = [{'compare_field': 'first_name', 'compare_operator': 'IS', 'compare_value': ['test']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(first_name='test').count())

        filter = [{'compare_field': 'first_name', 'compare_operator': 'IS_NOT', 'compare_value': ['test']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.exclude(first_name='test').count())

        filter = [{'compare_field': 'first_name', 'compare_operator': 'STARTS_WITH', 'compare_value': ['tes']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(first_name__startswith='tes').count())

        filter = [{'compare_field': 'first_name', 'compare_operator': 'ENDS_WITH', 'compare_value': ['est']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(first_name__endswith='est').count())

        # number operator (days to move-in)
        filter = [{'compare_field': 'beds', 'compare_operator': 'IS', 'compare_value': [5]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(beds=5).count())

        filter = [{'compare_field': 'beds', 'compare_operator': 'IS_BETWEEN', 'compare_value': [3, 7]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(beds__gte=3, beds__lte=7).count())

        filter = [{'compare_field': 'beds', 'compare_operator': 'IS_LESS_THAN', 'compare_value': [5]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(beds__lt=5).count())

        filter = [{'compare_field': 'beds', 'compare_operator': 'IS_GREATER_THAN', 'compare_value': [3]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(beds__gt=3).count())

        filter = [{'compare_field': 'beds', 'compare_operator': 'IS_NOT_SET', 'compare_value': []}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(beds__isnull=True).count())

        # date operator (next task due date)
        leads_tasks = leads.annotate(task_date=Max('tasks__due_date',
                                                   filter=Q(tasks__status='OPEN') & ~Q(tasks__type='TOUR')))
        date = datetime.strptime('2020-01-05', '%Y-%m-%d')
        day_min = datetime.combine(date, time.min).replace(tzinfo=pytz.timezone('America/Phoenix'))
        day_max = datetime.combine(date, time.max).replace(tzinfo=pytz.timezone('America/Phoenix'))
        filter = [{'compare_field': 'next_task_due_date', 'compare_operator': 'IS_ON', 'compare_value': ['2020-01-05']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads_tasks.filter(task_date__range=(day_min, day_max)).count())

        start_date = datetime.strptime('2020-01-01', '%Y-%m-%d').replace(
            tzinfo=pytz.timezone('America/Phoenix'))
        end_date = datetime.combine(datetime.strptime('2020-01-10', '%Y-%m-%d'),
                                    time.max).replace(tzinfo=pytz.timezone('America/Phoenix'))
        filter = [{'compare_field': 'next_task_due_date', 'compare_operator': 'IS_BETWEEN',
                   'compare_value': ['2020-01-01', '2020-01-10']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads_tasks.filter(task_date__range=(start_date, end_date)).count())

        date = datetime.strptime('2020-01-05', '%Y-%m-%d').replace(tzinfo=pytz.timezone('America/Phoenix'))
        filter = [{'compare_field': 'next_task_due_date', 'compare_operator': 'IS_ON_OR_BEFORE',
                   'compare_value': ['2020-01-05']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads_tasks.filter(task_date__lte=date).count())

        filter = [{'compare_field': 'next_task_due_date', 'compare_operator': 'IS_ON_OR_AFTER',
                   'compare_value': ['2020-01-05']}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads_tasks.filter(task_date__gte=date).count())

        filter = [{'compare_field': 'next_task_due_date', 'compare_operator': 'IS_NOT_SET',
                   'compare_value': []}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads_tasks.filter(task_date__isnull=True).count())

        # selection operator (owner)
        filter = [{'compare_field': 'owner', 'compare_operator': 'IS', 'compare_value': [self.user.id]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(owner_id=self.user.id).count())

        filter = [{'compare_field': 'owner', 'compare_operator': 'IS_NOT', 'compare_value': [self.user.id]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.exclude(owner_id=self.user.id).count())

        filter = [{'compare_field': 'owner', 'compare_operator': 'IS_ONE_OF', 'compare_value': [self.user.id,
                                                                                                self.c_admin.id]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(owner_id__in=[self.user.id, self.c_admin.id]).count())

        filter = [{'compare_field': 'owner', 'compare_operator': 'IS_NOT_SET', 'compare_value': []}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(), leads.filter(owner_id__isnull=True).count())

        # all
        filter = [{'compare_field': 'first_name', 'compare_operator': 'IS_NOT', 'compare_value': ['test']},
                  {'compare_field': 'owner', 'compare_operator': 'IS_NOT_SET', 'compare_value': []},
                  {'compare_field': 'beds', 'compare_operator': 'IS_LESS_THAN', 'compare_value': [5]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ALL', property)
        self.assertEqual(filtered_queryset.count(),
                         leads.exclude(first_name='test').filter(owner__isnull=True, beds__lt=5).count())

        # any
        filter = [{'compare_field': 'first_name', 'compare_operator': 'IS', 'compare_value': ['test']},
                  {'compare_field': 'owner', 'compare_operator': 'IS', 'compare_value': [self.user.id]},
                  {'compare_field': 'beds', 'compare_operator': 'IS', 'compare_value': [0]}]
        filtered_queryset = get_filtered_leads(leads, filter, 'ANY', property)
        self.assertEqual(filtered_queryset.count(),
                         leads.filter(Q(first_name='test') | Q(owner_id=self.user.id) | Q(beds=0)).count())
