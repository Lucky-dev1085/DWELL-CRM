import datetime
import itertools

import pytz
from dateutil import relativedelta

from backend.api.models import Report, Unit
from backend.api.views.reports.report_utils import simple_divider, get_marketing_comp_averages, calculate_occupied_units

TZ = pytz.timezone('America/Phoenix')


def get_report_chart_values(report_type, start_date, end_date, properties, overall_result, unit_type=None,
                            date_range=None, is_performance=True):
    """
    Report chart values
    :param report_type:
    :param start_date:
    :param end_date:
    :param properties:
    :param overall_result:
    :return:
    """
    result = overall_result
    if report_type == 'overview_reports':
        reports = Report.objects.filter(property__in=properties, date__gte=start_date.astimezone(tz=TZ).date(),
                                        date__lt=end_date.astimezone(tz=TZ).date()).values()
        reports_overall_period = Report.objects.filter(property__in=properties,
                                                       date__gte=date_range[0].astimezone(tz=TZ).date(),
                                                       date__lte=date_range[1].astimezone(tz=TZ).date()).values()
        if not reports:
            for key in result:
                result[key].append(dict(value=0 if key != 'average_call_score' else None, label=start_date.date()))
        else:
            leads = list(itertools.chain(*list(reports.values_list('leads', flat=True))))
            leases = list(itertools.chain(*list(reports.values_list('leases', flat=True))))
            tours = list(itertools.chain(*list(reports.values_list('tours', flat=True))))

            leads_overall_period = list(itertools.chain(*list(reports_overall_period.values_list('leads', flat=True))))
            if is_performance:
                leads_value = len(leads)
                tours_value = len(list(set(leads_overall_period) & set(tours)))
                leases_value = len(list(set(leads_overall_period) & set(leases)))
            else:
                leads_value = len(leads)
                tours_value = len(tours)
                leases_value = len(leases)
            result['leads'].append(dict(value=leads_value, label=start_date.date()))
            result['tours'].append(dict(value=tours_value, label=start_date.date()))
            result['leases'].append(dict(value=leases_value, label=start_date.date()))

            result['prospect_calls'].append(dict(value=sum(report['prospect_calls'] for report in reports),
                                                 label=start_date.date()))
            call_time = sum(report['call_time'] for report in reports)
            calls = sum(report['calls'] for report in reports)
            result['average_call_time'].append(dict(value=round(simple_divider(call_time, calls) / 60, 1),
                                                    label=start_date.date()))

            call_score_sum = sum(
                [sum([item['score'] for item in report['call_score']]) for report in
                 reports if report['call_score']])
            call_score_len = sum([len(report['call_score']) for report in reports if report['call_score']])
            result['average_call_score'].append(dict(value=round(call_score_sum / call_score_len, 1)
            if call_score_len else None, label=start_date.date()))

            # Engagement
            lead_response_time_sum = sum(
                sum([simple_divider(item['minutes'], 60) if item['minutes'] else item['minutes']
                     for item in report['lead_response_time_business']]) for report in reports)
            lead_response_time_len = sum([len(report['lead_response_time_business']) for report in reports])
            result['average_response_time_business'].append(
                dict(value=simple_divider(lead_response_time_sum, lead_response_time_len),
                     label=start_date.date()))

            lead_response_time_sum = sum(
                sum([simple_divider(item['minutes'], 60) if item['minutes'] else item['minutes']
                     for item in report['lead_response_time_non_business']]) for report in reports)
            lead_response_time_len = sum([len(report['lead_response_time_non_business']) for report in reports])
            result['average_response_time_non_business'].append(
                dict(value=simple_divider(lead_response_time_sum, lead_response_time_len),
                     label=start_date.date()))

            sign_lease_time_sum = sum(sum([item['days'] for item in report['sign_lease_time']]) for report in reports)
            sign_lease_time_len = sum([len(report['sign_lease_time']) for report in reports])
            result['average_sign_lease_time'].append(
                dict(value=simple_divider(sign_lease_time_sum, sign_lease_time_len),
                     label=start_date.date()))

            followups_number_sum = sum(
                sum([item['followups'] for item in report['followups_number']]) for report in reports)
            followups_number_len = sum([len(report['followups_number']) for report in reports])
            result['average_followups_number'].append(
                dict(value=simple_divider(followups_number_sum, followups_number_len),
                     label=start_date.date()))
    if report_type == 'operations_reports':
        analytics_data = Report.objects.filter(property__in=properties, date__gte=start_date.astimezone(tz=TZ).date(),
                                               date__lt=end_date.astimezone(tz=TZ).date()).values()
        # if not analytics_data:
        #     for key in ['occupied_units', 'occupancy', 'ltn']:
        #         result[key].append(dict(value=0, label=start_date.date()))
        # else:
        filtered_units = Unit.objects.filter(property__in=properties, floor_plan=unit_type.id) if unit_type else \
            Unit.objects.filter(property__in=properties)

        expected_move_ins = sum([analytics['expected_move_ins'] for analytics in analytics_data])
        notice_to_vacates = sum([analytics['notice_to_vacates'] for analytics in analytics_data])
        total_units = filtered_units.count()
        occupied_units = calculate_occupied_units((start_date, end_date - datetime.timedelta(days=1)), filtered_units)

        result['occupied_units'].append(dict(value=occupied_units, label=start_date.date()))
        result['occupancy'].append(dict(value=simple_divider(occupied_units * 100, total_units),
                                        label=start_date.date()))
        result['ltn'].append(dict(value=simple_divider(occupied_units + expected_move_ins - notice_to_vacates,
                                                       total_units), label=start_date.date()))

        market_rent_avg, effective_rent_avg = get_marketing_comp_averages(
            (start_date, end_date - datetime.timedelta(days=1)), properties)

        unit_classes = ['STUDIO', 'ONE_BED', 'TWO_BED', 'THREE_BED', 'FOUR_BED', 'ONE_BED_PENTHOUSE',
                        'TWO_BED_PENTHOUSE', 'THREE_BED_PENTHOUSE']

        for unit_class in unit_classes:
            market_rent_item = next((i for i in market_rent_avg if i['unit_class'] == unit_class), None)
            result[unit_class]['market_rent_avg'].append(dict(value=market_rent_item['market_rent_avg']
            if market_rent_item else 0, label=start_date.date()))

            effective_rent_item = next((i for i in effective_rent_avg if i['unit_class'] == unit_class), None)
            result[unit_class]['effective_rent_avg'].append(dict(value=effective_rent_item['effective_rent_avg']
            if effective_rent_item else 0, label=start_date.date()))

    if report_type == 'site_reports':
        reports = Report.objects.filter(property__in=properties, date__gte=start_date.astimezone(tz=TZ).date(),
                                        date__lt=end_date.astimezone(tz=TZ).date()).values()
        reports_overall_period = Report.objects.filter(property__in=properties,
                                                       date__gte=date_range[0].astimezone(tz=TZ).date(),
                                                       date__lte=date_range[1].astimezone(tz=TZ).date()).values()

        if not reports:
            result['prior_period_visitors']['all'].append(dict(value=0, label=start_date.date()))
            result['prior_period_visitors']['desktop'].append(dict(value=0, label=start_date.date()))
            result['prior_period_visitors']['tablet'].append(dict(value=0, label=start_date.date()))
            result['prior_period_visitors']['mobile'].append(dict(value=0, label=start_date.date()))

            result['prior_period_leads']['all'].append(dict(value=0, label=start_date.date()))
            result['prior_period_leads']['desktop'].append(dict(value=0, label=start_date.date()))
            result['prior_period_leads']['tablet'].append(dict(value=0, label=start_date.date()))
            result['prior_period_leads']['mobile'].append(dict(value=0, label=start_date.date()))
        else:
            result['prior_period_visitors']['all'].append(
                dict(value=sum(sum(item['prior_period_visitors'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['visitors']['all'].append(
                dict(value=sum(sum(item['visitors'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['pageviews']['all'].append(
                dict(value=sum(sum(item['pageviews'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['new_visitors']['all'].append(
                dict(value=sum(sum(item['new_visitors'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['pages_session']['all'].append(
                dict(value=sum(sum(item['pages_session'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['sessions_per_visitor']['all'].append(
                dict(value=sum(sum(item['sessions_per_visitor'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['avg_session_duration']['all'].append(
                dict(value=sum(sum(item['avg_session_duration'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['sessions']['all'].append(
                dict(value=sum(sum(item['sessions'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))
            result['bounce_rate']['all'].append(
                dict(value=sum(sum(item['bounce_rate'] for item in report['site_visitor_data']) for report in reports if report['site_visitor_data']), label=start_date.date()))   
            
            result['prior_period_leads']['all'].append(
                dict(value=sum(sum(item['prior_period_leads'] for item in report['conversion_data']) for report in reports if report['conversion_data']), label=start_date.date()))  
            result['leads']['all'].append(
                dict(value=sum(sum(item['leads'] for item in report['conversion_data']) for report in reports if report['conversion_data']), label=start_date.date()))  
            result['conversion_rate']['all'].append(
                dict(value=sum(sum(item['conversion_rate'] for item in report['conversion_data']) for report in reports if report['conversion_data']), label=start_date.date()))  
            result['tours']['all'].append(
                dict(value=sum(sum(item['tours'] for item in report['conversion_data']) for report in reports if report['conversion_data']), label=start_date.date()))  
            result['leases']['all'].append(
                dict(value=sum(sum(item['leases'] for item in report['conversion_data']) for report in reports if report['conversion_data']), label=start_date.date())) 

            for report in reports:
                if report['site_visitor_data']:
                    for site_visitor_data in report['site_visitor_data']:
                        result['prior_period_visitors'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['prior_period_visitors'], label=start_date.date()))
                        result['visitors'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['visitors'], label=start_date.date()))
                        result['pageviews'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['pageviews'], label=start_date.date()))
                        result['new_visitors'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['new_visitors'], label=start_date.date()))
                        result['pages_session'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['pages_session'], label=start_date.date()))
                        result['sessions_per_visitor'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['sessions_per_visitor'], label=start_date.date()))
                        result['avg_session_duration'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['avg_session_duration'], label=start_date.date()))
                        result['sessions'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['sessions'], label=start_date.date()))
                        result['bounce_rate'][site_visitor_data['device_category']].append(dict(value=site_visitor_data['bounce_rate'], label=start_date.date()))
                else:
                    result['prior_period_visitors']['desktop'].append(dict(value=0, label=start_date.date()))
                    result['prior_period_visitors']['tablet'].append(dict(value=0, label=start_date.date()))
                    result['prior_period_visitors']['mobile'].append(dict(value=0, label=start_date.date()))
                
                if report['conversion_data']:
                    for item in report['conversion_data']:
                        result['prior_period_leads'][item['device_category']].append(dict(value=item['prior_period_leads'], label=start_date.date()))
                        result['leads'][item['device_category']].append(dict(value=item['leads'], label=start_date.date()))
                        result['conversion_rate'][item['device_category']].append(dict(value=item['conversion_rate'], label=start_date.date()))
                        result['tours'][item['device_category']].append(dict(value=item['tours'], label=start_date.date()))
                        result['leases'][item['device_category']].append(dict(value=item['leases'], label=start_date.date()))
                else:
                    result['prior_period_leads']['desktop'].append(dict(value=0, label=start_date.date()))
                    result['prior_period_leads']['tablet'].append(dict(value=0, label=start_date.date()))
                    result['prior_period_leads']['mobile'].append(dict(value=0, label=start_date.date()))
            



    return result


def get_chart_values_for_days(td, start, properties, report_type, result, unit_type=None, date_range=None,
                              is_performance=True):
    """
    Report chart values for day units
    :param td: start and end date difference
    :param start: start sate
    :param properties:
    :param report_type:
    :param result:
    :return:
    """
    for day in range(0, td.days + 1):
        end_date = start + datetime.timedelta(days=day + 1)
        start_date = start + datetime.timedelta(days=day)
        result = get_report_chart_values(report_type, start_date, end_date, properties, result, unit_type,
                                         date_range, is_performance)
    return result


def get_chart_values_for_months(td, start, properties, report_type, result, unit_type=None,
                                date_range=None, is_performance=True):
    """
    Report chart values for month units
    :param td: start and end date difference
    :param start: start sate
    :param properties:
    :param report_type:
    :param result:
    :return:
    """
    for month in range(0, td.months + 1):
        default_end_date = start + relativedelta.relativedelta(months=month + 1)
        end_date = datetime.datetime.now(pytz.timezone('America/Phoenix')) \
            if default_end_date > datetime.datetime.now(pytz.timezone('America/Phoenix')) \
            else default_end_date
        start_date = start + relativedelta.relativedelta(months=month)
        result = get_report_chart_values(report_type, start_date, end_date, properties, result, unit_type,
                                         date_range, is_performance)
    return result


def get_chart_values_for_weeks(td, start, properties, report_type, result, unit_type=None, date_range=None,
                               is_performance=True):
    """
    Report chart values for week units
    :param td: start and end date difference
    :param start: start sate
    :param properties:
    :param report_type:
    :param result:
    :return:
    """
    for week in range(0, td.days // 7 + 1):
        default_end_date = start + datetime.timedelta(days=(week + 1) * 7)
        if default_end_date > datetime.datetime.now(pytz.timezone('America/Phoenix')):
            end_date = datetime.datetime.now(pytz.timezone('America/Phoenix'))
        else:
            end_date = default_end_date
        start_date = start + datetime.timedelta(days=week * 7)
        result = get_report_chart_values(report_type, start_date, end_date, properties, result, unit_type,
                                         date_range, is_performance)
    return result


def get_chart_values_for_years(td, start, properties, report_type, result, unit_type=None, date_range=None,
                               is_performance=True):
    """
    Report chart values for year units
    :param td: start and end date difference
    :param start: start sate
    :param properties:
    :param report_type:
    :param result:
    :return:
    """
    for year in range(0, td.years + 1):
        default_end_date = start + relativedelta.relativedelta(years=year + 1)
        end_date = datetime.datetime.now(pytz.timezone('America/Phoenix')) if \
            default_end_date > datetime.datetime.now(pytz.timezone('America/Phoenix')) \
            else default_end_date
        start_date = start + relativedelta.relativedelta(years=year)
        result = get_report_chart_values(report_type, start_date, end_date, properties, result, unit_type,
                                         date_range, is_performance)
    return result


def get_chart_values(report_type, date_period, properties, date_range=None, unit_type=None, is_performance=True):
    """
    Calculate chart values for selected report type based on selected date period
    :param report_type:
    :param date_period:
    :param properties:
    :param date_range:
    :return:
    """
    start = date_range[0] if date_range else None
    end = date_range[1] if date_range else None
    MONTH = 31
    THREE_MONTH = 93
    YEAR = 365

    result = {}
    if report_type == 'overview_reports':
        result = dict(leads=[], tours=[], leases=[], average_call_time=[], prospect_calls=[],
                      average_response_time_business=[], average_response_time_non_business=[],
                      average_sign_lease_time=[], average_followups_number=[], average_call_score=[])

    if report_type == 'operations_reports':
        result = dict(occupied_units=[], occupancy=[], ltn=[], STUDIO=dict(market_rent_avg=[], effective_rent_avg=[]),
                      ONE_BED=dict(market_rent_avg=[], effective_rent_avg=[]),
                      TWO_BED=dict(market_rent_avg=[], effective_rent_avg=[]),
                      THREE_BED=dict(market_rent_avg=[], effective_rent_avg=[]),
                      FOUR_BED=dict(market_rent_avg=[], effective_rent_avg=[]),
                      ONE_BED_PENTHOUSE=dict(market_rent_avg=[], effective_rent_avg=[]),
                      TWO_BED_PENTHOUSE=dict(market_rent_avg=[], effective_rent_avg=[]),
                      THREE_BED_PENTHOUSE=dict(market_rent_avg=[], effective_rent_avg=[]))
    
    if report_type == 'site_reports':
        result = dict(prior_period_visitors=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        visitors=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        pageviews=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        new_visitors=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        pages_session=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        sessions_per_visitor=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        avg_session_duration=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        sessions=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        bounce_rate=dict(all=[], desktop=[], tablet=[], mobile=[]),
                    prior_period_leads=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        leads=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        conversion_rate=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        tours=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        leases=dict(all=[], desktop=[], tablet=[], mobile=[]),
                    male=dict(all=[], desktop=[], tablet=[], mobile=[]), 
                        female=dict(all=[], desktop=[], tablet=[], mobile=[]),
                    prior_period_performance=[], performance=[], accesibility=[], best_practices=[], seo=[])
        
        reports = Report.objects.filter(property__in=properties,
                                        date__gte=date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=date_range[1].astimezone(tz=TZ).date()).values()
        
        result['male']['all'].append(
                dict(value=sum(sum(item['male_18_24'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='18-24'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_18_24'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='18-24'))
        result['male']['all'].append(
                dict(value=sum(sum(item['male_25_34'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='25-34'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_25_34'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='25-34'))
        result['male']['all'].append(
                dict(value=sum(sum(item['male_35_44'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='35-44'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_35_44'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='35-44'))
        result['male']['all'].append(
                dict(value=sum(sum(item['male_45_54'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='45-54'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_45_54'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='45-54'))
        result['male']['all'].append(
                dict(value=sum(sum(item['male_55_64'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='55-64'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_55_64'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='55-64'))
        result['male']['all'].append(
                dict(value=sum(sum(item['male_65'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='65+'))
        result['female']['all'].append(
                dict(value=sum(sum(item['female_65'] for item in report['demographics_data']) for report in reports if report['demographics_data']), label='65+'))
        
        for device in ['desktop', 'tablet', 'mobile']:
            result['male'][device].append(dict(
                value=sum(sum(item['male_18_24'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='18-24')) 
            result['male'][device].append(dict(
                value=sum(sum(item['male_25_34'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='25-34')) 
            result['male'][device].append(dict(
                value=sum(sum(item['male_35_44'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='35-44')) 
            result['male'][device].append(dict(
                value=sum(sum(item['male_45_54'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='45-54')) 
            result['male'][device].append(dict(
                value=sum(sum(item['male_55_64'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='55-64')) 
            result['male'][device].append(dict(
                value=sum(sum(item['male_65'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='65+')) 
            
            result['female'][device].append(dict(
                value=sum(sum(item['female_18_24'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='18-24')) 
            result['female'][device].append(dict(
                value=sum(sum(item['female_25_34'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='25-34')) 
            result['female'][device].append(dict(
                value=sum(sum(item['female_35_44'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='35-44')) 
            result['female'][device].append(dict(
                value=sum(sum(item['female_45_54'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='45-54')) 
            result['female'][device].append(dict(
                value=sum(sum(item['female_55_64'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='55-64')) 
            result['female'][device].append(dict(
                value=sum(sum(item['female_65'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data']), label='65+')) 
        
        

    if date_period in ['THIS_WEEK', 'LAST_WEEK', 'THIS_MONTH', 'LAST_MONTH', 'TODAY']:
        td = end - start
        return get_chart_values_for_days(td, start, properties, report_type, result, unit_type, date_range,
                                         is_performance)

    if date_period in ['LAST_YEAR']:
        td = relativedelta.relativedelta(end, start)
        return get_chart_values_for_months(td, start, properties, report_type, result, unit_type,
                                           date_range, is_performance)

    if date_period in ['THIS_QUARTER', 'LAST_QUARTER']:
        td = end - start
        return get_chart_values_for_weeks(td, start, properties, report_type, result, unit_type, date_range,
                                          is_performance)

    if date_period in ['THIS_YEAR', 'CUSTOM_RANGE', 'ALL_TIME']:
        td = end - start
        if td.days <= MONTH:
            result = get_chart_values_for_days(td, start, properties, report_type, result, unit_type, date_range,
                                               is_performance)
        if td.days in range(MONTH + 1, THREE_MONTH):
            result = get_chart_values_for_weeks(td, start, properties, report_type, result, unit_type, date_range,
                                                is_performance)
        if td.days in range(THREE_MONTH, YEAR):
            result = get_chart_values_for_months(relativedelta.relativedelta(end, start), start, properties,
                                                 report_type, result, unit_type, date_range, is_performance)
        if td.days >= YEAR:
            result = get_chart_values_for_years(relativedelta.relativedelta(end, start), start, properties,
                                                report_type, result, unit_type, date_range, is_performance)
        return result
