import json
from unittest.mock import patch, Mock
from freezegun import freeze_time

from backend.api.tasks import pull_res_man_floor_plans, pull_res_man_lost_prospect_reasons, \
    pull_res_man_prospect_sources
from backend.api.tasks.resman.utils import get_employees, get_employee, check_application_status, get_notice_to_vacate,\
    get_expected_move_in, remove_duplicated_lead
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.tests.test_base import MockResponse
from backend.api.models import Unit, FloorPlan, ProspectLostReason, ProspectSource
from backend.api.factories import UnitFactory, FloorPlanFactory, LeadFactory


class ResmanTasksTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ResmanTasksTests, self).setUp()

        self.property.resman_account_id = 'resman_account_id'
        self.property.resman_property_id = 'resman_property_id'
        self.property.save()

        plan = FloorPlanFactory(property=self.property)

        UnitFactory(property=self.property, unit='7051', floor_plan=plan)
        UnitFactory(property=self.property, unit='8009', floor_plan=plan)

    # def test_pull_current_residents(self):
    #     with patch('requests.post', return_value=MockResponse(json_data=dict(), status_code=400)):
    #         pull_current_residents()
    #         self.assertEqual(Unit.objects.filter(lease_dates=[]).count(), 2)
    #
    #     mock_response = {
    #         'Residents': [
    #             {
    #                 'Unit': '8009',
    #                 'LeaseStartDate': '2019-11-01',
    #                 'LeaseEndDate': '2021-01-31',
    #             },
    #             {
    #                 'Unit': '7051',
    #                 'LeaseStartDate': '2019-05-17',
    #                 'LeaseEndDate': '2022-10-16',
    #             }
    #         ]
    #     }
    #     with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
    #         pull_current_residents()
    #         self.assertTrue(
    #             Unit.objects.filter(lease_dates=[dict(start_date='2019-05-17', end_date='2022-10-16')]).exists())
    #         self.assertTrue(
    #             Unit.objects.filter(lease_dates=[dict(start_date='2019-11-01', end_date='2021-01-31')]).exists())

    def test_pull_res_man_floor_plans(self):
        with patch('requests.post', return_value=MockResponse(content='', status_code=500)):
            pull_res_man_floor_plans()
            self.assertEqual(Unit.objects.filter(lease_dates=[]).count(), 2)

        get_marketing_units_response = """
            <ResMan>
                <MethodName>GetMarketing4_0</MethodName>
                <Status>Failed</Status>
                <AccountID>account id</AccountID>
                <PropertyID>property id</PropertyID>
                <Response>
                    <PhysicalProperty>
                        <Property>
                            <ILS_Unit IDValue="1001" OrganizationName="ResMan" IDType="Number">
                                <Units>
                                    <Unit>
                                        <Identification IDValue="1001" OrganizationName="ResMan" IDType="Number" />
                                        <UnitType>239-2C</UnitType>
                                        <UnitBedrooms>3</UnitBedrooms>
                                        <MarketRent>1879</MarketRent>
                                        <UnitEconomicStatus>residential</UnitEconomicStatus>
                                        <UnitOccupancyStatus>vacant</UnitOccupancyStatus>
                                        <UnitLeasedStatus>available</UnitLeasedStatus>
                                    </Unit>
                                </Units>
                                <Pricing>
                                    <MITS-OfferTerm>
                                        <EffectiveRent>1319.00</EffectiveRent>
                                        <Term>12</Term>
                                    </MITS-OfferTerm>
                                </Pricing>
                            </ILS_Unit>
                            <ILS_Unit IDValue="1002" OrganizationName="ResMan" IDType="Number">
                                <Units>
                                    <Unit>
                                        <Identification IDValue="1002" OrganizationName="ResMan" IDType="Number" />
                                        <UnitType>239-2C</UnitType>
                                        <UnitBedrooms>5</UnitBedrooms>
                                        <MarketRent>2131</MarketRent>
                                        <UnitEconomicStatus>residential</UnitEconomicStatus>
                                        <UnitOccupancyStatus>occupied</UnitOccupancyStatus>
                                        <UnitLeasedStatus>on_notice</UnitLeasedStatus>
                                    </Unit>
                                </Units>
                                <Pricing>
                                    <MITS-OfferTerm>
                                        <EffectiveRent>1559.00</EffectiveRent>
                                        <Term>12</Term>
                                    </MITS-OfferTerm>
                                </Pricing>
                            </ILS_Unit>
                            <ILS_Unit IDValue="1003" OrganizationName="ResMan" IDType="Number">
                                <Units>
                                    <Unit>
                                        <Identification IDValue="1003" OrganizationName="ResMan" IDType="Number" />
                                        <UnitType>239-2C</UnitType>
                                        <UnitBedrooms>7</UnitBedrooms>
                                        <MarketRent>3213</MarketRent>
                                        <UnitEconomicStatus>residential</UnitEconomicStatus>
                                        <UnitOccupancyStatus>occupied</UnitOccupancyStatus>
                                        <UnitLeasedStatus>leased</UnitLeasedStatus>
                                    </Unit>
                                </Units>
                                <Pricing>
                                    <MITS-OfferTerm>
                                        <EffectiveRent>1719.00</EffectiveRent>
                                        <Term>3</Term>
                                    </MITS-OfferTerm>
                                </Pricing>
                            </ILS_Unit>
                        </Property>
                    </PhysicalProperty>
                </Response>
            </ResMan>
        """
        get_units_response = """
            {
                "Units": [
                    {
                        "PropertyID": "957b9efd-13a9-49f6-8013-b9754091383c",
                        "UnitId": "eb866c3c-6919-4cab-9edd-35356a0ccbbb",
                        "UnitNumber": "1004",
                        "Building": "1",
                        "Floor": "1",
                        "StreetAddress": "1450 East Germann Road",
                        "City": "Chandler",
                        "State": "AZ",
                        "Zip": "85286",
                        "UnitType": "3H"
                    },
                    {
                        "PropertyID": "957b9efd-13a9-49f6-8013-b9754091383d",
                        "UnitId": "eb866c3c-6919-4cab-9edd-35356a0ccbbc",
                        "UnitNumber": "1005",
                        "Building": "1",
                        "Floor": "1",
                        "StreetAddress": "1450 East Germann Road",
                        "City": "Chandler",
                        "State": "AZ",
                        "Zip": "85286",
                        "UnitType": "3H"
                    }
                ]
            }
        """
        mock_response = [
            Mock(), Mock(),
        ]
        mock_response[0].content = get_marketing_units_response
        mock_response[0].status_code = 200
        mock_response[1].content = get_units_response
        mock_response[1].status_code = 200
        with patch('requests.post') as mock_set_location_url:
            mock_set_location_url.side_effect = mock_response
            pull_res_man_floor_plans()
            plan = FloorPlan.objects.get(property=self.property, plan='239-2C')
            self.assertEqual(plan.units.count(), 3)
            unit1 = Unit.objects.get(property=self.property, unit='1001')
            unit2 = Unit.objects.get(property=self.property, unit='1002')
            unit3 = Unit.objects.get(property=self.property, unit='1003')

            self.assertEqual(unit1.status, 'AVAILABLE')
            self.assertEqual(unit2.status, 'AVAILABLE')
            self.assertEqual(unit3.status, 'NOT_AVAILABLE')

            self.assertEqual(unit1.market_rent, 1879)
            self.assertEqual(unit2.market_rent, 2131)
            self.assertEqual(unit3.market_rent, 3213)

            self.assertEqual(unit1.effective_rent, 1319.00)
            self.assertEqual(unit2.effective_rent, 1559.00)
            self.assertEqual(unit3.effective_rent, 0.0)

            self.assertEqual(unit1.bed_rooms, 3)
            self.assertEqual(unit2.bed_rooms, 5)
            self.assertEqual(unit3.bed_rooms, 7)

            self.assertTrue(Unit.objects.filter(property=self.property, unit='1004').exists())
            self.assertTrue(Unit.objects.filter(property=self.property, unit='1005').exists())

    def test_pull_res_man_lost_prospect_reasons(self):
        with patch('requests.post', return_value=MockResponse(content=dict(), status_code=400)):
            pull_res_man_lost_prospect_reasons()
            self.assertEqual(ProspectLostReason.objects.filter(property=self.property).count(), 0)

        mock_response = {
            'LostProspectReasons': [
                {
                    'ID': '1000',
                    'Name': 'Availability',
                },
                {
                    'ID': '1001',
                    'Name': 'Cancelled',
                }
            ]
        }
        with patch('requests.post', return_value=MockResponse(content=json.dumps(mock_response), status_code=200)):
            pull_res_man_lost_prospect_reasons()
            lost_reasons = ProspectLostReason.objects.filter(external_id__in=['1000', '1001'],
                                                             property=self.property)
            self.assertEqual(lost_reasons.count(), 2)

    def test_pull_res_man_prospect_sources(self):
        with patch('requests.post', return_value=MockResponse(content=dict(), status_code=400)):
            pull_res_man_prospect_sources()
            self.assertEqual(ProspectSource.objects.filter(property=self.property).count(), 0)

        mock_response = {
            'ProspectSources': [
                {
                    'ID': '1000',
                    'Name': 'Google.com',
                },
                {
                    'ID': '1001',
                    'Name': 'Mark-Taylor.com',
                }
            ]
        }
        with patch('requests.post', return_value=MockResponse(content=json.dumps(mock_response), status_code=200)):
            pull_res_man_prospect_sources()
            lost_reasons = ProspectSource.objects.filter(external_id__in=['1000', '1001'], property=self.property)
            self.assertEqual(lost_reasons.count(), 2)

    def test_get_employees(self):
        with patch('requests.post', return_value=MockResponse(content=dict(), status_code=400)):
            employees = get_employees(self.property)
            self.assertIsNone(employees)

        mock_response = {
            'Employees': [
                {
                    'Name': '* On-Site',
                    'ID': '1000',
                    'Email': 'user1@on-site.com',
                    'SecurityGroup': 'Leasing'
                },
                {
                    'Name': '* On-Site',
                    'ID': '1001',
                    'Email': 'user2@on-site.com',
                    'SecurityGroup': 'Leasing'
                },
            ]
        }
        with patch('requests.post', return_value=MockResponse(content=json.dumps(mock_response), status_code=200)):
            employees = get_employees(self.property)
            self.assertEqual(employees[0]['Email'], 'user1@on-site.com')
            self.assertEqual(employees[1]['Email'], 'user2@on-site.com')

    def test_get_employee(self):
        employees = [
            {
                'Name': '* On-Site',
                'ID': '1000',
                'Email': 'user1@on-site.com',
                'SecurityGroup': 'Leasing'
            },
            {
                'Name': '* On-Site',
                'ID': '1001',
                'Email': 'user2@on-site.com',
                'SecurityGroup': 'Leasing'
            },
        ]
        self.assertIsNone(get_employee(employees, id='1002'))
        self.assertEqual(get_employee(employees, id='1000')['Email'], 'user1@on-site.com')
        self.assertEqual(get_employee(employees, email='user2@on-site.com')['ID'], '1001')

    def test_check_application_status(self):
        lead = LeadFactory(property=self.property, resman_person_id='1000')
        people = {
            'People': [
                {
                    'PersonID': '1000',
                    'Status': 'Current'
                },
                {
                    'PersonID': '1001',
                    'Status': 'Pending'
                },
            ]
        }
        self.assertTrue(check_application_status(lead, people))

    def test_get_notice_to_vacate(self):
        with patch('requests.post', return_value=MockResponse(content=dict(), status_code=400)):
            result = get_notice_to_vacate('2020-01-01', '2020-02-01', self.property)
            self.assertEqual(result, None)

        mock_response = {
            'OnNotices': [{}, {}]
        }
        with patch('requests.post', return_value=MockResponse(json_data=mock_response, status_code=200)):
            result = get_notice_to_vacate('2020-01-01', '2020-02-01', self.property)
            self.assertEqual(result, 2)

    def test_get_expected_move_in(self):
        with patch('requests.post', return_value=MockResponse(content='', status_code=400)):
            result = get_expected_move_in('2020-01-01', '2020-02-01', self.property)
            self.assertEqual(result, None)

        with patch('requests.post',
                   return_value=MockResponse(content='<ResMan><Status>Error</Status></ResMan>', status_code=200)):
            result = get_expected_move_in('2020-01-01', '2020-02-01', self.property)
            self.assertEqual(result, None)

        mock_response = """
            <ResMan>
                <Status>Success</Status>
                <Response>
                    <LeadManagement>
                        <Prospects>
                            <Prospect>
                                <Customers>
                                    <Customer Type="prospect">
                                    </Customer>
                                </Customers>
                                <Events>
                                    <Event EventType="Email" EventDate="2019-10-03T07:29:52+00:00">
                                    </Event>
                                </Events>
                            </Prospect>
                            <Prospect>
                                <Customers>
                                    <Customer Type="prospect">
                                    </Customer>
                                    <Customer Type="applicant">
                                    </Customer>
                                </Customers>
                                <Events>
                                    <Event EventType="Email" EventDate="2019-10-03T07:29:52+00:00">
                                    </Event>
                                </Events>
                            </Prospect>
                            <Prospect>
                                <Customers>
                                    <Customer Type="prospect">
                                    </Customer>
                                    <Customer Type="applicant">
                                    </Customer>
                                </Customers>
                                <Events>
                                    <Event EventType="Approved" EventDate="2019-10-03T07:29:52+00:00">
                                    </Event>
                                </Events>
                            </Prospect>
                        </Prospects>
                    </LeadManagement>
                </Response>
            </ResMan>
        """
        with patch('requests.post', return_value=MockResponse(content=mock_response, status_code=200)):
            result = get_expected_move_in('2020-01-01', '2020-02-01', self.property)
            self.assertEqual(result, 1)

    @freeze_time('2020-03-16T21:58:01.795643')
    def test_remove_duplicated_lead(self):
        lead = LeadFactory(property=self.property, resman_person_id='1000')
        with patch('requests.post') as mock_resman_api:
            remove_duplicated_lead(lead, 'prospect_id', 'person_id', 'employee_id', 'lost_reason_id')
            response = mock_resman_api.call_args_list[0][1]['data']['Xml']
            self.assertIn(f'<FirstName>{lead.first_name}</FirstName>', response)
            self.assertIn(f'<LastName>{lead.last_name}</LastName>', response)
            self.assertIn('<TransactionSource>lost_reason_id</TransactionSource>', response)
