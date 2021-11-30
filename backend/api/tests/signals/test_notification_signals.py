import datetime

from django.urls import reverse

from backend.api.models import Notification, Lead, Task, User
from backend.api.tests import LeadLevelBaseTestCase
from backend.api.factories import UserFactory


class NotificationSignalsTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(NotificationSignalsTests, self).setUp()
        self.actor = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')

        self.owner = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')
        self.owner.properties.add(self.property)

    def test_task_notification(self):
        # owner == actor
        data = dict(property=self.property.pk, type='FIRST_FOLLOWUP', status='OPEN', lead=self.lead.pk,
                    due_date=datetime.date.today() + datetime.timedelta(days=1),
                    actor=self.user.pk, owner=self.user.pk)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Notification.objects.count(), 0)

        # owner != actor
        data = dict(property=self.property.pk, type='FIRST_FOLLOWUP', status='OPEN', lead=self.lead.pk,
                    due_date=datetime.date.today() + datetime.timedelta(days=1),
                    actor=self.user.pk, owner=self.owner.pk)
        self.client.post(endpoint, data, format='json', **header)
        task = Task.objects.filter(type='FIRST_FOLLOWUP').first()

        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_NEW_TASK).content,
                         '{} assigned you a new task: {}'.format(self.user.first_name, task.title))

        # task is due today
        data = dict(property=self.property.pk, type='FIRST_FOLLOWUP', status='OPEN', lead=self.lead.pk,
                    due_date=datetime.date.today(), actor=self.user.pk, owner=self.owner.pk)
        self.client.post(endpoint, data, format='json', **header)
        task = Task.objects.filter(type='FIRST_FOLLOWUP').first()
        self.assertEqual(Notification.objects.count(), 3)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_TASK_DUE_TODAY).content,
                         '{} for {} is due today'.format(task.title, task.lead.name))

        # task is one day overdue
        data = dict(property=self.property.pk, type='FIRST_FOLLOWUP', status='OPEN', lead=self.lead.pk,
                    due_date=datetime.date.today() - datetime.timedelta(days=1), actor=self.user.pk,
                    owner=self.owner.pk)
        self.client.post(endpoint, data, format='json', **header)
        task = Task.objects.filter(type='FIRST_FOLLOWUP').first()
        self.assertEqual(Notification.objects.count(), 5)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_OVERDUE_TASK).content,
                         '{} for {} is one day overdue'.format(task.title, task.lead.name))

        # task is one week overdue
        due_date = datetime.date.today() - datetime.timedelta(days=7)
        data = dict(property=self.property.pk, type='FIRST_FOLLOWUP', status='OPEN', lead=self.lead.pk,
                    due_date=due_date, actor=self.user.pk,
                    owner=self.owner.pk)
        self.client.post(endpoint, data, format='json', **header)
        task = Task.objects.filter(type='FIRST_FOLLOWUP', due_date=due_date).first()
        self.assertEqual(Notification.objects.count(), 7)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_OVERDUE_TASK, object_id=task.id).content,
                         '{} for {} is one week overdue'.format(task.title, task.lead.name))

    def test_lead_notification(self):
        # no owner
        data = dict(property=self.property.pk, first_name='test1', last_name='test1')
        endpoint = reverse('lead-list')
        header = {'HTTP_X_NAME': 'test1'}
        self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(Notification.objects.count(), 0)

        lead = Lead.objects.filter(first_name='test1').first()

        # owner == actor
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead-detail', args=[lead.pk])
        self.client.patch(endpoint, dict(owner=self.user.pk), format='json', **header)
        self.assertEqual(Notification.objects.count(), 0)

        # owner != actor
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead-detail', args=[lead.pk])
        self.client.patch(endpoint, dict(owner=self.owner.pk), format='json', **header)
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_NEW_LEAD).content,
                         '{} assigned you a new lead: {} {}'.format(self.user.first_name, lead.first_name,
                                                                    lead.last_name))

    def test_note_notification(self):
        # no mentions
        data = dict(property=self.property.pk, lead=self.lead.pk, text='test')
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-list', kwargs={'lead_pk': self.lead.pk})
        self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(Notification.objects.count(), 0)

        # notifications for mentioned users except actor
        data = dict(property=self.property.pk, lead=self.lead.pk, text='test', mentions=[self.user.pk, self.owner.pk])
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-list', kwargs={'lead_pk': self.lead.pk})
        self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(Notification.objects.get(type=Notification.TYPE_TEAM_MENTION).content,
                         '{} mentioned you in {} {}: {}'.format(self.user.first_name, self.lead.first_name,
                                                                self.lead.last_name, 'test'))
