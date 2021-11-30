import pytz

from backend.api.models import Property, Report
from backend.api.views.reports import get_previous_date_range
from .report_utils import get_lead_source_data, calculate_overall_data, get_lead_lost_data, get_occupancy_ltn_data, \
    get_marketing_comp_data, get_marketing_comp_averages

TZ = pytz.timezone('America/Phoenix')


def get_company_wide_averages(date_range, report_type, unit_type=None, is_performance=True):
    """
    Calculate averages for all properties based on report type
    :param date_range:
    :param report_type:
    :return:
    """
    result = {}
    properties = Property.objects.filter(is_released=True)
    properties_count = properties.count()
    reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                    date__lte=date_range[1].astimezone(tz=TZ).date()).values()

    if report_type == 'overview_reports':
        # activities
        activity_report_data = calculate_overall_data('activity_report', reports, is_performance)
        for k in activity_report_data:
            activity_report_data[k] = round(activity_report_data[k] / properties_count, 2)
        result['activity_report'] = activity_report_data

        # lead to lease
        lead_to_lease_report_data = calculate_overall_data('lead_to_lease_report', reports, is_performance)
        for k in lead_to_lease_report_data:
            # make sure we don't need to calculate averages for percents
            if k not in ['leased_rate', 'lead_to_tour', 'tour_to_lease']:
                lead_to_lease_report_data[k] = round(lead_to_lease_report_data[k] / properties_count, 2)
        result['lead_to_lease_report'] = lead_to_lease_report_data

        # calls
        calls_report_data = calculate_overall_data('calls_report', reports)
        calls_report_data['prospect_calls'] = round(calls_report_data['prospect_calls'] / properties_count, 2)
        result['calls_report'] = calls_report_data

        # engagement
        result['engagement_report'] = calculate_overall_data('engagement_report', reports)

        # tours
        tours_report_data = calculate_overall_data('tours_report', reports, is_performance)
        for k in tours_report_data:
            if k not in ['tours_data', 'leases_data']:
                tours_report_data[k] = round(tours_report_data[k] / properties_count, 2)
        result['tours_report'] = tours_report_data

    if report_type == 'marketing_reports':
        # lead source
        lead_source_report_data = get_lead_source_data(reports, is_performance=is_performance,
                                                       aggregate_mode=True)
        result['lead_source_report'] = []
        result['aggregated'] = []
        for item in lead_source_report_data:
            compare_data_item = next((i for i in lead_source_report_data if i['source'] == item['source']), None)
            for k in item:
                if k in ['leads', 'tours', 'leases', 'calls']:
                    compare_data_item[k] = round(compare_data_item[k] / properties_count, 2)
            result['lead_source_report'].append(compare_data_item)
            result['aggregated'].append(compare_data_item)

        # lead lost
        lead_lost_report_data = get_lead_lost_data(reports, properties, is_performance=is_performance)
        lead_lost_report_data['lost_leads'] = round(lead_lost_report_data['lost_leads'] / properties_count, 2)
        result['lead_lost_report'] = lead_lost_report_data

    if report_type == 'operations_reports':
        # occupancy & ltn
        occupancy_ltn_report_data = get_occupancy_ltn_data(date_range, properties, unit_type)
        for k in occupancy_ltn_report_data:
            if k not in ['ltn', 'occupancy']:
                occupancy_ltn_report_data[k] = round(occupancy_ltn_report_data[k] / properties_count, 2)
        result['occupancy_ltn_report'] = occupancy_ltn_report_data

        # marketing comp
        market_rent_avg, effective_rent_avg = get_marketing_comp_averages(date_range, properties)
        result['marketing_comp_report'] = dict(market_rent_avg=market_rent_avg, effective_rent_avg=effective_rent_avg)
    return result


def calculate_difference(current_value, compare_value):
    if compare_value == current_value:
        result = 0
    elif compare_value == 0:
        result = 'n/a'
    else:
        result = (round((current_value - compare_value) / compare_value * 100, 2),
                  round(current_value - compare_value, 2))
    return result


