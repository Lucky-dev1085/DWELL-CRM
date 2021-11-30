from datetime import datetime

import pytz
from freezegun import freeze_time

from backend.api.factories import PropertyFactory, FloorPlanFactory, \
    UnitFactory
from backend.api.models import Property, Survey, Competitor
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import simple_divider, get_marketing_comp_data

TZ = pytz.timezone('America/Phoenix')


class ReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(ReportUtilsTests, self).setUp()

    @freeze_time(TZ.localize(datetime(2020, 1, 1, 8, 10)))
    def test_get_marketing_comp_data(self):
        property1 = PropertyFactory(client=self.m_client, status='ACTIVE')
        property2 = PropertyFactory(client=self.m_client, status='ACTIVE')

        properties = Property.objects.filter(name__in=[property1.name, property2.name])

        data = dict(STUDIO=dict(market_rent=0, effective_rent=0), ONE_BED=dict(market_rent=0, effective_rent=0),
                    TWO_BED=dict(market_rent=0, effective_rent=0), THREE_BED=dict(market_rent=0, effective_rent=0),
                    TWO_BED_PENTHOUSE=dict(market_rent=0, effective_rent=0),
                    ONE_BED_PENTHOUSE=dict(market_rent=0, effective_rent=0))
        for property in properties:
            floor_plan = FloorPlanFactory(property=property, plan='{} plan'.format(property.name[0]))
            unit = UnitFactory(unit='{} studio unit'.format(property.name[0]), property=property, bed_rooms=0,
                               status='AVAILABLE', market_rent=1200 if property.id == property1.id else 1000,
                               effective_rent=1191.67 if property.id == property1.id else 991.67,
                               floor_plan=floor_plan)
            data['STUDIO']['market_rent'] += unit.market_rent
            data['STUDIO']['effective_rent'] += unit.effective_rent

            unit = UnitFactory(unit='{} one bedroom unit'.format(property.name[0]), property=property,
                               bed_rooms=1,
                               status='AVAILABLE', market_rent=1300 if property.id == property1.id else 1100,
                               effective_rent=1291.67 if property.id == property1.id else 1091.67,
                               floor_plan=floor_plan)
            data['ONE_BED']['market_rent'] += unit.market_rent
            data['ONE_BED']['effective_rent'] += unit.effective_rent

            unit = UnitFactory(unit='{} two bedroom unit'.format(property.name[0]), property=property,
                               bed_rooms=2,
                               status='AVAILABLE', market_rent=1400 if property.id == property1.id else 1200,
                               effective_rent=1391.67 if property.id == property1.id else 1191.67,
                               floor_plan=floor_plan)
            data['TWO_BED']['market_rent'] += unit.market_rent
            data['TWO_BED']['effective_rent'] += unit.effective_rent

            unit = UnitFactory(unit='{} three bedroom unit'.format(property.name[0]), property=property,
                               bed_rooms=3,
                               status='AVAILABLE', market_rent=1500 if property.id == property1.id else 1300,
                               effective_rent=1491.67 if property.id == property1.id else 1291.67,
                               floor_plan=floor_plan)
            data['THREE_BED']['market_rent'] += unit.market_rent
            data['THREE_BED']['effective_rent'] += unit.effective_rent

        # all properties
        marketing_comp_report = get_marketing_comp_data((datetime(year=2020, month=1, day=1),
                                                         datetime(year=2020, month=2, day=10)), properties)

        market_rent_avg_data = marketing_comp_report['market_rent_avg']
        effective_rent_avg_data = marketing_comp_report['effective_rent_avg']
        # studio
        market_rent_avg_studio = next(item for item in market_rent_avg_data
                                      if item['unit_class'] == Survey.CLASS_STUDIO)
        effective_rent_avg_studio = next(item for item in effective_rent_avg_data
                                         if item['unit_class'] == Survey.CLASS_STUDIO)
        self.assertEqual(market_rent_avg_studio['market_rent_avg'], simple_divider(data['STUDIO']['market_rent'], 2))
        self.assertEqual(effective_rent_avg_studio['effective_rent_avg'],
                         simple_divider(data['STUDIO']['effective_rent'], 2))

        # one bed
        market_rent_avg_one_bed = next(item for item in market_rent_avg_data
                                       if item['unit_class'] == Survey.CLASS_ONE_BED)
        effective_rent_avg_one_bed = next(item for item in effective_rent_avg_data
                                          if item['unit_class'] == Survey.CLASS_ONE_BED)
        self.assertEqual(market_rent_avg_one_bed['market_rent_avg'], simple_divider(data['ONE_BED']['market_rent'], 2))
        self.assertEqual(effective_rent_avg_one_bed['effective_rent_avg'],
                         simple_divider(data['ONE_BED']['effective_rent'], 2))

        # two bed
        market_rent_avg_two_bed = next(item for item in market_rent_avg_data
                                       if item['unit_class'] == Survey.CLASS_TWO_BED)
        effective_rent_avg_two_bed = next(item for item in effective_rent_avg_data
                                          if item['unit_class'] == Survey.CLASS_TWO_BED)
        self.assertEqual(market_rent_avg_two_bed['market_rent_avg'], simple_divider(data['TWO_BED']['market_rent'], 2))
        self.assertEqual(effective_rent_avg_two_bed['effective_rent_avg'],
                         simple_divider(data['TWO_BED']['effective_rent'], 2))

        # three bed
        market_rent_avg_three_bed = next(item for item in market_rent_avg_data
                                         if item['unit_class'] == Survey.CLASS_THREE_BED)
        effective_rent_avg_three_bed = next(item for item in effective_rent_avg_data
                                            if item['unit_class'] == Survey.CLASS_THREE_BED)
        self.assertEqual(market_rent_avg_three_bed['market_rent_avg'],
                         simple_divider(data['THREE_BED']['market_rent'], 2))
        self.assertEqual(effective_rent_avg_three_bed['effective_rent_avg'],
                         simple_divider(data['THREE_BED']['effective_rent'], 2))

        for property in properties:
            competitor1 = Competitor.objects.create(property=property, name='{} competitor 1'.format(property.name))

            survey = Survey.objects.create(property=property, unit_type='1/1', unit_type_name='A1',
                                           unit_class=Survey.CLASS_ONE_BED, market_rent=1250, effective_rent=1241.67,
                                           concession_amount=100, competitor=competitor1,
                                           date=datetime(year=2020, month=1, day=1).date())
            data['ONE_BED']['market_rent'] += survey.market_rent
            data['ONE_BED']['effective_rent'] += survey.effective_rent

            survey = Survey.objects.create(property=property, unit_type='2/1', unit_type_name='A2',
                                           unit_class=Survey.CLASS_TWO_BED_PENTHOUSE if property.id == property1.id else
                                           Survey.CLASS_ONE_BED_PENTHOUSE, market_rent=1350, effective_rent=1341.67,
                                           concession_amount=100, competitor=competitor1,
                                           date=datetime(year=2020, month=2, day=1).date())
            data['TWO_BED_PENTHOUSE' if property.id == property1.id else 'ONE_BED_PENTHOUSE']['market_rent'] += \
                survey.market_rent
            data['TWO_BED_PENTHOUSE' if property.id == property1.id else 'ONE_BED_PENTHOUSE']['effective_rent'] += \
                survey.effective_rent

        # all properties with competitors
        marketing_comp_report = get_marketing_comp_data((datetime(year=2020, month=1, day=1),
                                                         datetime(year=2020, month=2, day=10)), properties)

        market_rent_avg_data = marketing_comp_report['market_rent_avg']
        effective_rent_avg_data = marketing_comp_report['effective_rent_avg']
        # one bed
        market_rent_avg_one_bed = next(item for item in market_rent_avg_data
                                       if item['unit_class'] == Survey.CLASS_ONE_BED)
        effective_rent_avg_one_bed = next(item for item in effective_rent_avg_data
                                          if item['unit_class'] == Survey.CLASS_ONE_BED)
        self.assertEqual(market_rent_avg_one_bed['market_rent_avg'],
                         simple_divider(data['ONE_BED']['market_rent'], 4))
        self.assertEqual(effective_rent_avg_one_bed['effective_rent_avg'],
                         simple_divider(data['ONE_BED']['effective_rent'], 4))

        # one bed penthouse
        market_rent_avg_one_bed_penthouse = next(item for item in market_rent_avg_data
                                                 if item['unit_class'] == Survey.CLASS_ONE_BED_PENTHOUSE)
        effective_rent_avg_one_bed_penthouse = next(item for item in effective_rent_avg_data
                                                    if item['unit_class'] == Survey.CLASS_ONE_BED_PENTHOUSE)
        self.assertEqual(market_rent_avg_one_bed_penthouse['market_rent_avg'],
                         simple_divider(data['ONE_BED_PENTHOUSE']['market_rent'], 1))
        self.assertEqual(effective_rent_avg_one_bed_penthouse['effective_rent_avg'],
                         simple_divider(data['ONE_BED_PENTHOUSE']['effective_rent'], 1))

        # two bed penthouse
        market_rent_avg_two_bed_penthouse = next(item for item in market_rent_avg_data
                                                 if item['unit_class'] == Survey.CLASS_TWO_BED_PENTHOUSE)
        effective_rent_avg_two_bed_penthouse = next(item for item in effective_rent_avg_data
                                                    if item['unit_class'] == Survey.CLASS_TWO_BED_PENTHOUSE)
        self.assertEqual(market_rent_avg_two_bed_penthouse['market_rent_avg'],
                         simple_divider(data['TWO_BED_PENTHOUSE']['market_rent'], 1))
        self.assertEqual(effective_rent_avg_two_bed_penthouse['effective_rent_avg'],
                         simple_divider(data['TWO_BED_PENTHOUSE']['effective_rent'], 1))
