from django.urls import reverse
from rest_framework import status
from backend.api.models import Note
from backend.api.tests import LeadLevelBaseTestCase
from backend.api.factories import NoteFactory


class NoteTests(LeadLevelBaseTestCase):
    def setUp(self):
        super(NoteTests, self).setUp()

    def test_create_note(self):
        """
        Ensure we can create a new note object.
        """
        data = dict(property=self.property.pk, lead=self.lead.pk, text='test')
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-list', kwargs={'lead_pk': 9999})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Note.objects.count(), 0)

        endpoint = reverse('lead_note-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 1)
        note = Note.objects.first()
        self.assertEqual(note.text, 'test')
        self.assertTrue(note.lead.last_activity_date)

    def test_list_note(self):
        """
        Ensure we can list assign note objects.
        """
        NoteFactory(property=self.property, lead=self.lead)
        NoteFactory(property=self.property, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-list', kwargs={'lead_pk': 9999})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        endpoint = reverse('lead_note-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Note.objects.count(), 2)

    def test_put_note(self):
        """
        Ensure we can update note object.
        """
        note = NoteFactory(property=self.property, lead=self.lead, text='test1')
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-detail', kwargs={'lead_pk': 9999, 'pk': note.pk})
        response = self.client.put(endpoint, dict(property=self.property.pk, lead=self.lead.pk, text='test2'), **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        note = Note.objects.first()
        self.assertEqual(note.text, 'test1')
        self.assertTrue(note.lead.last_activity_date)

        endpoint = reverse('lead_note-detail', kwargs={'lead_pk': self.lead.pk, 'pk': note.pk})
        response = self.client.put(endpoint, dict(property=self.property.pk, lead=self.lead.pk, text='test2'), **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note = Note.objects.first()
        self.assertEqual(note.text, 'test2')
        self.assertTrue(note.lead.last_activity_date)

    def test_delete_note(self):
        """
        Ensure we can delete note object.
        """
        note = NoteFactory(property=self.property, lead=self.lead)
        header = {'HTTP_X_NAME': 'test1'}
        endpoint = reverse('lead_note-detail', kwargs={'lead_pk': 9999, 'pk': note.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Note.objects.count(), 1)

        endpoint = reverse('lead_note-detail', kwargs={'lead_pk': self.lead.pk, 'pk': note.pk})
        response = self.client.delete(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Note.objects.count(), 0)
