import pytz

from datetime import timedelta, datetime
from dateutil.relativedelta import relativedelta

from django.db.models import Avg, Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from backend.compete.models import Property, Market, Submarket, Report, UnitRentReport, Comparison
from backend.api.views.reports.report_utils import simple_divider

TZ = pytz.timezone('America/Phoenix')

REPORT_TYPE_RENT_PER_SQFT_HISTORY = 'rent_per_sqft_history'
REPORT_TYPE_RENT_PER_UNIT_HISTORY = 'rent_per_unit_history'
REPORT_TYPE_RENT_COMPARE_HISTORY = 'rent_compare_history'
REPORT_TYPE_OCCUPANCY_HISTORY = 'occupancy_history'
REPORT_TYPE_CONCESSION_HISTORY = 'concession_history'
REPORT_TYPE_CONCESSION_RATE_HISTORY = 'concession_rate_history'


class HistoryReportMixin:
    report_type = None
    group = None
    unit_type = None
    period = None
    date_range = None
    properties = None

    def __init__(self, report_type, params, kwargs):
        self.period = params.get('period')
        self.group = params.get('group')
        self.unit_type = params.get('unit_type')
        self.rent_as = params.get('rent_as', 'UNIT')
        self.comparison = Comparison.objects.filter(pk=params.get('comparison')).first()
        self.include_subject_asset = params.get('include_subject_asset', 'true') == 'true'
        self.date_range = self.get_date_range()
        self.properties = self.get_assets(kwargs)
        self.report_type = report_type

    def get_assets(self, kwargs):
        properties = None
        if kwargs.get('property_pk'):
            properties = Property.objects.filter(id=kwargs.get('property_pk'))
        if kwargs.get('market_pk'):
            properties = Market.objects.get(id=kwargs.get('market_pk')).get_properties()
        if kwargs.get('sub_market_pk'):
            properties = Submarket.objects.get(id=kwargs.get('sub_market_pk')).get_properties()

        if not self.include_subject_asset and self.comparison:
            subject_asset_pks = list(self.comparison.get_subject_assets().values_list('pk', flat=True))

            is_subject_report = \
                self.comparison.subject_asset_type == 'PROPERTY' \
                and kwargs.get('property_pk') == self.comparison.subject_property.pk \
                or self.comparison.subject_asset_type == 'SUB_MARKET' \
                and kwargs.get('sub_market_pk') == self.comparison.subject_sub_market.pk

            if not is_subject_report:
                properties = properties.exclude(pk__in=subject_asset_pks)
        return properties

    @staticmethod
    def get_net_value(chart_values):
        most_recent_rent = chart_values[-1].get('value')
        least_recent_rent = chart_values[0].get('value')

        net_rent = round(most_recent_rent - least_recent_rent, 2)
        net_rent_change = round((most_recent_rent - least_recent_rent) * 100 / most_recent_rent, 2) \
            if most_recent_rent != 0 else 0
        return net_rent, net_rent_change

    def get_date_range(self):
        start = None
        end = datetime.now(tz=TZ).date()

        if self.group == 'MONTHLY':
            if self.period == 'LAST_3_MONTHS':
                start = (end - relativedelta(months=2)).replace(day=1)
            if self.period == 'LAST_6_MONTHS':
                start = (end - relativedelta(months=5)).replace(day=1)
            if self.period == 'LAST_12_MONTHS':
                start = (end - relativedelta(months=11)).replace(day=1)
        else:
            if self.period == 'LAST_4_WEEKS':
                # We should count this week as well
                start = end - relativedelta(weeks=3)
            if self.period == 'THIS_MONTH':
                start = end.replace(day=1)
            if self.period == 'LAST_3_MONTHS':
                start = end - relativedelta(months=2)
            if self.period == 'LAST_6_MONTHS':
                start = end - relativedelta(months=5)
            if self.period == 'LAST_12_MONTHS':
                start = end - relativedelta(months=11)

            if start.weekday() != 6:
                start = start - timedelta(days=start.weekday() + 1)
        return start, end

    def get_report_values(self, date_range):
        report_values = None
        comparing_values = None
        if self.report_type in [REPORT_TYPE_RENT_PER_UNIT_HISTORY, REPORT_TYPE_RENT_PER_SQFT_HISTORY]:
            report_values = UnitRentReport.objects.filter(
                property__in=self.properties, unit_type=self.unit_type, report__date__range=date_range
            )
        if self.report_type == REPORT_TYPE_RENT_COMPARE_HISTORY:
            property = self.properties.first()
            report_values = UnitRentReport.objects.filter(
                property__in=self.properties, unit_type=self.unit_type, report__date__range=date_range
            )
            comparing_values = UnitRentReport.objects.filter(
                property__in=property.submarket.get_properties(), unit_type=self.unit_type,
                report__date__range=date_range
            )

        if self.report_type in [REPORT_TYPE_CONCESSION_HISTORY, REPORT_TYPE_CONCESSION_RATE_HISTORY]:
            report_values = Report.objects.filter(property__in=self.properties, date__range=date_range)\
                .values('date', 'concession')
        if self.report_type == REPORT_TYPE_OCCUPANCY_HISTORY:
            report_values = Report.objects.filter(property__in=self.properties, date__range=date_range)\
                .values('date', 'occupancy')
        return report_values, comparing_values

    def get_chart_metrics_value_by_range(self, values, comparing_values=None):
        if self.report_type == REPORT_TYPE_RENT_PER_UNIT_HISTORY:
            if self.unit_type == 'COMBINED':
                return values.aggregate(average_rent=Avg('blended_rent')).get('average_rent')
            else:
                return values.aggregate(
                    average_rent=Sum('rent_sum') / Sum('units_count')
                ).get('average_rent')
        if self.report_type == REPORT_TYPE_RENT_PER_SQFT_HISTORY:
            average_rent = values.aggregate(
                average_rent=Sum('rent_sum') / Sum('units_count')
            ).get('average_rent')
            average_sqft = values.aggregate(
                average_sqft=Sum('sqft_sum') / Sum('units_count')
            ).get('average_sqft')
            if not average_rent or not average_sqft:
                return None
            return round(average_rent / average_sqft, 2)
        if self.report_type == REPORT_TYPE_RENT_COMPARE_HISTORY:
            if self.unit_type == 'COMBINED':
                property_rent_price = values.aggregate(average_rent=Avg('blended_rent')).get('average_rent')
                comparing_rent_price = comparing_values.aggregate(average_rent=Avg('blended_rent')).get('average_rent')
            else:
                property_rent_price = values.aggregate(
                    average_rent=Sum('rent_sum') / Sum('units_count')
                ).get('average_rent')
                comparing_rent_price = comparing_values.aggregate(
                    average_rent=Sum('rent_sum') / Sum('units_count')
                ).get('average_rent')
            if property_rent_price and comparing_rent_price:
                return property_rent_price - comparing_rent_price
            return None
        if self.report_type == REPORT_TYPE_OCCUPANCY_HISTORY:
            occupancy = values.aggregate(Avg('occupancy')).get('occupancy__avg')
            return round(occupancy, 2) if occupancy else None
        if self.report_type == REPORT_TYPE_CONCESSION_HISTORY:
            sum_concession = values.aggregate(Sum('concession')).get('concession__sum')
            count = values.exclude(Q(concession=None) | Q(concession=0)).count()
            return round(sum_concession / count, 2) if sum_concession and count else None
        if self.report_type == REPORT_TYPE_CONCESSION_RATE_HISTORY:
            sum_concession_avg_rent_percent = values.aggregate(
                Sum('concession_avg_rent_percent')
            ).get('concession_avg_rent_percent__sum')
            count = values.exclude(Q(concession_avg_rent_percent=None) | Q(concession_avg_rent_percent=0)).count()
            return round(sum_concession_avg_rent_percent / count,
                         2) if sum_concession_avg_rent_percent and count else None

    def get_chart_report(self):
        start, end = self.date_range
        td = relativedelta(end, start)
        results = []

        if self.group == 'WEEKLY':
            for week in range(0, (end - start).days // 7 + 1):
                default_end_date = start + timedelta(days=(week + 1) * 7)
                if default_end_date > datetime.now(TZ).date():
                    end_date = datetime.now(TZ).date()
                else:
                    end_date = default_end_date - timedelta(days=1)
                start_date = start + timedelta(days=week * 7)

                values, comparing_values = self.get_report_values((start_date, end_date))
                value = self.get_chart_metrics_value_by_range(values, comparing_values)
                results += [dict(start_date=start_date, end_date=end_date, value=value or 0)]
        if self.group == 'MONTHLY':
            for month in range(0, td.months + 1 + td.years * 12):
                default_end_date = start + relativedelta(months=month + 1) - timedelta(days=1)
                end_date = datetime.now(TZ).date() \
                    if default_end_date > datetime.now(TZ).date() \
                    else default_end_date
                start_date = start + relativedelta(months=month)

                values, comparing_values = self.get_report_values((start_date, end_date))
                value = self.get_chart_metrics_value_by_range(values, comparing_values)
                results += [dict(start_date=start_date, end_date=end_date, value=value or 0)]
        return results


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rent_history(request, **kwargs):
    rent_as = request.GET.get('rent_as', 'UNIT')

    report_type = REPORT_TYPE_RENT_PER_UNIT_HISTORY if rent_as == 'UNIT' else REPORT_TYPE_RENT_PER_SQFT_HISTORY
    history_report = HistoryReportMixin(report_type, request.GET, kwargs)
    chart_values = history_report.get_chart_report()
    net_rent, net_rent_change = history_report.get_net_value(chart_values)

    return Response(dict(chart_values=chart_values, net_rent=net_rent, net_rent_change=net_rent_change), status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rent_compare_history(request, **kwargs):
    history_report = HistoryReportMixin(REPORT_TYPE_RENT_COMPARE_HISTORY, request.GET, kwargs)
    chart_values = history_report.get_chart_report()
    net_rent, net_rent_change = history_report.get_net_value(chart_values)

    return Response(dict(chart_values=chart_values, net_rent=net_rent, net_rent_change=net_rent_change), status=200)


@api_view(['GET'])
@permission_classes([])
def occupancy_history(request, **kwargs):
    history_report = HistoryReportMixin(REPORT_TYPE_OCCUPANCY_HISTORY, request.GET, kwargs)
    chart_values = history_report.get_chart_report()

    units_count = history_report.properties.aggregate(total_units_count=Sum('units_count')).get('total_units_count')
    occupancy__avg = chart_values[-1].get('value')
    comparing_occupancy__avg = chart_values[0].get('value')

    net_absorption_unit_change = simple_divider(
        occupancy__avg * units_count - comparing_occupancy__avg * units_count, 100
    )
    net_absorption_percent_change = occupancy__avg - comparing_occupancy__avg

    return Response(
        dict(chart_values=chart_values, net_absorption_percent_change=net_absorption_percent_change,
             net_absorption_unit_change=net_absorption_unit_change), status=200)


@api_view(['GET'])
@permission_classes([])
def concession_history(request, **kwargs):
    show_as_amount = request.GET.get('show_as', 'AMOUNT') == 'AMOUNT'

    if show_as_amount:
        report_type = REPORT_TYPE_CONCESSION_HISTORY
    else:
        report_type = REPORT_TYPE_CONCESSION_RATE_HISTORY

    history_report = HistoryReportMixin(report_type, request.GET, kwargs)
    chart_values = history_report.get_chart_report()
    net_concession, net_concession_rent = history_report.get_net_value(chart_values)

    return Response(
        dict(chart_values=chart_values, net_concession=net_concession, net_concession_rent=net_concession_rent),
        status=200
    )