def get_compare_values(report_type, current_report_data, compare_report_data):
    """
    Calculate compare values based on current report data and data for comparison
    :param report_type:
    :param current_report_data:
    :param compare_report_data: data for comparison (previous period or company averages)
    :return:
    """
    compare_result = {}

    if report_type in ['activity_report', 'lead_to_lease_report', 'engagement_report', 'calls_report',
                       'occupancy_ltn_report', 'tours_report']:
        for k in current_report_data:
            if k in ['property', 'sources_calls', 'tours_data', 'leases_data', 'call_answered', 'call_missed',
                     'call_busy', 'call_failed', 'agents', 'scored_calls', 'scoring_questions']:
                continue
            if k == 'customer_average_call_score':
                compare_result[k] = round(current_report_data[k] - compare_report_data[
                    k if k in compare_report_data else 'average_call_score'], 2)
            elif k in ['leased_rate', 'lead_to_tour', 'tour_to_lease', 'ltn', 'occupancy', 'average_call_score',
                       'amenities', 'closing', 'introduction', 'overall', 'qualifying']:
                compare_result[k] = round(current_report_data[k] - compare_report_data[k], 2) \
                    if current_report_data[k] is not None and compare_report_data[k] is not None else None
            elif k in ['followups_2_hours', 'followups_24_hours', 'followups_48_hours', 'followups_more_48_hours']:
                compare_result[k] = [round(current_report_data[k][0] - compare_report_data[k][0], 2),
                                     round(current_report_data[k][1] - compare_report_data[k][1], 2)]
            else:
                compare_result[k] = calculate_difference(current_report_data[k], compare_report_data[k])

    if report_type == 'lead_lost_report':
        compare_result['lost_leads'] = calculate_difference(current_report_data['lost_leads'],
                                                            compare_report_data['lost_leads'])

    if report_type == 'lead_source_report':
        for item in current_report_data.get('results'):
            compare_result[item['id']] = {}
            compare_item = next((i for i in compare_report_data if i['id'] == item['id']
                                 or i['source'] == item['source']), None)
            current_report_item = next((i for i in current_report_data.get('results') if i['id'] == item['id']),
                                       None)
            if not compare_item:
                continue
            for k in item:
                if k in ['leads', 'tours', 'leases', 'calls']:
                    compare_result[item['id']][k] = calculate_difference(current_report_item[k], compare_item[k])

    if report_type == 'marketing_comp_report':
        compare_result = dict(STUDIO={}, ONE_BED={}, TWO_BED={}, THREE_BED={}, FOUR_BED={}, ONE_BED_PENTHOUSE={},
                              TWO_BED_PENTHOUSE={}, THREE_BED_PENTHOUSE={})
        for rent in current_report_data['market_rent_avg']:
            compare_item = next((i for i in compare_report_data['market_rent_avg']
                                 if i['unit_class'] == rent['unit_class']), None)
            compare_result[rent['unit_class']]['market_rent_avg'] = calculate_difference(
                rent['market_rent_avg'], compare_item['market_rent_avg'])

        for rent in current_report_data['effective_rent_avg']:
            compare_item = next((i for i in compare_report_data['effective_rent_avg']
                                 if i['unit_class'] == rent['unit_class']), None)
            compare_result[rent['unit_class']]['effective_rent_avg'] = calculate_difference(
                rent['effective_rent_avg'], compare_item['effective_rent_avg'])
    return compare_result


