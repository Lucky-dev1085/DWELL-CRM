from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from backend.api.models import Lead, Task, VendorAuth, ProspectSource, AssignLeadOwners
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import TaskFactory, UnitFactory, FloorPlanFactory


class PublicTourTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(PublicTourTests, self).setUp()
        ProspectSource.objects.create(property=self.property, name='Apartment.com')
        self.property.shared_email = 'bellagio@proeprty.com'
        self.property.save()
        self.vendor = VendorAuth.objects.create(source='Apartment.com')
        self.header = {'HTTP_X_EMAIL': 'bellagio@proeprty.com', 'HTTP_CLIENT_ID': self.vendor.client_id,
                       'HTTP_SECRET_KEY': self.vendor.secret_key}
        self.client.logout()

        floor_plan = FloorPlanFactory(property=self.property)
        UnitFactory(property=self.property, floor_plan=floor_plan, unit=1001)
        UnitFactory(property=self.property, floor_plan=floor_plan, unit=1002)

        self.lead = Lead.objects.create(first_name='testo', last_name='user', property=self.property)

    def test_create_tour(self):
        """
        Ensure we can create a new tour.
        """
        endpoint = reverse('public_tour-list', kwargs={'lead_pk': self.lead.pk})

        data = dict(
            type='IN_PERSON', description='Tour Description', units=[1001, 1002], tour_date='2021-07-07T01:30:00+00:00'
        )

        AssignLeadOwners.objects.create(property=self.property, tuesday=self.user, is_enabled=True)

        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.lead.tasks.count(), 0)

        response = self.client.post(endpoint, data, format='json', **self.header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.lead.tasks.count(), 1)

        tour = self.lead.tasks.first()
        self.assertEqual(tour.type, 'IN_PERSON')
        self.assertEqual(tour.description, 'Tour Description')
        self.assertListEqual(sorted(list(tour.units.values_list('unit', flat=True))), ['1001', '1002'])
        self.assertEqual(str(tour.tour_date), '2021-07-07 01:30:00+00:00')
        self.assertEqual(tour.owner, self.user)

    def test_list_tours(self):
        """
        Ensure we can list tours.
        """
        tour1 = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead, vendor=self.vendor,
        )
        tour2 = TaskFactory(
            property=self.property, type=Task.TYPE_SELF_GUIDED_TOUR, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead, vendor=self.vendor,
        )
        TaskFactory(
            property=self.property, type=Task.TYPE_SELF_GUIDED_TOUR, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead
        )

        endpoint = reverse('public_tour-list', kwargs={'lead_pk': self.lead.pk})
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(endpoint, **self.header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = response.json()
        self.assertEqual(len(content['results']), 2)
        self.assertListEqual(sorted([tour['id'] for tour in content['results']]), sorted([tour1.id, tour2.id]))

    def test_put_tour(self):
        """
        Ensure we can update tour
        """
        tour = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead, vendor=self.vendor,
        )
        endpoint = reverse('public_tour-detail', kwargs={'lead_pk': self.lead.pk, 'pk': tour.pk})

        response = self.client.patch(endpoint, dict(units=[1001]))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.patch(endpoint, dict(units=[1001]), **self.header)
        tour = Task.objects.get(pk=tour.pk)
        self.assertEqual(tour.units.first().unit, '1001')

    def test_delete_tour(self):
        """
        Ensure we can not delete tour object using public API.
        """
        tour = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead, vendor=self.vendor,
        )
        endpoint = reverse('public_tour-detail', kwargs={'lead_pk': self.lead.pk, 'pk': tour.pk})

        response = self.client.delete(endpoint, **self.header)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cancel_tour(self):
        """
        Ensure we can cancel tour
        """
        tour = TaskFactory(
            property=self.property, type=Task.TYPE_IN_PERSON, status='OPEN',
            tour_date=timezone.now() + timedelta(days=1), owner=self.user, lead=self.lead, vendor=self.vendor,
        )
        endpoint = reverse('public_tour-detail', kwargs={'lead_pk': self.lead.pk, 'pk': tour.pk})

        response = self.client.patch(endpoint, dict(status=Task.TOUR_CANCELLED))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.patch(endpoint, dict(status=Task.TOUR_CANCELLED), **self.header)
        tour = Task.objects.get(pk=tour.pk)
        self.assertTrue(tour.is_cancelled)
        self.assertEqual(tour.status, Task.TOUR_CANCELLED)
