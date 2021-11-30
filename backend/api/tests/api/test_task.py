from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from backend.api.models import Task, User, Lead, Activity
from backend.api.tests import LeadLevelBaseTestCase
import datetime
from backend.api.factories import TaskFactory, UserFactory, FloorPlanFactory, UnitFactory


class TaskTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(TaskTests, self).setUp()
        self.actor = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')

    def test_create_task(self):
        """
        Ensure we can create a new task object.
        """
        data = dict(property=self.property.pk, type='FINAL_FOLLOWUP', status='OPEN',
                    due_date=datetime.date.today(), owner=self.user.pk)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_task-list', kwargs={'lead_pk': 9999})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Task.objects.count(), 0)

        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.type, 'FINAL_FOLLOWUP')
        self.assertTrue(task.lead.last_activity_date)

    def test_list_task(self):
        """
        Ensure we can list assign task objects.
        """
        TaskFactory(property=self.property, due_date=datetime.date.today() + datetime.timedelta(days=1),
                    owner=self.user,
                    actor=self.actor)
        TaskFactory(property=self.property, tour_date=datetime.datetime.today() + datetime.timedelta(days=1),
                    owner=self.user,
                    actor=self.actor)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_task-list', kwargs={'lead_pk': 9999})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Task.objects.count(), 2)

    def test_put_task(self):
        """
        Ensure we can update task object.
        """
        task = TaskFactory(property=self.property, type='FINAL_FOLLOWUP', status='OPEN',
                           due_date=datetime.date.today() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': 9999, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type='EMAIL', status='COMPLETED',
                                                  due_date=datetime.date.today() + datetime.timedelta(days=1),
                                                  owner=self.user.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        task = Task.objects.first()
        self.assertEqual(task.type, 'FINAL_FOLLOWUP')
        self.assertEqual(task.status, 'OPEN')
        self.assertTrue(task.lead.last_activity_date)

        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type='CHECK_DOCS', status='COMPLETED',
                                                  due_date=datetime.date.today() + datetime.timedelta(days=1),
                                                  owner=self.user.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = Task.objects.first()
        self.assertEqual(task.type, 'CHECK_DOCS')
        self.assertEqual(task.status, 'COMPLETED')
        self.assertTrue(task.lead.last_activity_date)

    def test_delete_task(self):
        """
        Ensure we can delete task object.
        """
        task = TaskFactory(property=self.property, due_date=datetime.date.today() + datetime.timedelta(days=1),
                           owner=self.user,
                           actor=self.actor, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': 9999, 'pk': task.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Task.objects.count(), 1)

        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Task.objects.count(), 0)

    def test_tour_complete(self):
        """
        Ensure complete tour will update tour completed date of lead
        """
        header = {'HTTP_X_NAME': 'test1'}
        task = TaskFactory(property=self.property, type=Task.TYPE_TOUR, status='OPEN',
                           tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.patch(endpoint, dict(status='COMPLETED'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = Task.objects.first()
        self.assertEqual(task.status, 'COMPLETED')
        self.assertTrue(task.lead.tour_completed_date > timezone.now() - datetime.timedelta(seconds=20))

    def test_cancel_tour(self):
        """
        Ensure tour cancellation logic
        """
        header = {'HTTP_X_NAME': 'test1'}
        self.lead.stage = Lead.STAGE_CONTACT_MADE
        self.lead.save()
        task = TaskFactory(property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
                           tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        self.lead.stage = Lead.STAGE_TOUR_SET
        self.lead.save()
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type=Task.TYPE_IN_PERSON, status='OPEN',
                                                  tour_date=task.tour_date,
                                                  owner=self.user.pk, is_cancelled=True, lead=self.lead.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = Task.objects.get(pk=task.pk)
        self.assertEqual(task.lead.stage, Lead.STAGE_CONTACT_MADE)
        self.assertTrue(task.is_cancelled)
        self.assertTrue(Activity.objects.filter(lead=task.lead, type='TOUR_CANCELLED').exists())

    def test_revert_stage_to_contact_made_when_last_stage_is_empty(self):
        """
        Ensure tour cancellation will revert the lead stage to contact made if last stage is empty
        """
        header = {'HTTP_X_NAME': 'test1'}
        task = TaskFactory(property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
                           tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        self.lead.stage = Lead.STAGE_TOUR_SET
        self.lead.save()
        self.lead.last_stage = None
        self.lead.save()

        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type=Task.TYPE_IN_PERSON, status='OPEN',
                                                  tour_date=task.tour_date,
                                                  owner=self.user.pk, is_cancelled=True, lead=self.lead.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = Task.objects.get(pk=task.pk)
        self.assertEqual(task.lead.stage, Lead.STAGE_CONTACT_MADE)
        self.assertTrue(task.is_cancelled)

    def test_update_tour_date(self):
        """
        Ensure tour date update logic
        """
        header = {'HTTP_X_NAME': 'test1'}
        task = TaskFactory(property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
                           tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        self.lead.stage = Lead.STAGE_CONTACT_MADE
        self.lead.save()
        self.lead.stage = Lead.STAGE_TOUR_SET
        self.lead.save()
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type=Task.TYPE_IN_PERSON, status='OPEN',
                                                  tour_date=timezone.now() + datetime.timedelta(days=2),
                                                  owner=self.user.pk, lead=self.lead.pk), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Activity.objects.filter(lead=task.lead, type='TOUR_UPDATED').exists())

    def test_update_tour_unit(self):
        """
        Ensure tour unit update logic
        """
        plan = FloorPlanFactory(property=self.property)

        unit1 = UnitFactory(property=self.property, unit='7051', floor_plan=plan)
        unit2 = UnitFactory(property=self.property, unit='8009', floor_plan=plan)

        header = {'HTTP_X_NAME': 'test1'}
        task = TaskFactory(property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
                           tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor, lead=self.lead)
        task.units.add(unit1)

        self.lead.stage = Lead.STAGE_CONTACT_MADE
        self.lead.save()
        self.lead.stage = Lead.STAGE_TOUR_SET
        self.lead.save()
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': task.pk})
        response = self.client.put(endpoint, dict(type=Task.TYPE_IN_PERSON, status='OPEN',
                                                  tour_date=task.tour_date,
                                                  owner=self.user.pk, lead=self.lead.pk, units=[unit2.pk]), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Activity.objects.filter(lead=task.lead, type='TOUR_UPDATED').exists())

    def test_new_tour_should_revert_lost_lead_to_active(self):
        """
        Ensure new tour should revert the lost lead to active
        """
        header = {'HTTP_X_NAME': 'test1'}
        self.lead.stage = Lead.LEAD_LOST
        self.lead.save()

        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(
            endpoint,
            dict(
                type=Task.TYPE_IN_PERSON, status='OPEN', tour_date=timezone.now() + datetime.timedelta(days=2),
                owner=self.user.pk, lead=self.lead.pk
             ),
            **header
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tour = Task.objects.get(pk=response.json()['id'])
        self.assertEqual(tour.lead.status, Lead.LEAD_ACTIVE)

    def test_new_tour_should_set_tour_set_stage(self):
        """
        Ensure new tour should set tour_set stage
        """
        header = {'HTTP_X_NAME': 'test1'}

        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(
            endpoint,
            dict(
                type=Task.TYPE_IN_PERSON, status='OPEN', tour_date=timezone.now() + datetime.timedelta(days=2),
                owner=self.user.pk, lead=self.lead.pk
             ),
            **header
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tour = Task.objects.get(pk=response.json()['id'])
        self.assertEqual(tour.lead.stage, Lead.STAGE_TOUR_SET)

    def test_pending_tour_should_not_set_tour_set_stage(self):
        """
        Ensure the pending tour should not set tour_set stage
        """
        header = {'HTTP_X_NAME': 'test1'}

        endpoint = reverse('lead_task-list', kwargs={'lead_pk': self.lead.pk})
        old_stage = self.lead.stage
        response = self.client.post(
            endpoint,
            dict(
                type=Task.TYPE_SELF_GUIDED_TOUR, status='PENDING',
                tour_date=timezone.now() + datetime.timedelta(days=2), owner=self.user.pk, lead=self.lead.pk
             ),
            **header
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tour = Task.objects.get(pk=response.json()['id'])
        self.assertEqual(tour.lead.stage, old_stage)

    def test_is_cancelled_update_should_set_cancelled_status(self):
        """
        Ensure is_cancelled update should set cancelled status
        """
        header = {'HTTP_X_NAME': 'test1'}
        tour = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user, lead=self.lead
        )
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': tour.pk})

        self.client.patch(endpoint, dict(is_cancelled=True), **header)
        tour = Task.objects.get(pk=tour.pk)
        self.assertTrue(tour.is_cancelled)
        self.assertEqual(tour.status, Task.TOUR_CANCELLED)

    def test_cancelled_status_update_should_set_is_cancelled_field(self):
        """
        Ensure is_cancelled update should set cancelled status
        """
        header = {'HTTP_X_NAME': 'test1'}
        tour = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + datetime.timedelta(days=1), owner=self.user, lead=self.lead,
        )
        endpoint = reverse('lead_task-detail', kwargs={'lead_pk': self.lead.pk, 'pk': tour.pk})

        self.client.patch(endpoint, dict(status=Task.TOUR_CANCELLED), **header)
        tour = Task.objects.get(pk=tour.pk)
        self.assertTrue(tour.is_cancelled)
        self.assertEqual(tour.status, Task.TOUR_CANCELLED)
