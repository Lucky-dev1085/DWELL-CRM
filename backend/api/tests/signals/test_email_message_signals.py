from backend.api.models import EmailMessage
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import EmailMessageFactory, LeadFactory


class EmailMessageSignalsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(EmailMessageSignalsTests, self).setUp()

    def test_update_email_messages_lead(self):
        message1 = EmailMessageFactory(property=self.property, sender_email='test@gmail.com')
        message2 = EmailMessageFactory(property=self.property, receiver_email='test@gmail.com')
        EmailMessageFactory(property=self.property, sender_email='test1@gmail.com')
        lead = LeadFactory(property=self.property, stage='INQUIRY', email='test@gmail.com', emails=[], tasks=[],
                           notes=[])
        self.assertEqual(EmailMessage.objects.filter(lead=lead.pk).count(), 0)

        message1.lead = lead
        message1.save()
        self.assertEqual(EmailMessage.objects.filter(lead=lead.pk).count(), 2)

        message2.lead = None
        message2.save()
        self.assertEqual(EmailMessage.objects.filter(lead=lead.pk).count(), 0)
