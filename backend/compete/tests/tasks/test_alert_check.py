from datetime import datetime, date
from django.contrib.contenttypes.models import ContentType

from backend.api.models import Notification
from backend.compete.factories import AlertFactory
from backend.compete.models import Property, Alert, UnitRentReport, Market, Submarket
from backend.compete.tests.test_base import BaseTestCase
from backend.compete.management.commands.compete_initial_data import generate_historical_report
from backend.compete.tasks.check_alert import get_reports_value_by_date_range, check_benchmark_alert, \
    check_threshold_alert, get_average_value
from backend.compete.views.report import REPORT_TYPE_RENT_PER_UNIT_HISTORY, REPORT_TYPE_CONCESSION_HISTORY, \
    REPORT_TYPE_OCCUPANCY_HISTORY, REPORT_TYPE_CONCESSION_RATE_HISTORY


class AlertCheckTests(BaseTestCase):
    def setUp(self):
        super(AlertCheckTests, self).setUp()
        generate_historical_report(60, datetime(2021, 4, 1))

    def test_get_reports_value_by_date_range(self):
        property = Property.objects.first()
        today = datetime(2021, 4, 1)

        # Today
        values = get_reports_value_by_date_range('TODAY', today, property)
        self.assertEqual(values.first().date, date(2021, 4, 1))

        # LAST_DAY
        values = get_reports_value_by_date_range('LAST_DAY', today, property)
        self.assertEqual(values.first().date, date(2021, 3, 31))

        # THIS_WEEK
        values = get_reports_value_by_date_range('THIS_WEEK', today, property)
        self.assertEqual(values.first().date, date(2021, 3, 28))
        # Original end date should be 2021/4/3 but reports data is generated until today only
        self.assertEqual(values.last().date, date(2021, 4, 1))

        # LAST_WEEK
        values = get_reports_value_by_date_range('LAST_WEEK', today, property)
        self.assertEqual(values.first().date, date(2021, 3, 21))
        self.assertEqual(values.last().date, date(2021, 3, 27))

        # LAST_4_WEEKS
        values = get_reports_value_by_date_range('LAST_4_WEEKS', today, property)
        self.assertEqual(values.first().date, date(2021, 2, 28))
        self.assertEqual(values.last().date, date(2021, 3, 27))

    def test_check_benchmark_alert(self):
        alert = AlertFactory(track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, user=self.user)

        property = Property.objects.first()
        alert.properties.add(property)

        check_benchmark_alert('2021-03-29', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.first()
        log_detail = alert_log.log_details.first()

        start_of_last_week = datetime(2021, 3, 21)
        this_week_reports = get_reports_value_by_date_range('THIS_WEEK', start_of_last_week, property)
        last_week_reports = get_reports_value_by_date_range('LAST_WEEK', start_of_last_week, property)
        last_4_weeks_reports = get_reports_value_by_date_range('LAST_4_WEEKS', start_of_last_week, property)

        # Occupancy
        occupancy_this_week = get_average_value(this_week_reports, REPORT_TYPE_OCCUPANCY_HISTORY)
        occupancy_last_week = get_average_value(last_week_reports, REPORT_TYPE_OCCUPANCY_HISTORY)
        occupancy_last_4_weeks = get_average_value(last_4_weeks_reports, REPORT_TYPE_OCCUPANCY_HISTORY)

        self.assertEqual(log_detail.occupancy, occupancy_this_week)
        self.assertEqual(log_detail.occupancy_last_week, occupancy_last_week)
        self.assertEqual(log_detail.occupancy_last_4_weeks, occupancy_last_4_weeks)

        # Concession amount
        concession_this_week = get_average_value(this_week_reports, REPORT_TYPE_CONCESSION_HISTORY)
        concession_last_week = get_average_value(last_week_reports, REPORT_TYPE_CONCESSION_HISTORY)
        concession_last_4_weeks = get_average_value(last_4_weeks_reports, REPORT_TYPE_CONCESSION_HISTORY)

        # Concession avg rent percent
        concession_avg_rent_percent_this_week = get_average_value(
            this_week_reports, REPORT_TYPE_CONCESSION_RATE_HISTORY
        )
        concession_avg_rent_percent_last_week = get_average_value(
            last_week_reports, REPORT_TYPE_CONCESSION_RATE_HISTORY
        )
        concession_avg_rent_percent_last_4_weeks = get_average_value(
            last_4_weeks_reports, REPORT_TYPE_CONCESSION_RATE_HISTORY
        )

        UnitRentReport.objects.filter(report__in=this_week_reports, unit_type='COMBINED')

        self.assertEqual(log_detail.concession_amount, concession_this_week)
        self.assertEqual(log_detail.concession_amount_last_week, concession_last_week)
        self.assertEqual(log_detail.concession_amount_last_4_weeks, concession_last_4_weeks)

        this_week_unit_rent_reports = UnitRentReport.objects.filter(report__in=this_week_reports)
        last_week_unit_rent_reports = UnitRentReport.objects.filter(report__in=last_week_reports)
        last_4_weeks_unit_rent_reports = UnitRentReport.objects.filter(report__in=last_4_weeks_reports)

        # Combined Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports, REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports, REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports, REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='COMBINED').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        # 1 bed Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports.filter(unit_type='ONE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports.filter(unit_type='ONE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports.filter(unit_type='ONE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        # 2 bed Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports.filter(unit_type='TWO_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports.filter(unit_type='TWO_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports.filter(unit_type='TWO_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='TWO_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        # 3 bed Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports.filter(unit_type='THREE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports.filter(unit_type='THREE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports.filter(unit_type='THREE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='THREE_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        # 4 bed Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports.filter(unit_type='FOUR_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports.filter(unit_type='FOUR_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports.filter(unit_type='FOUR_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='FOUR_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        # 5 bed Rent
        average_rent = get_average_value(
            this_week_unit_rent_reports.filter(unit_type='FIVE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_week = get_average_value(
            last_week_unit_rent_reports.filter(unit_type='FIVE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )
        average_rent_last_4_weeks = get_average_value(
            last_4_weeks_unit_rent_reports.filter(unit_type='FIVE_BEDROOM'), REPORT_TYPE_RENT_PER_UNIT_HISTORY
        )

        rent_log = log_detail.alert_unit_rent_logs.filter(unit_type='FIVE_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, average_rent)
        self.assertEqual(rent_log.average_rent_last_week, average_rent_last_week)
        self.assertEqual(rent_log.average_rent_last_4_weeks, average_rent_last_4_weeks)

        self.assertEqual(log_detail.concession_avg_rent_percent, concession_avg_rent_percent_this_week)
        self.assertEqual(log_detail.concession_avg_rent_percent_last_week, concession_avg_rent_percent_last_week)
        self.assertEqual(log_detail.concession_avg_rent_percent_last_4_weeks, concession_avg_rent_percent_last_4_weeks)
        self.assertEqual(log_detail.is_offering_concession, bool(concession_this_week))

    def test_check_occupancy_threshold_alert(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.OCCUPANCY, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user
        )

        property = Property.objects.first()
        alert.properties.add(property)

        property.reports.filter(date='2021-04-01').update(occupancy=100)
        property.reports.filter(date='2021-03-31').update(occupancy=90)
        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.occupancy, 100)
        self.assertEqual(log_detail.occupancy_last_day, 90)

        # last week
        alert.baseline = Alert.LAST_WEEK
        alert.save()

        property.reports.filter(date__range=('2021-03-21', '2021-03-27')).update(occupancy=70)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])
        self.assertEqual(alert.logs.count(), 2)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.occupancy, 100)
        self.assertEqual(log_detail.occupancy_last_week, 70)

        # last 4 weeks
        alert.baseline = Alert.LAST_4_WEEKS
        alert.save()

        property.reports.filter(date__range=('2021-02-28', '2021-03-27')).update(occupancy=50)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])
        self.assertEqual(alert.logs.count(), 3)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.occupancy, 100)
        self.assertEqual(log_detail.occupancy_last_4_weeks, 50)

    def test_check_concession_threshold_alert(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.CONCESSION, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user
        )

        property = Property.objects.first()
        alert.properties.add(property)

        property.reports.filter(date='2021-04-01').update(concession=1000)
        property.reports.filter(date='2021-03-31').update(concession=1500)
        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.concession_amount, 1000)
        self.assertEqual(log_detail.concession_amount_last_day, 1500)

        # last week
        alert.baseline = Alert.LAST_WEEK
        alert.save()

        property.reports.filter(date__range=('2021-03-24', '2021-03-27')).update(concession=1500)
        property.reports.filter(date__range=('2021-03-21', '2021-03-23')).update(concession=None)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])
        self.assertEqual(alert.logs.count(), 2)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.concession_amount, 1000)
        self.assertEqual(log_detail.concession_amount_last_week, 1500)

        # last 4 weeks
        alert.baseline = Alert.LAST_4_WEEKS
        alert.save()

        property.reports.filter(date__range=('2021-02-28', '2021-03-05')).update(concession=1500)
        property.reports.filter(date__range=('2021-03-06', '2021-03-27')).update(concession=None)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])
        self.assertEqual(alert.logs.count(), 3)

        alert_log = alert.logs.order_by('-created').first()
        log_detail = alert_log.log_details.first()

        self.assertEqual(log_detail.concession_amount, 1000)
        self.assertEqual(log_detail.concession_amount_last_4_weeks, 1500)

    def test_check_rent_threshold_alert(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.RENT, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user, condition_unit_types=['ONE_BEDROOM']
        )

        property = Property.objects.first()
        alert.properties.add(property)

        unit_rent_reports = property.unit_rent_reports.filter(unit_type='ONE_BEDROOM')
        unit_rent_reports.filter(report__date='2021-04-01').update(rent_sum=5000, units_count=5)
        unit_rent_reports.filter(report__date='2021-03-31').update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.order_by('-created').first()
        rent_log = alert_log.log_details.first().alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()

        self.assertEqual(rent_log.average_rent, 1000)
        self.assertEqual(rent_log.average_rent_last_day, 2000)

        # last week
        alert.baseline = Alert.LAST_WEEK
        alert.save()

        unit_rent_reports.filter(report__date__range=('2021-03-24', '2021-03-27')).update(rent_sum=5000, units_count=5)
        unit_rent_reports.filter(report__date__range=('2021-03-21', '2021-03-23')).update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 2)

        alert_log = alert.logs.order_by('-created').first()
        rent_log = alert_log.log_details.first().alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()

        self.assertEqual(rent_log.average_rent, 1000)
        self.assertEqual(round(rent_log.average_rent_last_week, 2), 1310.34)

        # last 4 weeks
        alert.baseline = Alert.LAST_4_WEEKS
        alert.save()

        unit_rent_reports.filter(report__date__range=('2021-02-28', '2021-03-20')).update(rent_sum=5000, units_count=5)
        unit_rent_reports.filter(report__date__range=('2021-03-21', '2021-03-27')).update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])
        self.assertEqual(alert.logs.count(), 3)

        alert_log = alert.logs.order_by('-created').first()
        rent_log = alert_log.log_details.first().alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()

        self.assertEqual(rent_log.average_rent, 1000)
        self.assertEqual(round(rent_log.average_rent_last_4_weeks, 2), 1166.67)

    def test_check_markets_threshold_alert(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.RENT, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user, condition_unit_types=['ONE_BEDROOM']
        )

        market = Market.objects.first()
        alert.markets.add(market)

        for property in market.properties:
            unit_rent_reports = property.unit_rent_reports.filter(unit_type='ONE_BEDROOM')
            unit_rent_reports.filter(report__date='2021-04-01').update(rent_sum=5000, units_count=5)
            unit_rent_reports.filter(report__date='2021-03-31').update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.order_by('-created').first()
        self.assertEqual(alert_log.log_details.count(), market.properties.count())

        rent_log = alert_log.log_details.first().alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, 1000)
        self.assertEqual(rent_log.average_rent_last_day, 2000)

    def test_check_sub_markets_threshold_alert(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.RENT, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user, condition_unit_types=['ONE_BEDROOM']
        )

        submarket = Submarket.objects.first()
        alert.submarkets.add(submarket)

        for property in submarket.properties.all():
            unit_rent_reports = property.unit_rent_reports.filter(unit_type='ONE_BEDROOM')
            unit_rent_reports.filter(report__date='2021-04-01').update(rent_sum=5000, units_count=5)
            unit_rent_reports.filter(report__date='2021-03-31').update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.order_by('-created').first()
        self.assertEqual(alert_log.log_details.count(), submarket.properties.count())

        rent_log = alert_log.log_details.first().alert_unit_rent_logs.filter(unit_type='ONE_BEDROOM').first()
        self.assertEqual(rent_log.average_rent, 1000)
        self.assertEqual(rent_log.average_rent_last_day, 2000)

    def test_threshold_alert_notification(self):
        alert = AlertFactory(
            track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
            condition_subject=Alert.RENT, condition_type=Alert.INCREASES_OR_DECREASES,
            condition_value=1, user=self.user, condition_unit_types=['ONE_BEDROOM']
        )

        property = Property.objects.first()
        alert.properties.add(property)

        unit_rent_reports = property.unit_rent_reports.filter(unit_type='ONE_BEDROOM')
        unit_rent_reports.filter(report__date='2021-04-01').update(rent_sum=5000, units_count=5)
        unit_rent_reports.filter(report__date='2021-03-31').update(rent_sum=6000, units_count=3)

        check_threshold_alert('2021-04-01', alert_ids=[alert.id])

        alert_log = alert.logs.first()

        content_type = ContentType.objects.get(app_label='compete', model='alertlog')
        notification = Notification.objects.filter(
            object_id=alert_log.pk, object_content_type=content_type, type=Notification.TYPE_THRESHOLD_ALERT,
            user=self.user
        ).first()

        self.assertTrue(alert.name in notification.content)

    def test_benchmark_alert_notification(self):
        alert = AlertFactory(track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, user=self.user)

        property = Property.objects.first()
        alert.properties.add(property)

        check_benchmark_alert('2021-03-29', alert_ids=[alert.id])

        self.assertEqual(alert.logs.count(), 1)

        alert_log = alert.logs.first()

        content_type = ContentType.objects.get(app_label='compete', model='alertlog')
        notification = Notification.objects.filter(
            object_id=alert_log.pk, object_content_type=content_type, type=Notification.TYPE_BENCHMARK_ALERT,
            user=self.user
        ).first()

        self.assertTrue(alert.name in notification.content)
