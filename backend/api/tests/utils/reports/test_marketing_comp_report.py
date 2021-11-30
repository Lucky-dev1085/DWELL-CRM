# from datetime import datetime
#
# import pytz
# from mock import patch
#
# from backend.api.factories import PropertyFactory, FloorPlanFactory, UnitFactory
# from backend.api.models import Property, Survey, Competitor
# from backend.api.tests import PropertyLevelBaseTestCase
# from backend.api.views.reports.report_utils import get_marketing_comp_data
#
# TZ = pytz.timezone('America/Phoenix')
#
#
# class MarketingCompReportUtilsTests(PropertyLevelBaseTestCase):
#     def setUp(self):
#         super(MarketingCompReportUtilsTests, self).setUp()
#         with patch('requests.get'):
#             self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
#             self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
#             self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
#             self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))
#
#     @staticmethod
#     def _generate_mock_data(property, floor_plan_count=0, rents=None, competitors_count=0, competitor_rents=None,
#                             competitor_name='Competitor'):
#         """
#         Generate floor plan, units, competitor and surveys factories with given parameters.
#         :param floor_plan_count:
#         :param rents:
#         :param competitors_count:
#         :param competitor_rents:
#         :param competitor_name:
#         :return:
#         """
#         with patch('requests.get'):
#             for index in range(floor_plan_count):
#                 floor_plan = FloorPlanFactory(property=property, plan='{} plan'.format(property.name[:27]))
#                 if rents:
#                     if 'STUDIO' in rents:
#                         UnitFactory(unit='Studio unit', property=property,
#                                     bed_rooms=0,
#                                     status='AVAILABLE', market_rent=rents['STUDIO']['market_rent'],
#                                     effective_rent=rents['STUDIO']['effective_rent'],
#                                     floor_plan=floor_plan)
#                     if 'ONE_BED' in rents:
#                         UnitFactory(unit='One bedroom unit', property=property,
#                                     bed_rooms=1,
#                                     status='AVAILABLE', market_rent=rents['ONE_BED']['market_rent'],
#                                     effective_rent=rents['ONE_BED']['effective_rent'],
#                                     floor_plan=floor_plan)
#
#             for index in range(competitors_count):
#                 competitor = Competitor.objects.filter(property=property, name=competitor_name).first()
#                 if not competitor:
#                     competitor = Competitor.objects.create(property=property, name=competitor_name)
#
#                 if competitor_rents:
#                     if 'STUDIO' in competitor_rents:
#                         Survey.objects.create(property=property, unit_type='0/1', unit_type_name='A0',
#                                               unit_class=Survey.CLASS_STUDIO,
#                                               market_rent=competitor_rents['STUDIO']['market_rent'],
#                                               effective_rent=competitor_rents['STUDIO']['effective_rent'],
#                                               concession_amount=100, competitor=competitor,
#                                               date=datetime(year=datetime.now(tz=TZ).year,
#                                                             month=datetime.now(tz=TZ).month, day=1).date())
#                     if 'ONE_BED' in competitor_rents:
#                         Survey.objects.create(property=property, unit_type='1/1', unit_type_name='A1',
#                                               unit_class=Survey.CLASS_ONE_BED,
#                                               market_rent=competitor_rents['ONE_BED']['market_rent'],
#                                               effective_rent=competitor_rents['ONE_BED']['effective_rent'],
#                                               concession_amount=100, competitor=competitor,
#                                               date=datetime(year=datetime.now(tz=TZ).year,
#                                                             month=datetime.now(tz=TZ).month, day=1).date())
#
#     def test_mt_studio_rents(self):
#         self._generate_mock_data(self.property_1, floor_plan_count=1,
#                                  rents=dict(STUDIO=dict(market_rent=1200, effective_rent=1191.67)))
#         self._generate_mock_data(self.property_1, floor_plan_count=1,
#                                  rents=dict(STUDIO=dict(market_rent=1000, effective_rent=991.67)))
#         marketing_comp_report = get_marketing_comp_data((self.start_date, self.end_date), Property.objects.all())
#
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['market_rent_low'], 1000)  # low
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['market_rent_high'], 1200)  # high
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['market_rent'], 1100)  # average
#
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['effective_rent_low'], 991.67)  # low
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['effective_rent_high'], 1191.67)  # high
#         self.assertEqual(marketing_comp_report['mt_rents'][0]['effective_rent'], 1091.67)  # average
#
#     def test_competitors_studio_rents(self):
#         self._generate_mock_data(self.property_1, competitors_count=1, competitor_name='Competitor 1',
#                                  competitor_rents=dict(STUDIO=dict(market_rent=1200, effective_rent=1191.67)))
#         self._generate_mock_data(self.property_1, competitors_count=1, competitor_name='Competitor 1',
#                                  competitor_rents=dict(STUDIO=dict(market_rent=1000, effective_rent=991.67)))
#         marketing_comp_report = get_marketing_comp_data((self.start_date, self.end_date), Property.objects.all())
#
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['market_rent_low'], 1000)  # low
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['market_rent_high'], 1200)  # high
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['market_rent'], 1100)  # average
#
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['effective_rent_low'], 991.67)  # low
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['effective_rent_high'], 1191.67)  # high
#         self.assertEqual(marketing_comp_report['competitor_rents'][0]['effective_rent'], 1091.67)  # average
#
#     def test_competitors_rents_averages(self):
#         self._generate_mock_data(self.property_1, competitors_count=1, competitor_name='Competitor 1',
#                                  competitor_rents=dict(STUDIO=dict(market_rent=1200, effective_rent=1191.67),
#                                                        ONE_BED=dict(market_rent=1300, effective_rent=1291.67)))
#         self._generate_mock_data(self.property_2, competitors_count=1, competitor_name='Competitor 2',
#                                  competitor_rents=dict(STUDIO=dict(market_rent=1000, effective_rent=991.67),
#                                                        ONE_BED=dict(market_rent=1100, effective_rent=1091.67)))
#         marketing_comp_report = get_marketing_comp_data((self.start_date, self.end_date), Property.objects.all())
#
#         market_rent_avg_one_bed = next(item for item in marketing_comp_report['market_rent_avg']
#                                        if item['unit_class'] == Survey.CLASS_ONE_BED)
#         effective_rent_avg_one_bed = next(item for item in marketing_comp_report['effective_rent_avg']
#                                           if item['unit_class'] == Survey.CLASS_ONE_BED)
#         self.assertEqual(market_rent_avg_one_bed['market_rent_avg'], 1200)
#         self.assertEqual(effective_rent_avg_one_bed['effective_rent_avg'], 1191.7)
#
#         market_rent_avg_studio = next(item for item in marketing_comp_report['market_rent_avg']
#                                       if item['unit_class'] == Survey.CLASS_STUDIO)
#         effective_rent_avg_studio = next(item for item in marketing_comp_report['effective_rent_avg']
#                                          if item['unit_class'] == Survey.CLASS_STUDIO)
#         self.assertEqual(market_rent_avg_studio['market_rent_avg'], 1100)
#         self.assertEqual(effective_rent_avg_studio['effective_rent_avg'], 1091.7)
#
#     def test_mt_rents_averages(self):
#         self._generate_mock_data(self.property_1, floor_plan_count=1,
#                                  rents=dict(STUDIO=dict(market_rent=1200, effective_rent=1191.67),
#                                             ONE_BED=dict(market_rent=1300, effective_rent=1291.67)))
#         self._generate_mock_data(self.property_2, floor_plan_count=1,
#                                  rents=dict(STUDIO=dict(market_rent=1000, effective_rent=991.67),
#                                             ONE_BED=dict(market_rent=1100, effective_rent=1091.67)))
#         marketing_comp_report = get_marketing_comp_data((self.start_date, self.end_date), Property.objects.all())
#
#         market_rent_avg_one_bed = next(item for item in marketing_comp_report['market_rent_avg']
#                                        if item['unit_class'] == Survey.CLASS_ONE_BED)
#         effective_rent_avg_one_bed = next(item for item in marketing_comp_report['effective_rent_avg']
#                                           if item['unit_class'] == Survey.CLASS_ONE_BED)
#         self.assertEqual(market_rent_avg_one_bed['market_rent_avg'], 1200)
#         self.assertEqual(effective_rent_avg_one_bed['effective_rent_avg'], 1191.7)
#
#         market_rent_avg_studio = next(item for item in marketing_comp_report['market_rent_avg']
#                                       if item['unit_class'] == Survey.CLASS_STUDIO)
#         effective_rent_avg_studio = next(item for item in marketing_comp_report['effective_rent_avg']
#                                          if item['unit_class'] == Survey.CLASS_STUDIO)
#         self.assertEqual(market_rent_avg_studio['market_rent_avg'], 1100)
#         self.assertEqual(effective_rent_avg_studio['effective_rent_avg'], 1091.7)
