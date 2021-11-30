import pytz
import boto3

from botocore.stub import Stubber
from unittest.mock import patch
from datetime import datetime
from freezegun import freeze_time

from backend.api.models import Property as DwellProperty
from backend.api.factories import FloorPlanFactory, UnitFactory
from backend.compete.models import Property
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.tasks.pull_scrapping_data import pull_scrapping_data, generate_history_for_mt_properties, \
    check_scrapping_state


TZ = pytz.timezone('America/Phoenix')


class PullNonMTDataTests(BaseTestCase):
    def test_pull_scrapping_data(self):
        property = Property.objects.first()
        property.s3_name = 'The Art on Highland'
        property.save()

        s3_file = open('backend/compete/static/template/04-01-2021_The-Art-on-Highland.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 26)
            history = property.histories.filter(scrapping_date='2021-04-01', apartment=1208).first()
            self.assertEqual(history.item_id, '3718')
            self.assertEqual(history.type, 'Studio')
            self.assertEqual(history.beds, 0.0)
            self.assertEqual(history.baths, 1.0)
            self.assertEqual(history.floor_plan, 'S1')
            self.assertEqual(history.rent, 1300.0)
            self.assertEqual(history.available_date, 'Apr 09, 2021')
            self.assertEqual(history.address, '4626 N. 16th St. Phoenix, AZ 85016')
            self.assertEqual(history.phone, '(480) 874-9074')
            self.assertEqual(history.website, 'https://www.theartonhighland.com/')
            self.assertEqual('Quartz Countertops' in history.amenities, True)
            self.assertEqual('Powered by Alfred resident tech platform' in history.communities, True)

    def test_pull_again_should_overwrite_value(self):
        property = Property.objects.first()
        property.s3_name = 'The Art on Highland'
        property.save()

        s3_file = open('backend/compete/static/template/04-01-2021_The-Art-on-Highland.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])

            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 26)
            history = property.histories.filter(scrapping_date='2021-04-01', item_id='3718').first()
            self.assertEqual(history.baths, 1.0)

        s3_file = open('backend/compete/static/template/04-01-2021_The-Art-on-Highland.csv', 'rb')
        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            history.baths = 2.0
            history.save()

            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])

            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 26)
            history = property.histories.filter(scrapping_date='2021-04-01', item_id='3718').first()
            self.assertEqual(history.baths, 1.0)


class PullMTDataTests(BaseTestCase):
    def test_pull_MT_properties(self):
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
            amenity_items = []
            for column in amenity.get('amenitiesDetails'):
                amenity_items += [item['description'] for item in column]

            if amenity['name'] == 'Amenities':
                amenity['amenitiesDetails'][0] += [{'description': 'Quartz Countertops', 'category': 1}]

            if amenity['name'] == 'Community':
                amenity['amenitiesDetails'][0] += [{'description': 'Powered by Alfred resident tech platform', 'category': 1}]

        amenities_data.values['amenitiesList'] = amenities_list
        amenities_data.save()

        plan = FloorPlanFactory(property=self.property, bedrooms=1, bathrooms=1, plan='S1', min_rent=1500,
                                square_footage=100)
        UnitFactory(floor_plan=plan, property=dwell_property, unit='2001')
        UnitFactory(floor_plan=plan, property=dwell_property, unit='2002')

        generate_history_for_mt_properties('2021-04-01', False, property_ids=[property.id])
        self.assertEqual(property.histories.filter(scrapping_date='2021-04-01').count(), 2)
        history = property.histories.filter(scrapping_date='2021-04-01', apartment=2001).first()
        self.assertEqual(history.type, '1 bedroom')
        self.assertEqual(history.beds, 1.0)
        self.assertEqual(history.baths, 1.0)
        self.assertEqual(history.floor_plan, 'S1')
        self.assertEqual(history.rent, 1500.0)
        self.assertEqual(history.sqft, 100.0)
        self.assertEqual(history.available_date, 'Now')
        self.assertEqual(history.address, 'AZ 85016, 4626 N. 16th St. Phoenix')
        self.assertEqual(history.phone, '(480) 874-9074')
        self.assertEqual(history.website, 'https://theartonhighland.com')
        self.assertEqual('Quartz Countertops' in history.amenities, True)
        self.assertEqual('Powered by Alfred resident tech platform' in history.communities, True)


class CheckScrappingStateTests(BaseTestCase):
    @freeze_time(TZ.localize(datetime(2021, 4, 1, 5, 0)))
    def test_should_not_run_before_6_am(self):
        self.assertFalse(check_scrapping_state())

    @freeze_time(TZ.localize(datetime(2021, 4, 1, 12, 0)))
    def test_should_not_run_after_1_pm(self):
        self.assertFalse(check_scrapping_state())

    # @freeze_time(TZ.localize(datetime(2021, 4, 1, 7, 0)))
    # def test_should_not_pull_scrapping_data_if_not_modified(self):
    #     client = boto3.client('s3')
    #     stubber = Stubber(client)
    #     property = Property.objects.first()
    #
    #     last_modified = TZ.localize(datetime(2021, 4, 1, 5, 0))
    #     HistoryFactory(property=property, s3_last_modified=last_modified)
    #
    #     with patch('boto3.client', return_value=client) as mock_s3_client, stubber, \
    #             patch('backend.compete.tasks.pull_scrapping_data.check_scrapping_state') as mock_pull_scrapping_data:
    #         stubber.add_response('get_object', {'Body': {}, 'LastModified': last_modified})
    #         check_scrapping_state()
    #         mock_s3_client.assert_called()
    #         mock_pull_scrapping_data.assert_not_called()
    #
    # @freeze_time(TZ.localize(datetime(2021, 4, 1, 7, 0)))
    # def test_should_pull_scrapping_data_if_data_modified(self):
    #     client = boto3.client('s3')
    #     stubber = Stubber(client)
    #     property = Property.objects.first()
    #
    #     last_modified = TZ.localize(datetime(2021, 4, 1, 5, 0))
    #     HistoryFactory(property=property, s3_last_modified=last_modified)
    #
    #     with patch('boto3.client', return_value=client) as mock_s3_client, stubber, \
    #             patch('backend.compete.tasks.pull_scrapping_data.pull_scrapping_data') as mock_pull_scrapping_data:
    #         stubber.add_response('get_object', {'Body': {}, 'LastModified': last_modified + timedelta(hours=1)})
    #         mock_s3_client.assert_called()
    #         mock_pull_scrapping_data.assert_called()
