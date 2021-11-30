import pytz
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Property, Portfolio, Report, FloorPlan
from backend.api.permissions import ReportAccessAuthorized
from backend.api.views.reports import get_chart_values, get_date_range, \
    get_lead_source_data, compare, calculate_overall_data
from backend.api.views.reports.report_utils import get_lead_lost_data, get_occupancy_ltn_data, get_marketing_comp_data, \
    get_calls_by_source_data, get_audition_data, get_site_reports_data

TZ = pytz.timezone('America/Phoenix')


class ReportsView(viewsets.GenericViewSet):
    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def overview_reports(self, request, **kwargs):
        params = request.query_params
        date_period = request.query_params.get('date_period')

        result = {}
        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))

        properties = []
        is_performance = params.get('attribution') == 'PERFORMANCE'
        if params.get('type') == 'property':
            properties = Property.objects.filter(pk=params.get('id'))
            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()
            result['lead_to_lease_report'] = calculate_overall_data('lead_to_lease_report', reports, is_performance)

            result['leads'] = get_audition_data(reports, 'leads')
            result['tours'] = get_audition_data(reports, 'tours')
            result['leases'] = get_audition_data(reports, 'leases')
            result['responses'] = get_audition_data(reports, 'responses')

            result['activity_report'] = calculate_overall_data('activity_report', reports, is_performance)
            result['calls_report'] = calculate_overall_data('calls_report', reports, should_list_scored_calls=True)

            result['engagement_report'] = calculate_overall_data('engagement_report', reports)
            result['tours_report'] = calculate_overall_data('tours_report', reports, is_performance)
            result['chart_values'] = get_chart_values('overview_reports', params.get('date_period'), properties,
                                                      date_range, is_performance=is_performance)

            # customer = Customer.objects.filter(properties__in=properties).first()
            # customer_reports = Report.objects.filter(property__in=customer.properties.all(),
            #                                          date__gte=date_range[0].astimezone(tz=TZ).date(),
            #                                          date__lte=date_range[1].astimezone(tz=TZ).date()).values()
            # result['calls_report']['customer_average_call_score'] = calculate_customer_call_score(customer_reports)
        elif params.get('type') == 'portfolio':
            properties = Portfolio.objects.get(pk=params.get('id')).properties.filter(is_released=True)

            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()

            lead_to_lease_report = calculate_overall_data('lead_to_lease_report', reports, is_performance,
                                                          is_drilldown=True)

            activity_report = calculate_overall_data('activity_report', reports, is_performance, is_drilldown=True)

            engagement_report = calculate_overall_data('engagement_report', reports, is_drilldown=True)

            calls_report = calculate_overall_data('calls_report', reports, is_drilldown=True,
                                                  should_list_scored_calls=True)

            tours_report = calculate_overall_data('tours_report', reports, is_performance, is_drilldown=True)

            chart_values = get_chart_values('overview_reports', params.get('date_period'), properties, date_range,
                                            is_performance=is_performance)

            overall_portfolio_values = {
                'lead_to_lease_report': calculate_overall_data('lead_to_lease_report', reports, is_performance),
                'activity_report': calculate_overall_data('activity_report', reports, is_performance),
                'calls_report': calculate_overall_data('calls_report', reports, should_list_scored_calls=True),
                'engagement_report': calculate_overall_data('engagement_report', reports),
                'tours_report': calculate_overall_data('tours_report', reports, is_performance),
            }
            result = {
                'lead_to_lease_report': lead_to_lease_report, 'activity_report': activity_report,
                'calls_report': calls_report, 'engagement_report': engagement_report,
                'tours_report': tours_report,
                'chart_values': chart_values, 'portfolio': overall_portfolio_values
            }
        if params.get('compare_value'):
            result['compare_values'] = compare('overview_reports', properties, result, params.get('compare_value'),
                                               params.get('type'), date_range, date_period,
                                               is_performance=is_performance)
        return Response(dict(results=result, start_date=date_range[0], end_date=date_range[1]), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def marketing_reports(self, request, **kwargs):
        params = request.query_params

        result = {}
        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))

        show_paid_only = params.get('show_paid_only') == 'true'
        properties = []

        is_performance = params.get('attribution') == 'PERFORMANCE'
        if params.get('type') == 'property':
            properties = Property.objects.filter(pk=params.get('id'))
            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()
            result['lead_source_report'] = get_lead_source_data(
                reports,
                params.get('lead_source_limit'),
                params.get('lead_source_page'),
                is_performance,
                show_paid_only
            )
            result['lead_lost_report'] = get_lead_lost_data(reports, properties, is_performance)
        elif params.get('type') == 'portfolio':
            properties = Portfolio.objects.get(pk=params.get('id')).properties.all()
            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()
            aggregated_source_report = get_lead_source_data(
                reports,
                params.get('lead_source_limit'),
                params.get('lead_source_page'),
                is_performance,
                show_paid_only,
                True,
            )
            overall_portfolio_values = {
                'lead_lost_report': get_lead_lost_data(reports, properties, is_performance)}
            result = {'lead_source_report': {}, 'aggregated': aggregated_source_report,
                      'lead_lost_report': [], 'portfolio': overall_portfolio_values}

        if params.get('compare_value'):
            result['compare_values'] = compare('marketing_reports', properties, result, params.get('compare_value'),
                                               params.get('type'), date_range, params.get('date_period'),
                                               is_performance=is_performance)

        return Response(dict(results=result, start_date=date_range[0], end_date=date_range[1]), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def operations_reports(self, request, **kwargs):
        params = request.query_params

        result = {}
        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))

        properties = []
        unit_type = None
        if params.get('type') == 'property':
            properties = Property.objects.filter(pk=params.get('id'))
            if params.get('unit_type'):
                unit_type = FloorPlan.objects.get(id=params.get('unit_type'))
            result['occupancy_ltn_report'] = get_occupancy_ltn_data(date_range, properties, unit_type)
            result['marketing_comp_report'] = get_marketing_comp_data(date_range, properties)
            result['chart_values'] = get_chart_values('operations_reports', params.get('date_period'), properties,
                                                      date_range, unit_type)
            result['floor_plans'] = FloorPlan.objects.filter(property=params.get('id')).values()

        elif params.get('type') == 'portfolio':
            properties = Portfolio.objects.get(pk=params.get('id')).properties.all()
            occupancy_ltn_report = {}
            marketing_comp_report = get_marketing_comp_data(date_range, properties)
            for property in properties:
                occupancy_ltn_report[property.id] = get_occupancy_ltn_data(date_range, [property])
            overall_portfolio_values = {'occupancy_ltn_report': get_occupancy_ltn_data(date_range, properties),
                                        'marketing_comp_report': marketing_comp_report}
            chart_values = get_chart_values('operations_reports', params.get('date_period'), properties, date_range)
            result = {'occupancy_ltn_report': occupancy_ltn_report, 'marketing_comp_report': marketing_comp_report,
                      'portfolio': overall_portfolio_values, 'chart_values': chart_values}

        if params.get('compare_value'):
            result['compare_values'] = compare('operations_reports', properties, result, params.get('compare_value'),
                                               params.get('type'), date_range, params.get('date_period'), unit_type)

        return Response(dict(results=result, start_date=date_range[0], end_date=date_range[1]), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def lead_source_drilldown(self, request, **kwargs):
        params = request.query_params

        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))

        show_paid_only = params.get('show_paid_only') == 'true'
        is_performance = params.get('attribution') == 'PERFORMANCE'

        properties = Portfolio.objects.get(pk=params.get('id')).properties.all()
        reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=date_range[1].astimezone(tz=TZ).date()).values()
        lead_source_report = get_lead_source_data(
            reports,
            params.get('drilldown_lead_source_limit'),
            params.get('drilldown_lead_source_page'),
            is_performance,
            show_paid_only,
        )
        return Response(dict(results=lead_source_report), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def lead_lost_drilldown(self, request, **kwargs):
        params = request.query_params

        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))
        is_performance = params.get('attribution') == 'PERFORMANCE'

        properties = Portfolio.objects.get(pk=params.get('id')).properties.all()
        reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=date_range[1].astimezone(tz=TZ).date()).values()

        lead_lost_report = get_lead_lost_data(reports, properties, is_performance, is_drilldown=True)
        return Response(dict(results=lead_lost_report), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def sources_calls(self, request, **kwargs):
        params = request.query_params
        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))
        properties = []
        if params.get('type') == 'property':
            properties = Property.objects.filter(pk=params.get('id'))
        elif params.get('type') == 'portfolio':
            properties = Portfolio.objects.get(pk=params.get('id')).properties.filter(is_released=True)

        reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=date_range[1].astimezone(tz=TZ).date()).values()
        sources_calls = get_calls_by_source_data(reports)
        return Response(dict(results=sources_calls), status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ReportAccessAuthorized])
    def sites_reports(self, request, **kwargs):
        params = request.query_params
        date_period = request.query_params.get('date_period')

        result = {}
        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))

        properties = []
        is_performance = params.get('attribution') == 'PERFORMANCE'
        if params.get('type') == 'property':
            properties = Property.objects.filter(pk=params.get('id'))
            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()
            # result['lead_to_lease_report'] = calculate_overall_data('lead_to_lease_report', reports, is_performance)

            result['site_visitor_data'] = get_site_reports_data(reports, 'site_visitor_data')
            result['conversion_data'] = get_site_reports_data(reports, 'conversion_data')
            result['source_behavior_data'] = get_site_reports_data(reports, 'source_behavior_data')
            result['demographics_report'] = get_site_reports_data(reports, 'demographics_data')
            result['devices_data'] = get_site_reports_data(reports, 'devices_data')
            result['seo_score_data'] = get_site_reports_data(reports, 'seo_score_data')
            result['acquisition_channels_data'] = get_site_reports_data(reports, 'acquisition_channels_data')

            result['chart_values'] = get_chart_values('site_reports', params.get('date_period'), properties,
                                                      date_range, is_performance=is_performance)

            
        elif params.get('type') == 'portfolio':
            properties = Portfolio.objects.get(pk=params.get('id')).properties.filter(is_released=True)

            reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                            date__lte=date_range[1].astimezone(tz=TZ).date()).values()

            chart_values = get_chart_values('overview_reports', params.get('date_period'), properties, date_range,
                                            is_performance=is_performance)

            overall_portfolio_values = {
                'lead_to_lease_report': calculate_overall_data('lead_to_lease_report', reports, is_performance),
                'activity_report': calculate_overall_data('activity_report', reports, is_performance),
                'calls_report': calculate_overall_data('calls_report', reports, should_list_scored_calls=True),
                'engagement_report': calculate_overall_data('engagement_report', reports),
                'tours_report': calculate_overall_data('tours_report', reports, is_performance),
            }
            result = {
                'lead_to_lease_report': lead_to_lease_report, 'activity_report': activity_report,
                'calls_report': calls_report, 'engagement_report': engagement_report,
                'tours_report': tours_report,
                'chart_values': chart_values, 'portfolio': overall_portfolio_values
            }
        if params.get('compare_value'):
            result['compare_values'] = compare('site_reports', properties, result, params.get('compare_value'),
                                               params.get('type'), date_range, date_period,
                                               is_performance=is_performance)
        return Response(dict(results=result, start_date=date_range[0], end_date=date_range[1]), status=200)
