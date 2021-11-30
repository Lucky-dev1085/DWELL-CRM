import datetime

from backend.api.models import User, Notification
from backend.api.tasks import check_tasks_due_date_task
from backend.api.tests import LeadLevelBaseTestCase
from backend.api.factories import TaskFactory, UserFactory


class CheckTasksDueDateTaskTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(CheckTasksDueDateTaskTests, self).setUp()
        self.actor = UserFactory(password='password123psswrd', role=User.LL_ADMIN, status='ACTIVE')

    def test_check_tasks_due_date_task(self):
        # no ownergit
        task = TaskFactory(property=self.property, status='OPEN',
                           due_date=datetime.date.today() + datetime.timedelta(days=1),
                           actor=self.actor, lead=self.lead)
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.count(), 0)

        # no duplicates + due today
        task.owner = self.user
        task.due_date = datetime.date.today()
        task.save()
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_TASK_DUE_TODAY).count(), 1)
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_TASK_DUE_TODAY).count(), 1)

        Notification.objects.filter(type=Notification.TYPE_TASK_DUE_TODAY).delete()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_TASK_DUE_TODAY).count(), 0)
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_TASK_DUE_TODAY).count(), 1)

        # one day overdue
        task.due_date = datetime.date.today() - datetime.timedelta(days=1)
        task.save()
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_OVERDUE_TASK).count(), 1)

        # one week overdue
        TaskFactory(property=self.property, status='OPEN',
                    due_date=datetime.date.today() - datetime.timedelta(days=7), actor=self.actor,
                    lead=self.lead, owner=self.user)
        check_tasks_due_date_task()
        self.assertEqual(Notification.objects.filter(type=Notification.TYPE_OVERDUE_TASK).count(), 2)
