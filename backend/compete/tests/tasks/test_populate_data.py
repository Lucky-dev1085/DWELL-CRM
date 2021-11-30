import pytz
import boto3

from botocore.stub import Stubber
from unittest.mock import patch
from datetime import datetime

from backend.api.models import Property as DwellProperty
from backend.api.factories import FloorPlanFactory, UnitFactory
from backend.compete.models import Property, UnitSession
from backend.compete.factories import HistoryFactory, UnitFactory as CompeteUnitFactory
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.tasks.populate_data import populate_data
from backend.compete.tasks import pull_scrapping_data, generate_history_for_mt_properties


TZ = pytz.timezone('America/Phoenix')


class PopulateDataTests(BaseTestCase):
    def test_populate_non_MT_properties_data(self):
        property = Property.objects.create(name='The Art on Highland', s3_name='The Art on Highland', units_count=200)
        s3_file = open('backend/compete/static/template/04-01-2021_The-Art-on-Highland.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            populate_data('2021-04-01', property_ids=[property.id])
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 26)
            self.assertEqual(property.units.count(), 26)
            unit = property.units.filter(number='1208').first()
            self.assertEqual(unit.unit_type.name, 'STUDIO')
            self.assertEqual(unit.beds, 0.0)
            self.assertEqual(unit.baths, 1.0)
            self.assertEqual(unit.floor_plan_name, 'S1')
            self.assertEqual(unit.rent, 1300.0)
            self.assertEqual(unit.unit_size, 535.0)
            self.assertEqual(unit.available_date, datetime(2021, 4, 9).date())

            property = Property.objects.get(pk=property.pk)
            self.assertEqual(property.address, '4626 N. 16th St. Phoenix, AZ 85016')
            self.assertEqual(property.phone_number, '(480) 874-9074')
            self.assertEqual(property.website, 'https://www.theartonhighland.com/')
            self.assertEqual('Quartz Countertops' in ','.join(property.amenities), True)
            self.assertEqual('Powered by Alfred resident tech platform' in ','.join(property.communities), True)

            self.assertEqual(property.average_rent, 1638.12)
            self.assertEqual(property.average_rent_per_sqft, 1.8)
            self.assertEqual(property.occupancy, 87.0)
            self.assertEqual(property.concession_amount, 500.0)

    def test_should_pull_property_details_even_no_available_units_exists(self):
        property = Property.objects.create(name='The Vintage', s3_name='The Vintage', units_count=200)
        s3_file = open('backend/compete/static/template/04-01-2021_The_Vintage.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            populate_data('2021-04-01', property_ids=[property.id])
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01').count(), 3)
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 0)
            self.assertEqual(property.units.count(), 0)

            property = Property.objects.get(pk=property.pk)
            self.assertEqual(property.address, '7440 East Thomas Rd  Scottsdale, AZ 85251')
            self.assertEqual(property.phone_number, '(480) 946-5741')
            self.assertEqual(property.website, 'https://www.scottsdalevintageapts.com/')
            print(property.amenities)
            print(property.communities)
            self.assertEqual('Cable Ready' in ','.join(property.amenities), True)
            self.assertEqual('Ramada/BBQ area' in ','.join(property.communities), True)

    def test_populate_MT_properties_data(self):
        property = Property.objects.first()
        dwell_property = DwellProperty.objects.create(
            town='4626 N. 16th St. Phoenix', city='AZ 85016',
            phone_number='(480) 874-9074', domain='theartonhighland.com'
        )
        property.property = dwell_property
        property.save()

        amenities_data = dwell_property.page_data.filter(section='AMENITIES').first()

        amenities_list = amenities_data.values['amenitiesList']

        for amenity in amenities_list:
            if amenity['name'] == 'Amenities':
                amenity['amenitiesDetails'][0] += [dict(description='Quartz Countertops')]

            if amenity['name'] == 'Community':
                amenity['amenitiesDetails'][0] += [dict(description='Powered by Alfred resident tech platform')]

        amenities_data.values['amenitiesList'] = amenities_list
        amenities_data.save()

        plan = FloorPlanFactory(property=self.property, bedrooms=1, bathrooms=1, plan='S1', min_rent=1500,
                                square_footage=100)
        UnitFactory(floor_plan=plan, property=dwell_property, unit='2001')
        UnitFactory(floor_plan=plan, property=dwell_property, unit='2002')

        generate_history_for_mt_properties('2021-04-01', False, property_ids=[property.id])
        populate_data('2021-04-01', property_ids=[property.id])

        property = Property.objects.get(id=property.id)

        self.assertEqual(property.histories.filter(scrapping_date='2021-04-01').count(), 2)
        unit = property.units.filter(number=2001).first()
        self.assertEqual(unit.unit_type.name, 'ONE_BEDROOM')
        self.assertEqual(unit.beds, 1.0)
        self.assertEqual(unit.baths, 1.0)
        self.assertEqual(unit.floor_plan_name, 'S1')
        self.assertEqual(unit.rent, 1500.0)
        self.assertEqual(unit.unit_size, 100.0)

        self.assertEqual(unit.available_date, datetime(2021, 4, 1).date())
        self.assertEqual(property.address, 'AZ 85016, 4626 N. 16th St. Phoenix')
        self.assertEqual(property.phone_number, '(480) 874-9074')
        self.assertEqual(property.website, 'https://theartonhighland.com')
        self.assertEqual('Quartz Countertops' in ','.join(property.amenities), True)
        self.assertEqual('Powered by Alfred resident tech platform' in ','.join(property.communities), True)

    def test_concession_amount_by_period(self):
        property = Property.objects.create(
            name='Broadstone Waterfront', s3_name='Broadstone Waterfront', units_count=200
        )
        s3_file = open('backend/compete/static/template/04-01-2021_Broadstone-Waterfront.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            populate_data('2021-04-01', property_ids=[property.id])
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 12)
            self.assertEqual(property.units.count(), 12)

            property = Property.objects.get(pk=property.pk)
            self.assertEqual(property.concession_amount, 1140.5)

    def test_occupancy_of_lease_up_property(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=200, completed_units_count=150,
            is_lease_up=True
        )
        s3_file = open('backend/compete/static/template/04-01-2021_The-Art-on-Highland.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            populate_data('2021-04-01', property_ids=[property.id])

            property = Property.objects.get(pk=property.pk)
            self.assertEqual(property.occupancy, 62.0)

    def test_unit_on_market_state(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=200, completed_units_count=150,
            is_lease_up=True
        )
        unit1 = CompeteUnitFactory(property=property, on_market=True)
        unit2 = CompeteUnitFactory(property=property, on_market=True)

        HistoryFactory(property=property, apartment=unit1.number, scrapping_date=datetime(2021, 4, 1).date())
        populate_data('2021-04-01', property_ids=[property.id])

        unit1 = property.units.get(pk=unit1.pk)
        unit2 = property.units.get(pk=unit2.pk)

        self.assertTrue(unit1.on_market)
        self.assertFalse(unit2.on_market)

    def test_unit_session_generation(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=200, completed_units_count=150,
            is_lease_up=True
        )
        unit1 = CompeteUnitFactory(property=property, on_market=True)
        unit2 = CompeteUnitFactory(property=property, on_market=True)
        unit3 = CompeteUnitFactory(property=property, on_market=True)
        unit4 = CompeteUnitFactory(property=property, on_market=True)

        UnitSession.objects.create(property=property, unit=unit1, start_listing_date=datetime(2021, 3, 31).date())
        UnitSession.objects.create(
            property=property, unit=unit2, start_listing_date=datetime(2021, 3, 25).date(),
            end_listing_date=datetime(2021, 3, 30).date()
        )
        UnitSession.objects.create(property=property, unit=unit3, start_listing_date=datetime(2021, 3, 31).date())
        UnitSession.objects.create(
            property=property, unit=unit4, start_listing_date=datetime(2021, 3, 25).date(),
            end_listing_date=datetime(2021, 3, 30).date()
        )

        HistoryFactory(property=property, apartment=unit1.number, scrapping_date=datetime(2021, 4, 1).date(), type='STUDIO', beds=0)
        HistoryFactory(property=property, apartment=unit2.number, scrapping_date=datetime(2021, 4, 1).date(), type='STUDIO', beds=0)
        populate_data('2021-04-01', property_ids=[property.id])

        self.assertTrue(property.unit_sessions.filter(unit=unit1, end_listing_date=None).exists())
        self.assertTrue(
            property.unit_sessions.filter(
                unit=unit2, start_listing_date=datetime(2021, 4, 1).date(), end_listing_date=None).exists()
        )
        self.assertTrue(
            property.unit_sessions.filter(
                unit=unit3, start_listing_date=datetime(2021, 3, 31).date(),
                end_listing_date=datetime(2021, 4, 1).date()).exists()
        )
        self.assertFalse(property.unit_sessions.filter(unit=unit4, end_listing_date=None).exists())