def calculate_comparison(report_type, result, compare_to_result, level):
    """
    Wrapper for method calculating compare values
    :param level:
    :param report_type:
    :param result: current report data
    :param compare_to_result: data for comparison
    :return:
    """
    compare_values = {}
    if report_type == 'overview_reports':
        compare_values = {'lead_to_lease_report': get_compare_values('lead_to_lease_report',
                                                                     result['lead_to_lease_report'],
                                                                     compare_to_result['lead_to_lease_report']),
                          'activity_report': get_compare_values('activity_report',
                                                                result['activity_report'],
                                                                compare_to_result['activity_report']),
                          'calls_report': get_compare_values('calls_report', result['calls_report'],
                                                             compare_to_result['calls_report']),
                          'engagement_report': get_compare_values('engagement_report', result['engagement_report'],
                                                                  compare_to_result['engagement_report']),
                          'tours_report': get_compare_values('tours_report', result['tours_report'],
                                                             compare_to_result['tours_report'])}
    if report_type == 'marketing_reports':
        compare_values = {'lead_lost_report': get_compare_values(
            'lead_lost_report', result['portfolio']['lead_lost_report']
            if level == 'portfolio' else result['lead_lost_report'],
            compare_to_result['lead_lost_report']),
        }
        if level == 'portfolio' and result.get('aggregated'):
            compare_values['aggregated'] = get_compare_values('lead_source_report', result['aggregated'],
                                                              compare_to_result['aggregated'])
        else:
            compare_values['lead_source_report'] = get_compare_values('lead_source_report',
                                                                      result['lead_source_report'],
                                                                      compare_to_result['lead_source_report'])
    if report_type == 'operations_reports':
        compare_values = {'occupancy_ltn_report': get_compare_values('occupancy_ltn_report',
                                                                     result['occupancy_ltn_report'],
                                                                     compare_to_result['occupancy_ltn_report']),
                          'marketing_comp_report': get_compare_values('marketing_comp_report',
                                                                      result['marketing_comp_report'],
                                                                      compare_to_result['marketing_comp_report'])}
    return compare_values


def compare(report_type, properties, result, compare_value, level, date_range, date_period, unit_type=None,
            is_performance=True):
    """
    Get compare values based on selected compare filter option
    :param report_type:
    :param properties:
    :param result:
    :param compare_value: selected compare filter option
    :param level: property or portfolio level
    :param date_range: selected date range
    :param date_period: selected date period
    :return:
    """
    compare_result = {}
    current_result = result if level == 'property' or report_type == 'marketing_reports' else result['portfolio']

    if compare_value == 'COMPANY_WIDE_AVERAGES':
        compare_to_result = get_company_wide_averages(date_range, report_type, unit_type, is_performance)
        compare_result = calculate_comparison(report_type, current_result, compare_to_result, level)

    if compare_value == 'PREVIOUS_PERIOD':
        previous_date_range = get_previous_date_range(date_range, date_period)
        reports = Report.objects.filter(property__in=properties,
                                        date__gte=previous_date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=previous_date_range[1].astimezone(tz=TZ).date()).values()
        compare_to_result = {}
        if report_type == 'overview_reports':
            compare_to_result = {
                'lead_to_lease_report': calculate_overall_data('lead_to_lease_report', reports, is_performance),
                'activity_report': calculate_overall_data('activity_report', reports, is_performance),
                'calls_report': calculate_overall_data('calls_report', reports),
                'engagement_report': calculate_overall_data('engagement_report', reports),
                'tours_report': calculate_overall_data('tours_report', reports, is_performance),
            }
        if report_type == 'marketing_reports':
            compare_to_result = {'lead_lost_report': get_lead_lost_data(reports, properties,
                                                                        is_performance=is_performance)}

            if level == 'portfolio':
                compare_to_result['aggregated'] = get_lead_source_data(reports,
                                                                       is_performance=is_performance,
                                                                       aggregate_mode=True)
            else:
                compare_to_result['lead_source_report'] = get_lead_source_data(reports, is_performance=is_performance)

        if report_type == 'operations_reports':
            compare_to_result = {
                'occupancy_ltn_report': get_occupancy_ltn_data(previous_date_range, properties, unit_type),
                'marketing_comp_report': get_marketing_comp_data(previous_date_range, properties),
            }
        
        if report_type == 'site_reports':
            compare_to_result = {
                'site_visitor_data': {},
                'conversion_data': {},
                'source_behavior_data': {},
                'demographics_data': {},
                'devices_data': {},
                'seo_score_data': {},
                'acquisition_channels_data': {}
            }

        compare_result = calculate_comparison(report_type, current_result, compare_to_result, level)

    return compare_result
