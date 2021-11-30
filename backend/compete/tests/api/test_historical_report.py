import pytz
from json import loads
from datetime import datetime, date
from freezegun import freeze_time
from django.urls import reverse

from rest_framework import status
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.management.commands.compete_initial_data import generate_historical_report
from backend.compete.views.report import HistoryReportMixin, REPORT_TYPE_RENT_PER_UNIT_HISTORY, \
    REPORT_TYPE_RENT_PER_SQFT_HISTORY, REPORT_TYPE_OCCUPANCY_HISTORY, REPORT_TYPE_CONCESSION_HISTORY, \
    REPORT_TYPE_CONCESSION_RATE_HISTORY, REPORT_TYPE_RENT_COMPARE_HISTORY
from backend.compete.models import Property, Submarket, Market, UnitRentReport, Comparison


TZ = pytz.timezone('America/Phoenix')


@freeze_time(TZ.localize(datetime(2021, 4, 1, 0, 0)))
class HistoricalReportTests(BaseTestCase):
    def setUp(self):
        super(HistoricalReportTests, self).setUp()
        generate_historical_report(90, datetime(2021, 4, 1))

    def test_get_date_range(self):
        # Monthly
        group = 'MONTHLY'

        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, dict(group=group), {})

        # Last 3 months
        history_report.period = 'LAST_3_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2021, 2, 1))

        # Last 6 months
        history_report.period = 'LAST_6_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2020, 11, 1))

        # Last 12 months
        history_report.period = 'LAST_12_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2020, 5, 1))

        # Weekly
        history_report.group = 'WEEKLY'

        # Last 4 weeks
        history_report.period = 'LAST_4_WEEKS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2021, 3, 7))

        # This month
        history_report.period = 'THIS_MONTH'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2021, 3, 28))

        # Last 3 months
        history_report.period = 'LAST_3_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2021, 1, 31))

        # Last 6 months
        history_report.period = 'LAST_6_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2020, 11, 1))

        # Last 12 months
        history_report.period = 'LAST_12_MONTHS'
        start, _ = history_report.get_date_range()
        self.assertEqual(start, date(2020, 4, 26))

    def test_get_chart_metrics_value_by_range(self):
        first_property = Property.objects.first()
        second_property = Property.objects.last()

        unit_rent_reports = first_property.unit_rent_reports.filter(
            unit_type='ONE_BEDROOM', report__date__range=('2021-03-28', '2021-04-01')
        )
        unit_rent_reports.filter(
            report__date__range=('2021-03-28', '2021-03-30')
        ).update(rent_sum=5000, sqft_sum=500, units_count=5)
        unit_rent_reports.filter(
            report__date__range=('2021-03-31', '2021-04-01')
        ).update(rent_sum=6000, sqft_sum=600, units_count=3)

        for unit_rent_report in unit_rent_reports:
            UnitRentReport.objects.create(property=first_property, report=unit_rent_report.report, unit_type='COMBINED')

        combined_rent_reports = first_property.unit_rent_reports.filter(
            unit_type='COMBINED', report__date__range=('2021-03-28', '2021-04-01')
        )
        combined_rent_reports.filter(
            report__date__range=('2021-03-28', '2021-03-30')
        ).update(rent_sum=5000, sqft_sum=500, units_count=5, blended_rent=1000)
        combined_rent_reports.filter(
            report__date__range=('2021-03-31', '2021-04-01')
        ).update(rent_sum=6000, sqft_sum=600, units_count=3, blended_rent=2000)

        compare_unit_rent_reports = second_property.unit_rent_reports.filter(
            unit_type='ONE_BEDROOM', report__date__range=('2021-03-28', '2021-04-01')
        )
        compare_unit_rent_reports.filter(
            report__date__range=('2021-03-28', '2021-04-01')
        ).update(rent_sum=1000, sqft_sum=500, units_count=5)

        # Rent per unit
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(unit_rent_reports)
        self.assertEqual(round(value, 2), 1285.71)

        # Combined rent per unit
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, dict(group='MONTHLY'), {})
        history_report.unit_type = 'COMBINED'
        value = history_report.get_chart_metrics_value_by_range(combined_rent_reports)
        self.assertEqual(round(value, 2), 1400)

        # Rent per sqft
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_SQFT_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(unit_rent_reports, REPORT_TYPE_RENT_PER_SQFT_HISTORY)
        self.assertEqual(value, 10.0)

        compare_unit_report_ids = list(unit_rent_reports.values_list('pk', flat=True)) + \
                          list(compare_unit_rent_reports.values_list('pk', flat=True))

        # Rent compare
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_COMPARE_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(
            unit_rent_reports, UnitRentReport.objects.filter(id__in=compare_unit_report_ids)
        )
        self.assertEqual(round(value, 2), 590.06)

        reports = first_property.reports.filter(date__range=('2021-03-28', '2021-04-01'))
        reports.filter(date__range=('2021-03-28', '2021-03-30')).update(occupancy=90)
        reports.filter(date__range=('2021-03-31', '2021-04-01')).update(occupancy=80)

        # Occupancy
        history_report = HistoryReportMixin(REPORT_TYPE_OCCUPANCY_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(reports)
        self.assertEqual(value, 86)

        reports.filter(date__range=('2021-03-28', '2021-03-30')).update(concession=None)
        reports.filter(date__range=('2021-03-31', '2021-04-01')).update(concession=1000)

        # Concession
        history_report = HistoryReportMixin(REPORT_TYPE_CONCESSION_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(reports)
        self.assertEqual(value, 1000)

        reports.filter(date__range=('2021-03-28', '2021-03-30')).update(concession_avg_rent_percent=None)
        reports.filter(date__range=('2021-03-31', '2021-04-01')).update(concession_avg_rent_percent=80)

        # Concession rate
        history_report = HistoryReportMixin(REPORT_TYPE_CONCESSION_RATE_HISTORY, dict(group='MONTHLY'), {})
        value = history_report.get_chart_metrics_value_by_range(reports)
        self.assertEqual(value, 80)

    def test_rent_history(self):
        """
        Test rent history API
        """
        property = Property.objects.first()
        endpoint = reverse('rent_history', kwargs={'property_pk': property.id})

        data = dict(period='LAST_3_MONTHS', group='MONTHLY', unit_type='ONE_BEDROOM', rent_as='UNIT')
        response = self.client.get(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        chart_values = content.get('chart_values', [])
        self.assertEqual(len(chart_values), 3)

        self.assertEqual(chart_values[0]['start_date'], '2021-02-01')
        self.assertEqual(chart_values[0]['end_date'], '2021-02-28')

        self.assertEqual(chart_values[2]['start_date'], '2021-04-01')
        self.assertEqual(chart_values[2]['end_date'], '2021-04-01')

        self.assertEqual(content.get('net_rent'), round(chart_values[2]['value'] - chart_values[0]['value'], 2))
        self.assertEqual(
            content.get('net_rent_change'),
            round((chart_values[2]['value'] - chart_values[0]['value']) * 100 / chart_values[2]['value'], 2)
        )

    def test_rent_compare_history(self):
        """
        Test rent compare history API
        """
        property = Property.objects.first()
        endpoint = reverse('rent_compare_history', kwargs={'property_pk': property.id})

        data = dict(period='LAST_3_MONTHS', group='MONTHLY', unit_type='ONE_BEDROOM')
        response = self.client.get(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        chart_values = content.get('chart_values', [])
        self.assertEqual(len(chart_values), 3)

        self.assertEqual(chart_values[0]['start_date'], '2021-02-01')
        self.assertEqual(chart_values[0]['end_date'], '2021-02-28')

        self.assertEqual(chart_values[2]['start_date'], '2021-04-01')
        self.assertEqual(chart_values[2]['end_date'], '2021-04-01')

        self.assertEqual(content.get('net_rent'), round(chart_values[2]['value'] - chart_values[0]['value'], 2))
        self.assertEqual(
            content.get('net_rent_change'),
            round((chart_values[2]['value'] - chart_values[0]['value']) * 100 / chart_values[2]['value'], 2)
        )

    def test_occupancy_history(self):
        """
        Test occupancy history API
        """
        submarket = Submarket.objects.first()
        endpoint = reverse('occupancy_history', kwargs={'sub_market_pk': submarket.id})

        data = dict(period='LAST_4_WEEKS', group='WEEKLY')
        response = self.client.get(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        chart_values = content.get('chart_values', [])
        self.assertEqual(len(chart_values), 4)

        self.assertEqual(chart_values[0]['start_date'], '2021-03-07')
        self.assertEqual(chart_values[0]['end_date'], '2021-03-13')

        self.assertEqual(chart_values[3]['start_date'], '2021-03-28')
        self.assertEqual(chart_values[3]['end_date'], '2021-04-01')

    def test_concession_history(self):
        """
        Test concession history API
        """
        market = Market.objects.first()
        endpoint = reverse('concession_history', kwargs={'market_pk': market.id})

        data = dict(period='THIS_MONTH', group='WEEKLY')
        response = self.client.get(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = loads(response.content)

        chart_values = content.get('chart_values', [])
        self.assertEqual(len(chart_values), 1)

        self.assertEqual(chart_values[0]['start_date'], '2021-03-28')
        self.assertEqual(chart_values[0]['end_date'], '2021-04-01')

        self.assertEqual(content.get('net_concession'), 0)
        self.assertEqual(content.get('net_concession_rent'), 0)

    def test_include_subject_asset_to_comparison_set(self):
        """
        Test "include subject asset to comparison set" query param
        """
        submarket = Submarket.objects.first()
        property = submarket.get_properties().first()

        # property <> submarket
        comparison = Comparison.objects.create(
            subject_asset_type='PROPERTY', subject_property=property, compared_asset_type='SUB_MARKET',
            compared_sub_market=submarket, user=self.user
        )

        params = dict(period='THIS_MONTH', group='WEEKLY', include_subject_asset='true', comparison=comparison.pk)
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, params, {'sub_market_pk': submarket.id})
        self.assertEqual(history_report.properties.count(), submarket.get_properties().count())

        params = dict(period='THIS_MONTH', group='WEEKLY', include_subject_asset='false', comparison=comparison.pk)
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, params, {'sub_market_pk': submarket.id})
        self.assertEqual(history_report.properties.count() + 1, submarket.get_properties().count())

        # submarket <> market
        market = submarket.market
        comparison = Comparison.objects.create(
            subject_asset_type='SUB_MARKET', subject_sub_market=submarket, compared_asset_type='MARKET',
            market=market, user=self.user
        )

        params = dict(period='THIS_MONTH', group='WEEKLY', include_subject_asset='true', comparison=comparison.pk)
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, params, {'market_pk': market.id})
        self.assertEqual(history_report.properties.count(), market.get_properties().count())

        params = dict(period='THIS_MONTH', group='WEEKLY', include_subject_asset='false', comparison=comparison.pk)
        history_report = HistoryReportMixin(REPORT_TYPE_RENT_PER_UNIT_HISTORY, params, {'market_pk': market.id})
        self.assertEqual(history_report.properties.count() + submarket.get_properties().count(), market.get_properties().count())
