import pytz
from datetime import timedelta, datetime
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Sum, Avg, Q
from backend.celery_app import app
from backend.compete.models import UnitType, Alert, AlertLog, AlertLogDetail, AlertUnitRentLog, UnitRentReport
from backend.compete.views.report import REPORT_TYPE_RENT_PER_UNIT_HISTORY, REPORT_TYPE_CONCESSION_HISTORY, \
    REPORT_TYPE_CONCESSION_RATE_HISTORY, REPORT_TYPE_OCCUPANCY_HISTORY, REPORT_TYPE_RENT_PER_SQFT_HISTORY
from backend.api.views.notification_creation import alert_notification

TZ = pytz.timezone('America/Phoenix')


def get_reports_value_by_date_range(period, today, property):
    start = None
    end = None
    if period == 'TODAY':
        start = today
        end = start
    if period == 'LAST_DAY':
        start = today - timedelta(days=1)
        end = start
    if period == 'THIS_WEEK':
        if today.weekday() == 6:
            start = today
        else:
            start = today - timedelta(days=today.weekday() + 1)
        end = today + timedelta(days=6)
    if period == 'LAST_WEEK':
        start = today - timedelta(weeks=1)
        if today.weekday() != 6:
            start = start - timedelta(days=today.weekday() + 1)
        end = start + timedelta(days=6)
    if period == 'LAST_4_WEEKS':
        start = today - timedelta(weeks=4)
        if today.weekday() != 6:
            start = start - timedelta(days=today.weekday() + 1)
        end = start + timedelta(weeks=4) - timedelta(days=1)

    return property.reports.filter(date__range=(start.date(), end.date())).order_by('date')


def get_average_value(reports, report_type, unit_type=None):
    if report_type == REPORT_TYPE_RENT_PER_UNIT_HISTORY:
        if unit_type == 'COMBINED':
            return reports.aggregate(average_rent=Avg('blended_rent')).get('average_rent')
        else:
            return reports.aggregate(
                average_rent=Sum('rent_sum') / Sum('units_count')
            ).get('average_rent')
    if report_type == REPORT_TYPE_RENT_PER_SQFT_HISTORY:
        average_rent = reports.aggregate(
            average_rent=Sum('rent_sum') / Sum('units_count')
        ).get('average_rent')
        average_sqft = reports.aggregate(
            average_sqft=Sum('sqft_sum') / Sum('units_count')
        ).get('average_sqft')
        if not average_rent or not average_sqft:
            return None
        return round(average_rent / average_sqft, 2)
    if report_type == REPORT_TYPE_OCCUPANCY_HISTORY:
        occupancy = reports.aggregate(Avg('occupancy')).get('occupancy__avg')
        return round(occupancy, 2) if occupancy else None
    if report_type == REPORT_TYPE_CONCESSION_HISTORY:
        sum_concession = reports.aggregate(Sum('concession')).get('concession__sum')
        count = reports.exclude(Q(concession=None) | Q(concession=0)).count()
        return round(sum_concession / count, 2) if sum_concession and count else None
    if report_type == REPORT_TYPE_CONCESSION_RATE_HISTORY:
        sum_concession_avg_rent_percent = reports.aggregate(
            Sum('concession_avg_rent_percent')
        ).get('concession_avg_rent_percent__sum')
        count = reports.exclude(Q(concession_avg_rent_percent=None) | Q(concession_avg_rent_percent=0)).count()
        return round(sum_concession_avg_rent_percent / count, 2) if sum_concession_avg_rent_percent and count else None


@app.task
def check_benchmark_alert(start_date=None, alert_ids=None):
    if start_date:
        current_time = timezone.now().astimezone(tz=TZ).time()
        today = datetime.combine(parse_date(start_date), current_time).replace(tzinfo=TZ)
    else:
        today = timezone.now().astimezone(tz=TZ)

    alerts = Alert.objects.filter(type='BENCHMARK', status='ACTIVE')
    if alert_ids:
        alerts = alerts.filter(id__in=alert_ids)

    for alert in alerts:
        start_of_last_week = today - timedelta(weeks=1)
        if today.weekday() != 6:
            start_of_last_week = start_of_last_week - timedelta(days=today.weekday() + 1)

        alert_log = AlertLog.objects.create(
            alert=alert, start=start_of_last_week.date(), end=(start_of_last_week + timedelta(days=6)).date(),
            sent_on=today
        )
        for property in alert.overall_properties:
            alert_log_detail = AlertLogDetail.objects.create(
                alert_log=alert_log, property=property,
            )
            for date_range_type in ['THIS_WEEK', 'LAST_WEEK', 'LAST_4_WEEKS']:
                # calculate rent, rent per sqft, occupancy
                reports = get_reports_value_by_date_range(date_range_type, start_of_last_week, property)
                occupancy = get_average_value(reports, REPORT_TYPE_OCCUPANCY_HISTORY)

                suffix = '' if date_range_type == 'THIS_WEEK' else f'_{date_range_type.lower()}'
                setattr(alert_log_detail, f'occupancy{suffix}', occupancy)

                for unit_type_name in UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),):
                    unit_type = property.unit_types.filter(name=unit_type_name[0]).first()

                    unit_type_filter = Q()
                    if unit_type:
                        unit_type_filter = Q(unit_type=unit_type)

                    average_rent = get_average_value(
                        UnitRentReport.objects.filter(Q(report__in=reports) & unit_type_filter),
                        REPORT_TYPE_RENT_PER_UNIT_HISTORY
                    )

                    average_rent_per_sqft = get_average_value(
                        UnitRentReport.objects.filter(Q(report__in=reports) & unit_type_filter),
                        REPORT_TYPE_RENT_PER_SQFT_HISTORY
                    )

                    defaults = dict()
                    defaults[f'average_rent{suffix}'] = average_rent
                    defaults[f'average_rent_per_sqft{suffix}'] = average_rent_per_sqft
                    AlertUnitRentLog.objects.update_or_create(
                        alert_log_detail=alert_log_detail, unit_type=unit_type_name[0],
                        defaults=defaults
                    )

            for date_range_type in ['THIS_WEEK', 'LAST_WEEK', 'LAST_4_WEEKS']:
                # calculate concession
                reports = get_reports_value_by_date_range(date_range_type, start_of_last_week, property)
                concession = get_average_value(reports, REPORT_TYPE_CONCESSION_HISTORY)
                concession_avg_rent_percent = get_average_value(reports, REPORT_TYPE_CONCESSION_RATE_HISTORY)
                suffix = '' if date_range_type == 'THIS_WEEK' else f'_{date_range_type.lower()}'
                setattr(alert_log_detail, f'concession_amount{suffix}', concession)
                setattr(alert_log_detail, f'concession_avg_rent_percent{suffix}', concession_avg_rent_percent)

                if date_range_type == 'THIS_WEEK' and concession:
                    alert_log_detail.is_offering_concession = True

            alert_log_detail.save()
        alert_notification(alert_log)


