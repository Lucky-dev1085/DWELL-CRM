import boto3
import pytz

from datetime import datetime
from botocore.stub import Stubber
from unittest.mock import patch

from backend.compete.tasks import pull_scrapping_data
from backend.compete.models import Property, History, UnitType
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.factories import UnitTypeFactory
from backend.compete.tasks import generate_report


TZ = pytz.timezone('America/Phoenix')


class GenerateReportTests(BaseTestCase):
    def test_generate_report(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=210
        )

        for index, unit_type_name in enumerate([i for i in UnitType.UNIT_TYPE_CHOICES]):
            unit_type = UnitTypeFactory(property=property, units_count=10 * (index + 1), name=unit_type_name[0])
            for i in range(3):
                History.objects.create(
                    type=unit_type_name[1], beds=unit_type.beds, baths=1.0, rent=1000 + 100 * i, sqft=100 + 10 * i,
                    property=property, scrapping_date=datetime(2021, 4, 1),
                    specials='$500 off select homes. Call today for more information'
                )

        generate_report('2021-04-01', property_ids=[property.id])

        report = property.reports.first()
        studio_rent_report = property.unit_rent_reports.filter(unit_type='STUDIO').first()

        self.assertEqual(studio_rent_report.min_rent, 1000)
        self.assertEqual(studio_rent_report.max_rent, 1200)
        self.assertEqual(studio_rent_report.rent_sum, 3300)
        self.assertEqual(studio_rent_report.sqft_sum, 330)
        self.assertEqual(studio_rent_report.units_count, 3)

        self.assertEqual(round(report.occupancy, 2), 91.43)
        self.assertEqual(report.concession, 500)
        self.assertEqual(report.available_units, 18)
        self.assertEqual(report.total_units, 210)
        self.assertEqual(round(report.concession_avg_rent_percent, 2), 3.79)

    def test_combined_rent(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=210
        )

        for index, unit_type_name in enumerate([i for i in UnitType.UNIT_TYPE_CHOICES]):
            UnitTypeFactory(property=property, units_count=10, name=unit_type_name[0])

        for i in range(3):
            History.objects.create(
                type='STUDIO', beds=0, baths=1.0, rent=1000, sqft=100,
                property=property, scrapping_date=datetime(2021, 4, 1),
                specials='$500 off select homes. Call today for more information'
            )

        for i in range(3):
            History.objects.create(
                type='ONE_BEDROOM', beds=1, baths=1.0, rent=2000, sqft=100,
                property=property, scrapping_date=datetime(2021, 4, 1),
                specials='$500 off select homes. Call today for more information'
            )

        for i in range(3):
            History.objects.create(
                type='ONE_BEDROOM', beds=1, baths=1.0, rent=2000, sqft=100,
                property=property, scrapping_date=datetime(2021, 4, 2),
                specials='$500 off select homes. Call today for more information'
            )

        generate_report('2021-04-01', property_ids=[property.id])
        generate_report('2021-04-02', property_ids=[property.id])

        studio_rent_report = property.unit_rent_reports.filter(
            report__date=datetime(2021, 4, 2).date(), unit_type='STUDIO'
        ).first()

        combined_rent_report = property.unit_rent_reports.filter(
            report__date=datetime(2021, 4, 2).date(), unit_type='COMBINED'
        ).first()

        self.assertEqual(studio_rent_report.blended_rent, 1000)
        self.assertEqual(combined_rent_report.blended_rent, 1500)

    def test_should_pull_concession_even_if_no_available_units_exists(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=210
        )

        for index, unit_type_name in enumerate([i for i in UnitType.UNIT_TYPE_CHOICES]):
            unit_type = UnitTypeFactory(property=property, units_count=10 * (index + 1), name=unit_type_name[0])
            for i in range(3):
                History.objects.create(
                    type=unit_type_name[1], beds=unit_type.beds, property=property, scrapping_date=datetime(2021, 4, 1),
                    specials='$500 off select homes. Call today for more information', is_valuable=False
                )

        generate_report('2021-04-01', property_ids=[property.id])

        report = property.reports.first()
        self.assertEqual(report.concession, 500)

    def test_concession_by_week(self):
        property = Property.objects.create(
            name='Broadstone Waterfront', s3_name='Broadstone Waterfront', units_count=200
        )
        s3_file = open('backend/compete/static/template/04-01-2021_Broadstone-Waterfront.csv', 'rb')

        client = boto3.client('s3')
        stubber = Stubber(client)

        with patch('boto3.client', return_value=client), stubber:
            stubber.add_response('get_object', {'Body': s3_file, 'LastModified': datetime(2021, 4, 1, 0, 0)})
            pull_scrapping_data('2021-04-01', False, property_ids=[property.id])
            generate_report('2021-04-01', property_ids=[property.id])
            self.assertEqual(property.histories.filter(scrapping_date='2021-04-01', is_valuable=True).count(), 12)

            report = property.reports.filter(date='2021-04-01').first()
            self.assertEqual(report.concession, 1344.3)
            self.assertEqual(report.concession_avg_rent_percent, 4.17)

    def test_occupancy_of_lease_up_property(self):
        property = Property.objects.create(
            name='The Art on Highland', s3_name='The Art on Highland', units_count=200, completed_units_count=150,
            is_lease_up=True
        )

        for index, unit_type_name in enumerate([i for i in UnitType.UNIT_TYPE_CHOICES]):
            unit_type = UnitTypeFactory(property=property, units_count=10, name=unit_type_name[0])
            for i in range(3):
                History.objects.create(
                    type=unit_type_name[1], beds=unit_type.beds, baths=1.0, rent=1000 + 100 * i, sqft=100 + 10 * i,
                    property=property, scrapping_date=datetime(2021, 4, 1),
                    specials='$500 off select homes. Call today for more information'
                )

        generate_report('2021-04-01', property_ids=[property.id])

        report = property.reports.first()
        self.assertEqual(report.occupancy, 66.0)
