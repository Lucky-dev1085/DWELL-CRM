from unittest.mock import patch, Mock

from backend.api.tasks import pull_real_page_floor_plans
from backend.api.models import FloorPlan
from . import RealPageTaskBaseTests


class RealPageTasksTests(RealPageTaskBaseTests):
    def test_pull_res_man_floor_plans(self):
        get_units_by_property_mock_response = """
            <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <getunitsbypropertyResponse xmlns="http://tempuri.org/">
                        <getunitsbypropertyResult>
                            <GetUnitsByProperty xmlns="">
                                <UnitObject>
                                    <PmcID>4683090</PmcID>
                                    <SiteID>4683093</SiteID>
                                    <UnitID>1</UnitID>
                                    <UnitNumber>100</UnitNumber>
                                    <BuildingID>1</BuildingID>
                                    <BuildingNumber>1</BuildingNumber>
                                    <FloorplanID>1</FloorplanID>
                                    <PropertyNumberID>1</PropertyNumberID>
                                    <Address1>3708 W. Palm Avenue #100</Address1>
                                    <Address2></Address2>
                                    <CityName>Tampa  </CityName>
                                    <State>FL</State>
                                    <Zip>33626</Zip>
                                    <CountyName></CountyName>
                                    <CountryName>US</CountryName>
                                    <GrossSqFtCount>1600</GrossSqFtCount>
                                    <RentSqFtCount>1600</RentSqFtCount>
                                    <FloorNumber>3</FloorNumber>
                                    <MobilityBit>false</MobilityBit>
                                    <VisionBit>false</VisionBit>
                                    <HearingBit>false</HearingBit>
                                    <Description></Description>
                                    <NoteDescription>new microwave 3/18/13</NoteDescription>
                                    <BaseRentAmount>1550.0000</BaseRentAmount>
                                    <FloorPlanMarketRent>1550.0000</FloorPlanMarketRent>
                                    <UnitMarketRent>0.0000</UnitMarketRent>
                                    <NonRevenueFlag>0</NonRevenueFlag>
                                    <NonRefundFee>0</NonRefundFee>
                                    <MadeReadyBit>false</MadeReadyBit>
                                    <MadeReadyDate>2018-06-21T10:02:00</MadeReadyDate>
                                    <ReserveBit>false</ReserveBit>
                                    <ReservedUntil>0001-01-01T00:00:00</ReservedUntil>
                                    <DepositAmount>400.0000</DepositAmount>
                                    <LockBit>false</LockBit>
                                    <AvailableDate>2018-06-21T00:00:00</AvailableDate>
                                    <AvailableBit>false</AvailableBit>
                                    <LastActionCode>CANMONTV</LastActionCode>
                                    <LastActionDesc>cancel-notice-to-move-out</LastActionDesc>
                                    <VacantDate>2018-06-21T00:00:00</VacantDate>
                                    <VacantBit>false</VacantBit>
                                    <SkipOrBreak></SkipOrBreak>
                                    <ExcludeOnlineAvailability>false</ExcludeOnlineAvailability>
                                    <FpReportUnitOccupancy>true</FpReportUnitOccupancy>
                                </UnitObject>
                                <UnitObject>
                                    <PmcID>4683090</PmcID>
                                    <SiteID>4683093</SiteID>
                                    <UnitID>2</UnitID>
                                    <UnitNumber>101</UnitNumber>
                                    <BuildingID>1</BuildingID>
                                    <BuildingNumber>1</BuildingNumber>
                                    <FloorplanID>1</FloorplanID>
                                    <PropertyNumberID>1</PropertyNumberID>
                                    <Address1>3708 W. Palm Avenue #101</Address1>
                                    <Address2></Address2>
                                    <CityName>Tampa  </CityName>
                                    <State>FL</State>
                                    <Zip>33626</Zip>
                                    <CountyName></CountyName>
                                    <CountryName>US</CountryName>
                                    <GrossSqFtCount>1500</GrossSqFtCount>
                                    <RentSqFtCount>1500</RentSqFtCount>
                                    <FloorNumber>2</FloorNumber>
                                    <MobilityBit>false</MobilityBit>
                                    <VisionBit>false</VisionBit>
                                    <HearingBit>false</HearingBit>
                                    <Description></Description>
                                    <NoteDescription></NoteDescription>
                                    <BaseRentAmount>1450.0000</BaseRentAmount>
                                    <FloorPlanMarketRent>1450.0000</FloorPlanMarketRent>
                                    <UnitMarketRent>0.0000</UnitMarketRent>
                                    <NonRevenueFlag>0</NonRevenueFlag>
                                    <NonRefundFee>0</NonRefundFee>
                                    <MadeReadyBit>false</MadeReadyBit>
                                    <MadeReadyDate>2018-10-09T14:53:00</MadeReadyDate>
                                    <ReserveBit>false</ReserveBit>
                                    <ReservedUntil>0001-01-01T00:00:00</ReservedUntil>
                                    <DepositAmount>350.0000</DepositAmount>
                                    <LockBit>false</LockBit>
                                    <AvailableDate>2019-02-13T00:00:00</AvailableDate>
                                    <AvailableBit>false</AvailableBit>
                                    <LastActionCode>SYSFIXUA</LastActionCode>
                                    <LastActionDesc>system-fix-missing-unavailable</LastActionDesc>
                                    <VacantDate>2019-02-13T00:00:00</VacantDate>
                                    <VacantBit>false</VacantBit>
                                    <SkipOrBreak></SkipOrBreak>
                                    <ExcludeOnlineAvailability>false</ExcludeOnlineAvailability>
                                    <FpReportUnitOccupancy>true</FpReportUnitOccupancy>
                                </UnitObject>
                            </GetUnitsByProperty>
                        </getunitsbypropertyResult>
                    </getunitsbypropertyResponse>
                </s:Body>
            </s:Envelope>
        """
        get_floor_plan_list_mock_response = """
            <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <getfloorplanlistResponse xmlns="http://tempuri.org/">
                        <getfloorplanlistResult>
                            <GetFloorPlanList xmlns="">
                                <FloorPlanObject>
                                    <FloorPlanID>1</FloorPlanID>
                                    <FloorPlanCode>A1</FloorPlanCode>
                                    <FloorPlanName>One Bedroom, One Bath</FloorPlanName>
                                    <FloorPlanNameMarketing>The Single</FloorPlanNameMarketing>
                                    <FloorPlanDescription>1 Bedroom, 1 Bath</FloorPlanDescription>
                                    <Bedrooms>1</Bedrooms>
                                    <Bathrooms>1</Bathrooms>
                                    <FloorPlanGroupID>Z000000001</FloorPlanGroupID>
                                    <FloorPlanGroupName>1x1</FloorPlanGroupName>
                                    <MaximumOccupants>2</MaximumOccupants>
                                    <ExcludedFromOccupancy>false</ExcludedFromOccupancy>
                                    <GrossSquareFootage>1500</GrossSquareFootage>
                                    <RentableSquareFootage>1500</RentableSquareFootage>
                                    <RentMin>1475.0000</RentMin>
                                    <RentMax>1665.0000</RentMax>
                                </FloorPlanObject>
                                <FloorPlanObject>
                                    <FloorPlanID>2</FloorPlanID>
                                    <FloorPlanCode>A2</FloorPlanCode>
                                    <FloorPlanName>One Bedroom, One Bath</FloorPlanName>
                                    <FloorPlanNameMarketing>The Single</FloorPlanNameMarketing>
                                    <FloorPlanDescription>1 Bedroom, 1.5 Bath</FloorPlanDescription>
                                    <Bedrooms>1</Bedrooms>
                                    <Bathrooms>1.5</Bathrooms>
                                    <FloorPlanGroupID>Z000000002</FloorPlanGroupID>
                                    <FloorPlanGroupName>1x1.5</FloorPlanGroupName>
                                    <MaximumOccupants>2</MaximumOccupants>
                                    <ExcludedFromOccupancy>false</ExcludedFromOccupancy>
                                    <GrossSquareFootage>1600</GrossSquareFootage>
                                    <RentableSquareFootage>1600</RentableSquareFootage>
                                    <RentMin>1575.0000</RentMin>
                                    <RentMax>1665.0000</RentMax>
                                </FloorPlanObject>
                            </GetFloorPlanList>
                        </getfloorplanlistResult>
                    </getfloorplanlistResponse>
                </s:Body>
            </s:Envelope>
        """

        get_unit_list_mock_response = """
            <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <getunitlistResponse xmlns="http://tempuri.org/">
                        <getunitlistResult>
                            <GetUnitList xmlns="">
                                <UnitObjects>
                                    <UnitObject>
                                        <PropertyNumberID>1</PropertyNumberID>
                                        <BaseRentAmount>1950.0000</BaseRentAmount>
                                        <FloorPlanMarketRent>1900.0000</FloorPlanMarketRent>
                                        <UnitMarketRent>0.0000</UnitMarketRent>
                                        <NonRevenueFlag>0</NonRevenueFlag>
                                        <NonRefundFee>0</NonRefundFee>
                                        <DepositAmount>650</DepositAmount>
                                        <Accessibility>
                                            <HearingBit>false</HearingBit>
                                            <MobilityBit>false</MobilityBit>
                                            <VisionBit>false</VisionBit>
                                        </Accessibility>
                                        <Address>
                                            <Address1>3708 W. Palm Avenue #508</Address1>
                                            <BuildingID>1</BuildingID>
                                            <BuildingNumber>1</BuildingNumber>
                                            <CityName>Tampa  </CityName>
                                            <CountryName>US</CountryName>
                                            <State>FL</State>
                                            <UnitID>2</UnitID>
                                            <UnitNumber>508</UnitNumber>
                                            <Zip>33626</Zip>
                                        </Address>
                                        <Availability>
                                            <MadeReadyBit>true</MadeReadyBit>
                                            <MadeReadyDate>11/19/2018</MadeReadyDate>
                                            <AvailableDate>10/25/2018</AvailableDate>
                                            <AvailableBit>true</AvailableBit>
                                            <LastActionCode>SKIP</LastActionCode>
                                            <LastActionDesc>lease-skip-entered</LastActionDesc>
                                            <VacantDate>10/26/2018</VacantDate>
                                            <VacantBit>true</VacantBit>
                                        </Availability>
                                        <FloorPlan>
                                            <FloorPlanID>5</FloorPlanID>
                                            <FloorPlanCode>C1</FloorPlanCode>
                                            <FloorPlanName>Three Bedroom, Three Bath</FloorPlanName>
                                            <FloorPlanGroupName>3x3</FloorPlanGroupName>
                                            <FloorPlanGroupID>Z000000009</FloorPlanGroupID>
                                        </FloorPlan>
                                        <UnitDetails>
                                            <Bedrooms>3</Bedrooms>
                                            <Bathrooms>3</Bathrooms>
                                            <GrossSqFtCount>2000</GrossSqFtCount>
                                            <RentSqFtCount>2000</RentSqFtCount>
                                            <FloorNumber>1</FloorNumber>
                                        </UnitDetails>
                                    </UnitObject>
                                </UnitObjects>
                            </GetUnitList>
                        </getunitlistResult>
                    </getunitlistResponse>
                </s:Body>
            </s:Envelope>
        """

        mock_response = [
            Mock(), Mock(), Mock()
        ]
        mock_response[0].content = get_floor_plan_list_mock_response
        mock_response[0].status_code = 200
        mock_response[1].content = get_units_by_property_mock_response
        mock_response[1].status_code = 200
        mock_response[2].content = get_unit_list_mock_response
        mock_response[2].status_code = 200
        with patch('requests.post') as mock_set_location_url:
            mock_set_location_url.side_effect = mock_response
            pull_real_page_floor_plans()

            # Check the floor plans
            self.assertEqual(self.property.floor_plans.filter(plan__in=['A1', 'A2']).count(), 2)

            plan = FloorPlan.objects.get(property=self.property, plan='A1')

            # Check the unit existence
            unit1 = plan.units.filter(unit='101').first()
            unit2 = plan.units.filter(unit='100').first()
            self.assertIsNotNone(unit1)
            self.assertIsNotNone(unit2)

            # Check the floor plan details
            self.assertEqual(plan.description, '1 Bedroom, 1 Bath')
            self.assertEqual(plan.bedrooms, 1)
            self.assertEqual(plan.bathrooms, 1)
            self.assertEqual(plan.square_footage, 1500)
            self.assertEqual(plan.available, 2)
            self.assertEqual(plan.min_rent, 1475.0000)
            self.assertEqual(plan.max_rent, 1665.0000)
            self.assertEqual(plan.group_id, 'Z000000001')

            # Check the unit status
            self.assertEqual(unit1.status, 'AVAILABLE')
            self.assertEqual(unit2.status, 'NOT_AVAILABLE')