@app.task
def check_threshold_alert(start_date=None, alert_ids=None):
    if start_date:
        current_time = timezone.now().astimezone(tz=TZ).time()
        today = datetime.combine(parse_date(start_date), current_time).replace(tzinfo=TZ)
    else:
        today = timezone.now().astimezone(tz=TZ)

    alerts = Alert.objects.filter(type='THRESHOLD', status='ACTIVE')
    if alert_ids:
        alerts = alerts.filter(id__in=alert_ids)

    for alert in alerts:
        alert_log = AlertLog(
            alert=alert, start=today.date(), end=today.date(), sent_on=today, baseline=alert.baseline,
            condition_subject=alert.condition_subject, condition_unit_types=alert.condition_unit_types
        )

        for property in alert.overall_properties:
            # convert previous_day to last_day
            baseline = alert.baseline.replace('PREVIOUS', 'LAST')
            subject_reports = get_reports_value_by_date_range('TODAY', today, property)
            comparing_reports = get_reports_value_by_date_range(baseline, today, property)

            if alert.condition_subject == Alert.RENT:
                for condition_unit_type in alert.condition_unit_types:
                    unit_type = property.unit_types.filter(name=condition_unit_type).first()
                    unit_type_filter = Q()
                    if unit_type:
                        unit_type_filter = Q(unit_type=unit_type)

                    subject_value = get_average_value(
                        UnitRentReport.objects.filter(Q(report__in=subject_reports) & unit_type_filter),
                        REPORT_TYPE_RENT_PER_UNIT_HISTORY, condition_unit_type
                    )
                    comparing_value = get_average_value(
                        UnitRentReport.objects.filter(Q(report__in=comparing_reports) & unit_type_filter),
                        REPORT_TYPE_RENT_PER_UNIT_HISTORY
                    )
                    if comparing_value and alert.condition_value:
                        delta = comparing_value * alert.condition_value / 100
                        check_threshold_condition(
                            alert, alert_log, property, 'average_rent', baseline, delta, subject_value, comparing_value,
                            unit_type
                        )

            if alert.condition_subject == Alert.OCCUPANCY:
                subject_value = get_average_value(subject_reports, REPORT_TYPE_OCCUPANCY_HISTORY)
                comparing_value = get_average_value(comparing_reports, REPORT_TYPE_OCCUPANCY_HISTORY)
                if comparing_value and alert.condition_value:
                    delta = comparing_value * alert.condition_value / 100
                    check_threshold_condition(
                        alert, alert_log, property, 'occupancy', baseline, delta, subject_value, comparing_value
                    )

            if alert.condition_subject == Alert.CONCESSION:
                subject_value = get_average_value(subject_reports, REPORT_TYPE_CONCESSION_HISTORY)
                comparing_value = get_average_value(comparing_reports, REPORT_TYPE_CONCESSION_HISTORY)
                if comparing_value and alert.condition_value:
                    delta = comparing_value * alert.condition_value / 100
                    check_threshold_condition(
                        alert, alert_log, property, 'concession_amount', baseline, delta, subject_value, comparing_value
                    )

        if alert_log.pk:
            alert_notification(alert_log)


def check_threshold_condition(
    alert, alert_log, property, field_name, baseline, delta, subject_value, comparing_value, unit_type=None
):
    if not delta or not subject_value:
        return

    should_alert = False

    if alert.condition_type == Alert.INCREASES and subject_value > comparing_value + delta:
        should_alert = True
    if alert.condition_type == Alert.DECREASES and subject_value < comparing_value - delta:
        should_alert = True
    if alert.condition_type == Alert.INCREASES_OR_DECREASES and \
            (subject_value > comparing_value + delta or
             subject_value < comparing_value - delta):
        should_alert = True

    if should_alert:
        if not alert_log.pk:
            alert_log.save()
        alert_log_detail, _ = AlertLogDetail.objects.get_or_create(
            alert_log=alert_log, property=property,
        )

        if alert.condition_subject == Alert.RENT:
            defaults = dict()
            defaults['average_rent'] = subject_value
            defaults[f'average_rent_{baseline.lower()}'] = comparing_value
            AlertUnitRentLog.objects.update_or_create(
                alert_log_detail=alert_log_detail, unit_type=unit_type,
                defaults=defaults
            )
        else:
            setattr(alert_log_detail, f'{field_name}', subject_value)
            setattr(alert_log_detail, f'{field_name}_{baseline.lower()}', comparing_value)

        alert_log_detail.save()
