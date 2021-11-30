from backend.api.models import Activity, Task, User
from backend.api.tests import LeadLevelBaseTestCase
import datetime
from backend.api.factories import UserFactory, TaskFactory, NoteFactory, LeadFactory, EmailMessageFactory


class ActivitySignalsTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(ActivitySignalsTests, self).setUp()
        self.actor = UserFactory(role=User.LL_ADMIN, status='ACTIVE')

    def test_lead_activity(self):
        lead = LeadFactory(property=self.property, first_name='test', last_name='test', stage='INQUIRY', emails=[],
                           tasks=[], notes=[])
        self.assertEqual(Activity.objects.get(lead=lead.pk).content, '{} {}'.format(lead.first_name, lead.last_name))

        lead.stage = 'TOUR_SET'
        lead.save()
        self.assertEqual(Activity.objects.filter(lead=lead.pk, type=Activity.LEAD_UPDATED).count(), 1)
        self.assertEqual(Activity.objects.filter(lead=lead.pk, type=Activity.LEAD_UPDATED).first().content,
                         'Stage updated to {}'.format(lead.get_stage_display()))

    def test_task_activity(self):
        task = TaskFactory(property=self.property, type=Task.TYPE_FOLLOW_FIRST, status='OPEN',
                           lead=self.lead,
                           due_date=datetime.date.today() + datetime.timedelta(days=1), owner=self.user,
                           actor=self.actor)
        self.assertEqual(Activity.objects.filter(lead=task.lead.pk, type=Activity.TASK_CREATED).count(), 1)
        self.assertEqual(Activity.objects.filter(lead=task.lead.pk, type=Activity.TASK_CREATED).first().content,
                         task.title)

        task.status = Task.TASK_COMPLETED
        task.save()
        self.assertEqual(Activity.objects.filter(lead=task.lead.pk, type=Activity.TASK_COMPLETED).count(), 1)
        self.assertEqual(Activity.objects.filter(lead=task.lead.pk, type=Activity.TASK_COMPLETED).first().content,
                         task.title)

    def test_note_activity(self):
        note = NoteFactory(property=self.property, lead=self.lead, text='test')
        self.assertEqual(Activity.objects.filter(lead=note.lead.pk, type=Activity.NOTE_CREATED).count(), 1)
        self.assertEqual(Activity.objects.filter(lead=note.lead.pk, type=Activity.NOTE_CREATED).first().content,
                         note.text[0:128])

    def test_email_activity(self):
        # no lead
        EmailMessageFactory(lead=None)
        self.assertEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED).count(), 0)

        # lead, sender
        EmailMessageFactory(lead=self.lead, sender_email=self.lead.email)
        self.assertEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED).count(), 0)

        # lead, receiver, no property
        EmailMessageFactory(lead=self.lead, receiver_email=self.lead.email)
        self.assertEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED).count(), 0)

        # lead, receiver, property
        EmailMessageFactory(lead=self.lead, receiver_email=self.lead.email, property=self.property)
        self.assertEqual(Activity.objects.filter(type=Activity.EMAIL_CREATED).count(), 1)
