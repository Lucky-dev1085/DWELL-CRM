import itertools
import json
import pandas as pd
import pytz
from dateutil.relativedelta import relativedelta as rd, TH
from dateutil.parser import parse
from datetime import datetime, timedelta, date
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Q, F, Count, Avg, Min, Max, Sum, Subquery, OuterRef, When, Case, Value
from django.db.models.functions import Coalesce, Least, Concat

from backend.api.models import Lead, Activity, ProspectSource, EmailMessage, Report, Unit, Competitor, \
    ProspectLostReason, Call, ScoredCall, CallScoringQuestion, SourceMatching, BusinessHours, SMSContent, Note, Task, \
    ChatConversation, ChatProspect, Holiday, Property, User
from backend.api.utils import hyphens, format_private_static_url

TZ = pytz.timezone('America/Phoenix')


def get_calls_by_source_data(reports):
    sources = list(reports.values_list('sources', flat=True))
    sources = list(itertools.chain(*sources))
    if len(sources):
        df = pd.DataFrame(sources)
        df = df.groupby('name').agg({'calls': lambda s: len(sum(s, []))}).reset_index()

        df = df[df['calls'] > 0]
        if df.empty:
            return []

        df['source'] = df['name']
        del df['name']

        total = df['calls'].sum()
        df['percents'] = df.apply(lambda row: simple_divider(row['calls'] * 100, total), axis=1)
        sources = json.loads(df.to_json(orient='table')).get('data', [])
    return sources


def get_filter(date_range, properties=None):
    """
    Get filter conditions to model object (Lead, Activity) using properties possession and date range
    :param date_range: [start date, end date]
    :param properties: properties list
    :return:
    """
    filter = Q(property__isnull=False)
    if properties:
        filter = Q(property__in=properties)
    if date_range:
        filter.add(Q(created__lte=date_range[1], created__gte=date_range[0]), Q.AND)
    return filter


def simple_divider(a, b):
    if type(b) == pd.Series:
        is_divisor_empty = (b == 0).bool()
    else:
        is_divisor_empty = b == 0
    return round(a / b, 1) if not is_divisor_empty else 0


def get_agent_scores(reports):
    agent_scores = list(reports.filter(~Q(agents_call_score=[])).values_list('agents_call_score', 'property'))
    agents = {}
    for score in agent_scores:
        user = User.objects.filter(id=score[0][0]['agent']).first()
        if user:
            agents.setdefault(user.id, {'score': [], 'properties': []})['score'].append(score[0][0]['score'])
            agents.setdefault(user.id, {'score': [], 'properties': []})['properties'].append(score[1])
    agents = {k: {'score': round(sum(v.get('score')) / len(v.get('score')), 1),
                  'properties': v.get('properties')} for k, v in agents.items()}
    agents = [{'agent': User.objects.filter(id=k).first().name, 'score': v.get('score'),
               'properties': list(Property.objects.filter(id__in=v.get('properties'))
                                  .values_list('name', flat=True))} for k, v in agents.items()]
    return agents


def get_scored_calls(reports):
    scored_calls_data = list(itertools.chain(*list(reports.values_list('call_score', flat=True))))
    call_ids = [call['call'] for call in scored_calls_data]
    calls = Call.objects.filter(id__in=call_ids).annotate(
        lead_name=Concat(F('lead__first_name'), Value(' '), F('lead__last_name')))
    calls = [dict(id=call.id, source=call.source, date=call.date, prospect_phone_number=call.prospect_phone_number,
                  duration=call.duration, property=call.property.name, lead_name=call.lead_name,
                  recording=format_private_static_url(call.recording.url)) for call in calls]
    scored_calls = ScoredCall.objects.filter(call_id__in=call_ids).annotate(
        agent_name=Concat(F('agent__first_name'), Value(' '), F('agent__last_name')), call_score_id=F('id')) \
        .values('call', 'agent_name', 'questions', 'omitted_questions', 'prev_score', 'call_score_id')

    df1 = pd.DataFrame(scored_calls_data)
    if df1.empty:
        result = []
    else:
        df2 = pd.DataFrame(calls)
        df3 = pd.DataFrame(scored_calls)
        df = pd.merge(df1, df2, left_on='call', right_on='id')
        df = pd.merge(df, df3, on='call')
        df = df.groupby('id').agg({'score': 'first', 'source': 'first', 'recording': 'first', 'date': 'first',
                                   'prospect_phone_number': 'first', 'duration': 'first',
                                   'property': 'first',
                                   'questions': lambda x: list(set(x)),
                                   'omitted_questions': lambda x: list(set(x)),
                                   'lead_name': 'first',
                                   'agent_name': 'first',
                                   'prev_score': 'first',
                                   'call_score_id': 'first',
                                   })

        df['yes_questions'] = df['questions']
        del df['questions']

        result = json.loads(df.to_json(orient='table')).get('data', [])
    return result


def flatten(t):
    return [item for sublist in t for item in sublist if item]


def calculate_overall_data(report_type, reports, is_performance=True, is_drilldown=False,
                           should_list_scored_calls=False):
    result = {}
    if report_type == 'lead_to_lease_report':
        result = {'leads': 0, 'leases': 0, 'tours': 0, 'leased_rate': 0, 'lead_to_tour': 0, 'tour_to_lease': 0}
        df = pd.DataFrame(reports)
        if df.empty:
            return result if not is_drilldown else []
        if is_drilldown:
            df = df.groupby('property_id')
        df = df.agg({'leads': 'sum', 'leases': 'sum', 'tours': 'sum'})
        if df.empty:
            return result if not is_drilldown else []

        if is_performance:
            df['leases'] = df.apply(lambda row: list(set(row['leases']) & set(row['leads'])), axis=1) \
                if is_drilldown else list(set(df['leases']) & set(df['leads']))
            df['tours'] = df.apply(lambda row: list(set(row['tours']) & set(row['leads'])), axis=1) \
                if is_drilldown else list(set(df['tours']) & set(df['leads']))
            if df.empty:
                return result if not is_drilldown else []

        for field in ['leads', 'leases', 'tours']:
            df[field] = df[field].apply(lambda x: len(set(x))) if is_drilldown else len(set(df[field]))

        df['leased_rate'] = df.apply(lambda row: simple_divider(row.leases * 100, row.leads), axis=1) \
            if is_drilldown else simple_divider(df['leases'] * 100, df['leads'])
        df['lead_to_tour'] = df.apply(lambda row: simple_divider(row.tours * 100, row.leads), axis=1) \
            if is_drilldown else simple_divider(df['tours'] * 100, df['leads'])
        df['tour_to_lease'] = df.apply(lambda row: simple_divider(row.leases * 100, row.tours), axis=1) \
            if is_drilldown else simple_divider(df['leases'] * 100, df['tours'])

        if is_drilldown:
            result = json.loads(df.to_json(orient='table')).get('data', [])
            result = {item['property_id']: item for item in result}
        else:
            result = df.to_dict()

    if report_type == 'activity_report':
        df = pd.DataFrame(reports)
        if df.empty:
            return {'emails': 0, 'tasks': 0, 'notes': 0, 'calls': 0, 'agent_chats': 0, 'activities': 0} \
                if not is_drilldown else []
        if is_drilldown:
            df = df.groupby('property_id')
            df = df.agg({'emails': 'sum', 'tasks': 'sum', 'notes': 'sum', 'calls': 'sum', 'agent_chats': 'sum',
                         'leads': 'sum'})
        else:
            df1 = df.agg({'calls': 'sum', 'agent_chats': 'sum'})
            for field in ['emails', 'tasks', 'notes', 'leads']:
                df1[field] = flatten(filter(None, df[field].to_list()))
            df = df1

        if is_performance:  # takes at least one - one and a half seconds to calculate in current state
            for field in ['emails', 'tasks', 'notes']:
                if is_drilldown:
                    df[field] = df.apply(lambda row: [x['activity'] for x in row[field] if x['lead'] in row['leads']],
                                         axis=1)
                else:
                    df[field] = [x['activity'] for x in df[field] if x['lead'] in df['leads']]
        del df['leads']

        for field in ['emails', 'tasks', 'notes']:
            df[field] = df[field].apply(len) if is_drilldown else len(df[field])
        df['activities'] = df['emails'] + df['tasks'] + df['notes'] + df['calls'] + df['agent_chats']

        if is_drilldown:
            result = json.loads(df.to_json(orient='table')).get('data', [])
            result = {item['property_id']: item for item in result}
        else:
            result = df.to_dict()

    if report_type == 'calls_report':
        df = pd.DataFrame(reports)
        if df.empty:
            return {'prospect_calls': 0, 'average_call_time': 0,
                    'call_answered': dict(percents=0, calls=0), 'call_missed': dict(percents=0, calls=0),
                    'call_busy': dict(percents=0, calls=0), 'call_failed': dict(percents=0, calls=0),
                    'average_call_score': 0, 'introduction': 0, 'qualifying': 0, 'amenities': 0, 'closing': 0,
                    'overall': 0, 'agents': [], 'scored_calls': [], 'scoring_questions': []} \
                if not is_drilldown else []
        if is_drilldown:
            df = df.groupby('property_id') \
                .agg({'prospect_calls': 'sum', 'call_time': 'sum', 'call_answered': 'sum',
                      'call_missed': 'sum', 'call_busy': 'sum', 'call_failed': 'sum',
                      'call_score': 'sum', 'introduction_score': 'sum', 'qualifying_score': 'sum',
                      'amenities_score': 'sum', 'closing_score': 'sum', 'overall_score': 'sum'})

            df['average_call_time'] = df.apply(lambda row:
                                               round(simple_divider(row.call_time, row.prospect_calls) / 60, 1), axis=1)
            del df['call_time']
            df['average_call_score'] = df['call_score'].apply(lambda row: simple_divider(sum([x['score'] for x in row]),
                                                                                         len(row)))
            del df['call_score']
            for field in ['call_answered', 'call_missed', 'call_busy', 'call_failed']:
                df[field] = df.apply(lambda row: {'percents': simple_divider(row[field] * 100, row.prospect_calls),
                                                  'calls': row[field]}, axis=1)

            for field in ['introduction', 'qualifying', 'amenities', 'closing', 'overall']:
                df[field] = df['{}_score'.format(field)].apply(
                    lambda row: simple_divider(sum([x['score'] for x in row]),
                                               len(row)))
                del df['{}_score'.format(field)]
            result = json.loads(df.to_json(orient='table')).get('data', [])
            result = {item['property_id']: item for item in result}
        else:
            df = df.agg({'prospect_calls': 'sum', 'call_time': 'sum', 'call_answered': 'sum',
                         'call_missed': 'sum', 'call_busy': 'sum', 'call_failed': 'sum'})
            result = df.to_dict()
            result['average_call_time'] = round(simple_divider(result['call_time'], result['prospect_calls']) / 60, 1)
            del result['call_time']
            for field in ['call_answered', 'call_missed', 'call_busy', 'call_failed']:
                result[field] = dict(percents=simple_divider(result[field] * 100, result['prospect_calls']),
                                     calls=result[field])

            call_score_data = flatten(reports.values_list('call_score', flat=True))
            result['average_call_score'] = simple_divider(sum([x['score'] for x in call_score_data]),
                                                          len(call_score_data))
            for field in ['introduction', 'qualifying', 'amenities', 'closing', 'overall']:
                data = flatten(reports.values_list('{}_score'.format(field), flat=True))
                result[field] = simple_divider(sum([x['score'] for x in data]), len(data))

        if not is_drilldown:
            if should_list_scored_calls:
                result['scored_calls'] = get_scored_calls(reports)
            result['agents'] = get_agent_scores(reports)
            result['scoring_questions'] = CallScoringQuestion.objects.order_by('order').values('question', 'weight',
                                                                                               'id')

    if report_type == 'engagement_report':
        if is_drilldown:
            df = pd.DataFrame(reports)
            if df.empty:
                return {'average_response_time_business': 0, 'average_response_time_non_business': 0,
                        'average_sign_lease_time': 0, 'average_followups_number': 0, 'followups_2_hours': [0, 0],
                        'followups_24_hours': [0, 0], 'followups_48_hours': [0, 0], 'followups_more_48_hours': [0, 0]} \
                    if not is_drilldown else []
            df = df.groupby('property_id').agg({'lead_response_time_business': 'sum',
                                                'lead_response_time_non_business': 'sum',
                                                'sign_lease_time': 'sum', 'followups_number': 'sum',
                                                'followups_2_hours': lambda row: [el for el in row],
                                                'followups_24_hours': lambda row: [el for el in row],
                                                'followups_48_hours': lambda row: [el for el in row],
                                                'followups_more_48_hours': lambda row: [el for el in row]})

            df['average_response_time_business'] = df['lead_response_time_business'] \
                .apply(lambda row: simple_divider(sum([x['minutes'] for x in row]), len(row)))
            df['average_response_time_non_business'] = df['lead_response_time_non_business'] \
                .apply(lambda row: simple_divider(sum([x['minutes'] for x in row]), len(row)))
            df['average_sign_lease_time'] = df['sign_lease_time'] \
                .apply(lambda row: simple_divider(sum([x['days'] for x in row]), len(row)))
            df['average_followups_number'] = df['followups_number'] \
                .apply(lambda row: simple_divider(sum([x['followups'] for x in row]), len(row)))

            df['followups_sum'] = df.apply(
                lambda row: [sum([sum([x[0] for x in row.followups_2_hours]),
                                  sum([x[0] for x in row.followups_24_hours]),
                                  sum([x[0] for x in row.followups_48_hours]),
                                  sum([x[0] for x in row.followups_more_48_hours])]),
                             sum([sum([x[1] for x in row.followups_2_hours]),
                                  sum([x[1] for x in row.followups_24_hours]),
                                  sum([x[1] for x in row.followups_48_hours]),
                                  sum([x[1] for x in row.followups_more_48_hours])])],
                axis=1)
            for field in ['followups_2_hours', 'followups_24_hours',
                          'followups_48_hours', 'followups_more_48_hours']:
                df[field] = df[field].apply(lambda row: [sum([x[0] for x in row]), sum([x[1] for x in row])])
                df[field] = df.apply(lambda row: [simple_divider(row[field][0] * 100, row.followups_sum[0]),
                                                  simple_divider(row[field][1] * 100, row.followups_sum[1])], axis=1)
            df = df[
                ['average_response_time_business', 'average_response_time_non_business', 'average_sign_lease_time',
                 'average_followups_number', 'followups_2_hours', 'followups_24_hours', 'followups_48_hours',
                 'followups_more_48_hours']]
            result = json.loads(df.to_json(orient='table')).get('data', [])
            result = {item['property_id']: item for item in result}
        else:
            lead_response_time_sum = sum(
                [sum([item['minutes'] for item in report['lead_response_time_business']]) for report in reports])
            lead_response_time_len = sum([len(report['lead_response_time_business']) for report in reports])
            result['average_response_time_business'] = simple_divider(lead_response_time_sum, lead_response_time_len)

            lead_response_time_sum = sum(
                [sum([item['minutes'] for item in report['lead_response_time_non_business']]) for report in reports])
            lead_response_time_len = sum([len(report['lead_response_time_non_business']) for report in reports])
            result['average_response_time_non_business'] = simple_divider(lead_response_time_sum,
                                                                          lead_response_time_len)

            sign_lease_time_sum = sum([sum([item['days'] for item in report['sign_lease_time']]) for report in reports])
            sign_lease_time_len = sum([len(report['sign_lease_time']) for report in reports])
            result['average_sign_lease_time'] = simple_divider(sign_lease_time_sum, sign_lease_time_len)

            followups_number_sum = sum(
                [sum([item['followups'] for item in report['followups_number']]) for report in reports])
            followups_number_len = sum([len(report['followups_number']) for report in reports])
            result['average_followups_number'] = simple_divider(followups_number_sum, followups_number_len)

            followups_2_hours_business = sum([report['followups_2_hours'][0] for report in reports])
            followups_24_hours_business = sum([report['followups_24_hours'][0] for report in reports])
            followups_48_hours_business = sum([report['followups_48_hours'][0] for report in reports])
            followups_more_48_hours_business = sum([report['followups_more_48_hours'][0] for report in reports])
            followups_sum_business = followups_2_hours_business + followups_24_hours_business + \
                                     followups_48_hours_business + followups_more_48_hours_business

            followups_2_hours_non_business = sum([report['followups_2_hours'][1] for report in reports])
            followups_24_hours_non_business = sum([report['followups_24_hours'][1] for report in reports])
            followups_48_hours_non_business = sum([report['followups_48_hours'][1] for report in reports])
            followups_more_48_hours_non_business = sum([report['followups_more_48_hours'][1] for report in reports])
            followups_sum_non_business = followups_2_hours_non_business + followups_24_hours_non_business + \
                                         followups_48_hours_non_business + followups_more_48_hours_non_business

            result['followups_2_hours'] = [simple_divider(followups_2_hours_business * 100, followups_sum_business),
                                           simple_divider(followups_2_hours_non_business * 100,
                                                          followups_sum_non_business)]
            result['followups_24_hours'] = [simple_divider(followups_24_hours_business * 100, followups_sum_business),
                                            simple_divider(followups_24_hours_non_business * 100,
                                                           followups_sum_non_business)]
            result['followups_48_hours'] = [simple_divider(followups_48_hours_business * 100, followups_sum_business),
                                            simple_divider(followups_48_hours_non_business * 100,
                                                           followups_sum_non_business)]
            result['followups_more_48_hours'] = [
                simple_divider(followups_more_48_hours_business * 100, followups_sum_business),
                simple_divider(followups_more_48_hours_non_business * 100, followups_sum_non_business)]

    if report_type == 'tours_report':
        result = dict(total_tours=0, total_leases=0,
                      tours_data=dict(in_person={}, virtual_tour={}, guided_virtual_tour={}, facetime={}),
                      leases_data=dict(in_person={}, virtual_tour={}, guided_virtual_tour={}, facetime={}))
        df = pd.DataFrame(reports)
        if df.empty:
            return result if not is_drilldown else []

        if is_drilldown:
            df = df.groupby('property_id'). \
                agg({'in_person_tours': lambda s: len(sum(filter(None, s), [])),
                     'virtual_tours': lambda s: len(sum(filter(None, s), [])),
                     'guided_virtual_tours': lambda s: len(sum(filter(None, s), [])),
                     'facetime_tours': lambda s: len(sum(filter(None, s), [])),
                     'leads': lambda s: sum(filter(None, s), []),
                     'in_person_tours_leases': lambda s: sum(filter(None, s), []),
                     'virtual_tours_leases': lambda s: sum(filter(None, s), []),
                     'guided_virtual_tours_leases': lambda s: sum(filter(None, s), []),
                     'facetime_tours_leases': lambda s: sum(filter(None, s), [])})
            if df.empty:
                return result if not is_drilldown else []
            # tours data
            df['total_tours'] = df.apply(
                lambda row: row.in_person_tours + row.virtual_tours + row.guided_virtual_tours +
                            row.facetime_tours, axis=1)

            df['tours_data'] = df.apply(lambda row: dict(
                in_person=dict(name='In-Person', value=row.in_person_tours,
                               percent=round(simple_divider(row.in_person_tours * 100, row.total_tours), 1)),
                virtual_tour=dict(name='Virtual Tour', value=row.virtual_tours,
                                  percent=round(simple_divider(row.virtual_tours * 100, row.total_tours), 1)),
                guided_virtual_tour=dict(name='Guided Virtual Tour', value=row.guided_virtual_tours,
                                         percent=round(simple_divider(row.guided_virtual_tours * 100, row.total_tours),
                                                       1)),
                facetime=dict(name='Facetime', value=row.facetime_tours,
                              percent=round(simple_divider(row.facetime_tours * 100, row.total_tours), 1))
            ), axis=1)

        else:
            result = {}
            for field in ['in_person_tours', 'virtual_tours', 'guided_virtual_tours', 'facetime_tours', 'leads',
                          'in_person_tours_leases', 'virtual_tours_leases', 'guided_virtual_tours_leases',
                          'facetime_tours_leases']:
                result[field] = flatten(filter(None, df[field].to_list()))
            df = pd.Series(result)
            if df.empty:
                return result if not is_drilldown else []
            # tours data
            for field in ['in_person_tours', 'virtual_tours', 'guided_virtual_tours', 'facetime_tours']:
                df[field] = len(df[field])
            df['total_tours'] = df['in_person_tours'] + df['virtual_tours'] + df['guided_virtual_tours'] + \
                                df['facetime_tours']

            df['tours_data'] = dict(
                in_person=dict(name='In-Person', value=df['in_person_tours'],
                               percent=round(simple_divider(df['in_person_tours'] * 100, df['total_tours']), 1)),
                virtual_tour=dict(name='Virtual Tour', value=df['virtual_tours'],
                                  percent=round(simple_divider(df['virtual_tours'] * 100, df['total_tours']), 1)),
                guided_virtual_tour=dict(name='Guided Virtual Tour', value=df['guided_virtual_tours'],
                                         percent=round(simple_divider(df['guided_virtual_tours'] * 100,
                                                                      df['total_tours']), 1)),
                facetime=dict(name='Facetime', value=df['facetime_tours'],
                              percent=round(simple_divider(df['facetime_tours'] * 100, df['total_tours']), 1)))

        # leases data
        if is_performance:
            for field in ['in_person_tours_leases', 'virtual_tours_leases', 'guided_virtual_tours_leases',
                          'facetime_tours_leases']:
                df[field] = df.apply(lambda row: [x for x in row[field] if x in row['leads']], axis=1) \
                    if is_drilldown else [x for x in df[field] if x in df['leads']]

        for field in ['in_person_tours_leases', 'virtual_tours_leases', 'guided_virtual_tours_leases',
                      'facetime_tours_leases']:
            df[field] = df[field].apply(len) if is_drilldown else len(df[field])

        if is_drilldown:
            df['total_leases'] = df.apply(lambda row:
                                          row.in_person_tours_leases + row.virtual_tours_leases +
                                          row.guided_virtual_tours_leases + row.facetime_tours_leases, axis=1)

            df['leases_data'] = df.apply(lambda row: dict(
                in_person=dict(name='In-Person', value=row.in_person_tours_leases,
                               percent=round(simple_divider(row.in_person_tours_leases * 100, row.total_leases), 1)),
                virtual_tour=dict(name='Virtual Tour', value=row.virtual_tours_leases,
                                  percent=round(simple_divider(row.virtual_tours_leases * 100, row.total_leases), 1)),
                guided_virtual_tour=dict(name='Guided Virtual Tour', value=row.guided_virtual_tours_leases,
                                         percent=round(simple_divider(row.guided_virtual_tours_leases * 100,
                                                                      row.total_leases), 1)),
                facetime=dict(name='Facetime', value=row.facetime_tours_leases,
                              percent=round(simple_divider(row.facetime_tours_leases * 100, row.total_leases), 1))
            ), axis=1)
        else:
            df['total_leases'] = df['in_person_tours_leases'] + df['virtual_tours_leases'] + \
                                 df['guided_virtual_tours_leases'] + df['facetime_tours_leases']

            df['leases_data'] = dict(
                in_person=dict(name='In-Person', value=df['in_person_tours_leases'],
                               percent=round(simple_divider(df['in_person_tours_leases'] * 100, df['total_leases']),
                                             1)),
                virtual_tour=dict(name='Virtual Tour', value=df['virtual_tours_leases'],
                                  percent=round(simple_divider(df['virtual_tours_leases'] * 100, df['total_leases']),
                                                1)),
                guided_virtual_tour=dict(name='Guided Virtual Tour', value=df['guided_virtual_tours_leases'],
                                         percent=round(simple_divider(df['guided_virtual_tours_leases'] * 100,
                                                                      df['total_leases']), 1)),
                facetime=dict(name='Facetime', value=df['facetime_tours_leases'],
                              percent=round(simple_divider(df['facetime_tours_leases'] * 100, df['total_leases']), 1)))

        df = df.drop(['in_person_tours', 'virtual_tours', 'guided_virtual_tours', 'facetime_tours',
                      'in_person_tours_leases', 'virtual_tours_leases', 'guided_virtual_tours_leases',
                      'facetime_tours_leases', 'leads'], axis=1 if is_drilldown else 0)

        if is_drilldown:
            result = json.loads(df.to_json(orient='table')).get('data', [])
            result = {item['property_id']: item for item in result}
        else:
            result = df.to_dict()
    return result


def calculate_customer_call_score(reports):
    call_score_sum = sum(
        [sum([item['score'] for item in report['call_score']]) for report in
         reports if report['call_score']])
    call_score_len = sum([len(report['call_score']) for report in reports if report['call_score']])
    average_call_score = round(call_score_sum / call_score_len, 1) if call_score_len else 0.0

    return average_call_score


def get_activities_data(date_range, properties=None):
    """
    This report shows an overview of all lead activities performed by the team in the selected time range.
    :param date_range:
    :param properties:
    :return:
    """
    lead_status_filter = (
            Q(lead__status=Lead.LEAD_LOST) & (Q(lead__lost_reason__name='Spam') | Q(lead__lost_reason__name='Test'))
    )
    activities_filter = get_filter(date_range, properties)
    activities = Activity.objects.filter(activities_filter).exclude(Q(lead__status=Lead.LEAD_TEST) | lead_status_filter)

    notes = []
    emails = []
    tasks = []
    for activity in activities.filter(type=Activity.NOTE_CREATED):
        notes.append(dict(lead=activity.lead.pk, activity=activity.pk))
    for activity in activities.filter(type=Activity.EMAIL_CREATED):
        emails.append(dict(lead=activity.lead.pk, activity=activity.pk))
    for activity in activities.filter(type__in=[Activity.TASK_CREATED, Activity.TOUR_CREATED]):
        tasks.append(dict(lead=activity.lead.pk, activity=activity.pk))

    calls = Call.objects.filter(property__in=properties, date__range=date_range,
                                call_category=Call.CALL_CATEGORY_PROSPECT
                                ).exclude(Q(lead__status=Lead.LEAD_TEST) | lead_status_filter).count()

    # Total chat conversations
    prospect_lead_status_filter = (
            Q(prospect__lead__status=Lead.LEAD_LOST) &
            (Q(prospect__lead__lost_reason__name='Spam') | Q(prospect__lead__lost_reason__name='Test'))
    )
    prospect_guest_card_status_filter = (
            Q(prospect__guest_card__status=Lead.LEAD_LOST) &
            (Q(prospect__guest_card__lost_reason__name='Spam') | Q(prospect__guest_card__lost_reason__name='Test'))
    )

    conversations = ChatConversation.objects.filter(
        property__in=properties, date__range=date_range, type=ChatConversation.TYPE_GREETING
    ).exclude(
        Q(prospect__lead__status=Lead.LEAD_TEST) | Q(prospect__guest_card__status=Lead.LEAD_TEST) |
        prospect_guest_card_status_filter | prospect_lead_status_filter
    )

    # Count of chat conversations transferred to live agent
    agent_chats = 0
    for conversation in conversations:
        next_conversation = conversation.prospect.conversations.filter(
            date__gt=conversation.date, type=ChatConversation.TYPE_GREETING).order_by('date').first()

        additional_args = dict()
        # if we have another more recent session, messages date should be less than this session date
        if next_conversation:
            additional_args = dict(date__lt=next_conversation.date)

        # messages from agent in current session
        agent_conversations = conversation.prospect.conversations.filter(type=ChatConversation.TYPE_AGENT,
                                                                         date__gt=conversation.date,
                                                                         **additional_args)
        # at least one message to agent
        if agent_conversations.count():
            agent_chats += 1

    return dict(notes=list(notes), emails=list(emails), tasks=list(tasks), calls=calls, agent_chats=agent_chats)


def get_score_by_category(call, category):
    question_filter = Q(category=category) & Q(status=CallScoringQuestion.STATUS_ACTIVE)
    questions = CallScoringQuestion.objects.filter(question_filter).count()
    yes = call.questions.filter(question_filter).count()
    omitted = call.omitted_questions.filter(question_filter).count()
    return dict(call=call.call_id, score=(yes * 100.0 / (questions - omitted) if questions - omitted != 0 else 0))


def get_call_score(scored_calls_ids, agent=None):
    questions_sum = CallScoringQuestion.objects.aggregate(questions_sum=Sum('weight'))['questions_sum']
    call_filter = Q(id__in=scored_calls_ids)
    if agent:
        call_filter &= Q(agent=agent)
    overall_meaningful_scores = ScoredCall.objects.filter(call_filter) \
        .annotate(overall_meaningful_scores=questions_sum - Coalesce(Sum('omitted_questions__weight'), 0)) \
        .values('call', 'overall_meaningful_scores')
    call_score = ScoredCall.objects.filter(call_filter) \
        .annotate(score=Coalesce(Sum('questions__weight'), 0)).values('call', 'score', 'agent')

    json_format_overall_scores = {}
    for i in overall_meaningful_scores:
        json_format_overall_scores[i['call']] = i['overall_meaningful_scores']
    for score in call_score:
        overall_score = json_format_overall_scores.get(score['call'])
        if overall_score:
            score['score'] = simple_divider(score['score'] * 100.0, overall_score)

    if agent:
        score_sum = sum([item['score'] for item in call_score])
        score_len = len(call_score)
        return dict(agent=agent.id, score=simple_divider(score_sum, score_len), scores=[i for i in call_score])
    return call_score


def get_call_scoring_data(date_range, properties=None):
    scored_calls = ScoredCall.objects.filter(
        property__in=properties, call__date__range=date_range).exclude(rescore_status='REQUIRED')
    scored_calls_ids = list(scored_calls.values_list('id', flat=True))
    call_score = get_call_score(scored_calls_ids)

    introduction_score = []
    qualifying_score = []
    amenities_score = []
    closing_score = []
    overall_score = []

    for call in scored_calls:
        introduction_score.append(
            get_score_by_category(call, CallScoringQuestion.CATEGORY_INTRODUCTION_AND_LEAD_INFORMATION))
        qualifying_score.append(
            get_score_by_category(call, CallScoringQuestion.CATEGORY_QUALIFYING_QUESTIONS))
        amenities_score.append(
            get_score_by_category(call, CallScoringQuestion.CATEGORY_AMENITIES_AND_BENEFITS))
        closing_score.append(
            get_score_by_category(call, CallScoringQuestion.CATEGORY_CLOSING))
        overall_score.append(
            get_score_by_category(call, CallScoringQuestion.CATEGORY_OVERALL_IMPRESSION))

    agents = User.objects.filter(properties__in=properties) \
        .annotate(
        scored_calls_num=Count(
            'agent_scored_calls',
            filter=Q(agent_scored_calls__call__date__range=date_range, agent_scored_calls__property__in=properties)
        )
    ).filter(scored_calls_num__gt=0)

    agents_call_score = []
    for agent in agents:
        agents_call_score.append(get_call_score(scored_calls_ids, agent=agent))

    return dict(call_score=list(call_score),
                introduction_score=introduction_score, qualifying_score=qualifying_score,
                amenities_score=amenities_score, closing_score=closing_score, overall_score=overall_score,
                agents_call_score=agents_call_score)


def get_calls_data(date_range, properties=None):
    """
    This report shows an overview of call performance across the team for the selected time range.
    :param date_range:
    :param properties:
    :return:
    """
    prospect_calls = Call.objects.filter(property__in=properties, date__range=date_range,
                                         call_category=Call.CALL_CATEGORY_PROSPECT)
    business_calls = []
    for call in prospect_calls:
        is_missed = (call.call_result != Call.CALL_RESULT_NO_ANSWER or call.duration > 5)
        if (is_business_hours_lead(call) == 'BUSINESS' or call.call_result != Call.CALL_RESULT_NO_ANSWER) and is_missed:
            business_calls.append(call.id)

    prospect_calls = prospect_calls.filter(id__in=business_calls)
    call_time = prospect_calls.aggregate(time=Coalesce(Sum('duration'), 0))['time'] or 0
    call_answered = prospect_calls.filter(call_result=Call.CALL_RESULT_COMPLETED).count()
    call_missed = prospect_calls.filter(call_result=Call.CALL_RESULT_NO_ANSWER).count()
    call_busy = prospect_calls.filter(call_result=Call.CALL_RESULT_BUSY).count()
    call_failed = prospect_calls.filter(call_result=Call.CALL_RESULT_FAILED).count()

    return dict(prospect_calls=prospect_calls.count(), call_answered=call_answered, call_missed=call_missed,
                call_time=call_time, call_busy=call_busy, call_failed=call_failed)


def get_property_business_hours(property, history_date, is_historical=True):
    property_business_hours = []
    for business_hours in property.business_hours.order_by('weekday').all():
        try:
            if is_historical:
                business_hours_data = business_hours.history.as_of(history_date)
            else:
                business_hours_data = business_hours
        except BusinessHours.DoesNotExist:
            business_hours_data = business_hours
        if business_hours_data.is_workday:
            property_business_hours.append(dict(weekday=business_hours_data.weekday,
                                                start_time=business_hours_data.start_time,
                                                end_time=business_hours_data.end_time))
    return property_business_hours


def check_floating_holidays(obj):
    obj_date = obj.date if obj.__class__.__name__ == 'Call' else obj.acquisition_date
    floating_holidays = Holiday.objects.filter(date__isnull=True, country=obj.property.country)
    for holiday in floating_holidays:
        if 'Thanksgiving' in holiday.name:
            thanksgiving = date(obj_date.year, 11, 1) + rd(weekday=TH(+4))
            if obj_date.date() == thanksgiving:
                return True
    return False


def get_lead_created_business_hours(obj):
    obj_date = obj.date if obj.__class__.__name__ == 'Call' else obj.acquisition_date
    property_business_hours = get_property_business_hours(obj.property, obj_date)
    lead_created_business_hours = next(
        (time for time in property_business_hours
         if time['weekday'] == obj_date.astimezone(tz=TZ).weekday()), None)
    if lead_created_business_hours:
        fixed_holidays = Holiday.objects.filter(date__month=obj_date.month,
                                                date__day=obj_date.day,
                                                country=obj.property.country)
        if fixed_holidays.count():
            return None
        if check_floating_holidays(obj):
            return None
    return lead_created_business_hours


def is_business_hours_lead(obj):
    """
    Check the lead that's coming in property team's business time.
    Business: [opening time, closing time - 1 hour]
    Non Business: extra time of business hours
    Non Business Additional: [closing time - 1 hour, closing time] or closed day.
    :param obj:
    :return:
    """
    obj_date = obj.date if obj.__class__.__name__ == 'Call' else obj.acquisition_date
    lead_created_business_hours = get_lead_created_business_hours(obj)
    if lead_created_business_hours:
        actual_start_time = TZ.localize(
            datetime.combine(obj_date.astimezone(tz=TZ), lead_created_business_hours['start_time']))
        end_time = TZ.localize(
            datetime.combine(obj_date.astimezone(tz=TZ), lead_created_business_hours['end_time']))
        actual_end_time = end_time - timedelta(hours=1)
        if actual_start_time <= obj_date.astimezone(tz=TZ) <= actual_end_time:
            return 'BUSINESS'
        if actual_end_time < obj_date.astimezone(tz=TZ) <= end_time:
            return 'NON_BUSINESS_ADDITIONAL'  # lead was created in an hour before end of the workday
        return 'NON_BUSINESS'
    return 'NON_BUSINESS_ADDITIONAL'  # lead was created on closed day


def get_next_working_date(lead, acquisition_date):
    """
    Get next opening time after the lead created date.
    It will usually be used for non-business leads (also, additional) to detect how fast the lead is followed up
    from next business hours.
    :param lead:
    :return:
    """
    property_business_hours = get_property_business_hours(lead.property, acquisition_date)
    actual_lead_created_day = acquisition_date.astimezone(tz=TZ).weekday()
    for day in range(0, 6):
        next_workday = (actual_lead_created_day + day) % 7
        if next_workday in [bh['weekday'] for bh in property_business_hours]:
            lead_created_business_hours = next(
                (time for time in property_business_hours if time['weekday'] == next_workday), None
            )
            next_working_date_time = TZ.localize(datetime.combine(
                acquisition_date.astimezone(tz=TZ) + timedelta(days=day),
                lead_created_business_hours['start_time'])
            )
            if next_working_date_time < acquisition_date:
                continue
            return next_working_date_time


def get_previous_working_date(property, date, is_historical):
    """
    Get next opening time after the lead created date.
    It will usually be used for non-business leads (also, additional) to detect how fast the lead is followed up
    from next business hours.
    :param lead:
    :return:
    """
    property_business_hours = get_property_business_hours(property, date, is_historical)
    actual_date = date.astimezone(tz=TZ).weekday()
    for day in range(0, 6):
        previous_workday = (actual_date - day) % 7
        previous_workday_time = next(
            (time for time in property_business_hours if time['weekday'] == previous_workday), None
        )
        if not previous_workday_time:
            continue

        previous_workday_datetime = TZ.localize(datetime.combine(
            date.astimezone(tz=TZ) - timedelta(days=day), previous_workday_time['end_time'])
        )
        return previous_workday_datetime


def is_responded_before_closing(lead, followup_date, acquisition_date):
    """
    Check if the lead is followed up before team's closing time.
    :param lead:
    :param followup_date: first follow up date
    :return:
    """
    lead_created_business_hours = get_lead_created_business_hours(lead)
    if lead_created_business_hours:
        end_time = TZ.localize(
            datetime.combine(acquisition_date.astimezone(tz=TZ), lead_created_business_hours['end_time'])
        )
        actual_end_time = end_time - timedelta(hours=1)
        return actual_end_time < followup_date.astimezone(tz=TZ) <= end_time
    return False


def nearest(items, pivot):
    return min([i for i in items if i < pivot], key=lambda x: abs(x - pivot))


def get_engagement_data(date_range, properties=None):
    """
    This report shows an overview of key lead engagement metrics in the selected time range.
    :param date_range:
    :param properties:
    :return:
    """

    lead_status_filter = (Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test')))
    email_filter = EmailMessage.objects.filter(
        property=OuterRef('property'), receiver_email=OuterRef('email'),
        date__gte=OuterRef('compare_date'), is_guest_card_email=False,
    ).order_by('receiver_email', 'date').distinct('receiver_email').values('date')

    leads_filter = Q(property__isnull=False)
    if properties:
        leads_filter = Q(property__in=properties)
    if date_range:
        leads_filter.add(Q(acquisition_date__lte=date_range[1], acquisition_date__gte=date_range[0]), Q.AND)

    leads = Lead.objects.exclude(Q(status=Lead.LEAD_TEST) | lead_status_filter).filter(leads_filter).annotate(
        compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                          default=F('last_reactivated_date'),
                          output_field=models.DateTimeField())).annotate(
        first_followup_email=Subquery(email_filter),
        first_followup_sms=Subquery(
            SMSContent.objects.filter(
                lead=OuterRef('pk'),
                date__gte=OuterRef('compare_date')
            ).order_by('lead', 'date').distinct('lead').values('date')),
        first_followup_note=Subquery(
            Note.objects.filter(
                lead=OuterRef('pk'),
                is_follow_up=True,
                created__gte=OuterRef('compare_date')
            ).order_by('lead', 'created').distinct('lead').values('created')),
        first_stage_update=Subquery(
            Activity.objects.filter(
                type=Activity.LEAD_UPDATED,
                lead=OuterRef('pk'),
                created__gte=OuterRef('compare_date'),
                content__in=[
                    'Stage updated to Contact made',
                    'Stage updated to Application complete',
                    'Stage updated to Application pending',
                    'Stage updated to Tour set',
                    'Stage updated to Tour completed'
                ]
            ).order_by('created').values('created')[:1]
        )
    ).annotate(first_followup_date=Least('first_followup_email', 'first_followup_sms', 'first_followup_note',
                                         'first_stage_update')).exclude(first_followup_date=None).annotate(
        first_followup_type=Case(
            When(first_followup_date=F('first_followup_email'), then=Value('Email')),
            When(first_followup_date=F('first_followup_sms'), then=Value('SMS')),
            When(first_followup_date=F('first_followup_note'), then=Value('Note')),
            When(first_followup_date=F('first_stage_update'), then=Value('Stage update')),
            output_field=models.CharField(),
        ))

    reports = Report.objects.filter(property__in=properties)
    response_times = flatten(list(reports.values_list('lead_response_time_business', flat=True)) +
                             list(reports.values_list('lead_response_time_non_business', flat=True)))
    old_leads_ids = [item.get('lead') for item in response_times]
    new_leads = leads.exclude(id__in=old_leads_ids)

    lead_response_time_business = []
    lead_response_time_non_business = []
    for lead in new_leads:
        followup_date = lead.first_followup_date

        data = lead.history.exclude(last_source=None).order_by('acquisition_date') \
            .values_list('acquisition_date').distinct()
        history = [lead.created] + [record[0] for record in data]
        acquisition_date = nearest(history, followup_date)

        type = lead.first_followup_type
        result = is_business_hours_lead(lead)
        is_business_hours = result == 'BUSINESS'
        is_additional = result == 'NON_BUSINESS_ADDITIONAL'

        # lead response time
        if not is_additional:
            if is_business_hours:
                lead_response_time_business.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=followup_date.isoformat(),
                        minutes=round((followup_date - acquisition_date).total_seconds() / 60, 1),
                        type=type,
                    )
                )
            else:
                lead_response_time_non_business.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=followup_date.isoformat(),
                        minutes=round((followup_date - acquisition_date).total_seconds() / 60, 1),
                        type=type,
                    )
                )
                if followup_date.astimezone(tz=TZ) > get_next_working_date(lead, acquisition_date):
                    # If the lead created on non-business hours is followed up after next opening hours,
                    # then we should count this for business hours as well.
                    lead_response_time_business.append(
                        dict(
                            lead=lead.pk,
                            first_followup_date=followup_date.isoformat(),
                            minutes=round(
                                (followup_date - get_next_working_date(lead, acquisition_date)).total_seconds() / 60,
                                1),
                            type=type,
                        )
                    )
        else:
            if is_responded_before_closing(lead, followup_date, acquisition_date):
                lead_response_time_non_business.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=followup_date.isoformat(),
                        minutes=round((followup_date - acquisition_date).total_seconds() / 60, 1),
                        type=type,
                    )
                )
            elif followup_date.astimezone(tz=TZ) < get_next_working_date(lead, acquisition_date):
                continue
            else:
                # todo confirm
                lead_response_time_non_business.append(
                    dict(
                        lead=lead.pk,
                        first_followup_date=followup_date.isoformat(),
                        minutes=round(
                            (followup_date.astimezone(tz=TZ) - get_next_working_date(
                                lead, acquisition_date)).total_seconds() / 60, 1
                        ),
                        type=type,
                    )
                )

    sign_lease_times = flatten(list(reports.values_list('sign_lease_time', flat=True)))
    old_leads_ids = [item.get('lead') for item in sign_lease_times]
    new_leads = leads.exclude(id__in=old_leads_ids)

    # sign lease time
    closed_leads = new_leads.filter(status=Lead.LEAD_CLOSED)
    sign_lease_time = []
    for lead in closed_leads:
        data = lead.history.exclude(last_source=None).order_by('acquisition_date') \
            .values_list('acquisition_date').distinct()
        history = [lead.created] + [record[0] for record in data]
        acquisition_date = nearest(history, lead.closed_status_date)
        sign_lease_time.append(dict(
            lead=lead.id,
            days=(lead.closed_status_date - acquisition_date).days if lead.closed_status_date else 0))

    # followups number before lease
    closed_leads = closed_leads.annotate(
        email_followups_number=Subquery(
            EmailMessage.objects.filter(
                property=OuterRef('property'),
                date__gte=OuterRef('compare_date'),
                receiver_email=OuterRef('email'),
                date__lt=OuterRef('closed_status_date'),
                is_guest_card_email=False
            ).values('receiver_email').annotate(followups_number=Count('receiver_email')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        sms_followups_number=Subquery(
            SMSContent.objects.filter(
                lead=OuterRef('pk'),
                date__lt=OuterRef('closed_status_date'),
                date__gte=OuterRef('compare_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        note_followups_number=Subquery(
            Note.objects.filter(
                lead=OuterRef('pk'),
                is_follow_up=True,
                created__lt=OuterRef('closed_status_date'),
                created__gte=OuterRef('compare_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        stage_followups_number=Subquery(
            Activity.objects.filter(
                type=Activity.LEAD_UPDATED,
                lead=OuterRef('pk'),
                created__gte=OuterRef('compare_date'),
                content__in=[
                    'Stage updated to Contact made',
                    'Stage updated to Application complete',
                    'Stage updated to Application pending',
                    'Stage updated to Tour set',
                    'Stage updated to Tour completed'
                ],
                created__lt=OuterRef('closed_status_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        )
    ).annotate(
        followups_number=Coalesce(F('email_followups_number'), 0) + Coalesce(F('sms_followups_number'), 0) +
                         Coalesce(F('note_followups_number'), 0) + Coalesce(F('stage_followups_number'), 0)
    ).exclude(followups_number=0)
    followups_number = [dict(lead=lead.pk, followups=lead.followups_number) for lead in closed_leads]

    # first followups in hours
    followups_2_hours = [
        len([response_time for response_time in lead_response_time_business if
             response_time['minutes'] / 60 <= 2]),
        len([response_time for response_time in lead_response_time_non_business if
             response_time['minutes'] / 60 <= 2]),
    ]
    followups_24_hours = [
        len([response_time for response_time in lead_response_time_business if
             2 < response_time['minutes'] / 60 <= 24]),
        len([response_time for response_time in lead_response_time_non_business if
             2 < response_time['minutes'] / 60 <= 24]),
    ]
    followups_48_hours = [
        len([response_time for response_time in lead_response_time_business if
             24 < response_time['minutes'] / 60 <= 48]),
        len([response_time for response_time in lead_response_time_non_business if
             24 < response_time['minutes'] / 60 <= 48]),
    ]
    followups_more_48_hours = [
        len([response_time for response_time in lead_response_time_business if
             48 < response_time['minutes'] / 60]),
        len([response_time for response_time in lead_response_time_non_business if
             48 < response_time['minutes'] / 60]),
    ]

    return dict(lead_response_time_business=lead_response_time_business,
                lead_response_time_non_business=lead_response_time_non_business, sign_lease_time=sign_lease_time,
                followups_number=followups_number, followups_2_hours=followups_2_hours,
                followups_24_hours=followups_24_hours, followups_48_hours=followups_48_hours,
                followups_more_48_hours=followups_more_48_hours)


def get_actual_dates(date_range, property_id, is_historical=False):
    property = Property.objects.filter(id=property_id).first()
    # first day in range business hours
    first_day = get_previous_working_date(property, date_range[0] - timedelta(days=1), is_historical)
    # last day in range business hours
    last_day = get_previous_working_date(property, date_range[1], is_historical)
    return first_day, last_day


def get_lead_to_lease_data(date_range, properties=None, is_historical=False):
    """
    This generate reports for overview of the team's lead-to-lease progress
    :param date_range:
    :param properties:
    :return:
    """
    lead_status_filter = (Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test')))
    leads = []
    for property in properties:
        dates = get_actual_dates(date_range, property.id, is_historical)
        leads_filter = get_filter(dates, [property])
        leads += Lead.objects.filter(leads_filter).exclude(
            Q(status=Lead.LEAD_TEST) | lead_status_filter).values_list('id', flat=True)
    leases = Lead.objects.filter(
        closed_status_date__lte=date_range[1], closed_status_date__gte=date_range[0], status=Lead.LEAD_CLOSED,
        property__in=properties
    ).values_list('id', flat=True)
    tours = Lead.objects.filter(
        tour_completed_date__lte=date_range[1], tour_completed_date__gte=date_range[0], property__in=properties
    ).exclude(Q(status=Lead.LEAD_TEST) | lead_status_filter).values_list('id', flat=True)
    lost_leads = Lead.objects.filter(
        lost_status_date__lte=date_range[1], lost_status_date__gte=date_range[0], status=Lead.LEAD_LOST,
        property__in=properties
    ).exclude(Q(status=Lead.LEAD_TEST) | lead_status_filter).values_list('id', flat=True)

    return dict(leads=list(leads), tours=list(tours), leases=list(leases), lost_leads=list(lost_leads))


def calculate_lead_source_data(date_range, properties=None, is_historical=False):
    result = []
    for property in properties:
        sources = ProspectSource.objects.filter(property=property)
        for source in sources:
            data = {'id': source.id, 'name': source.name, 'spends': source.spends, 'property': property.id}

            lead_status_filter = Q(status=Lead.LEAD_TEST) | (Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam')
                                                                                         | Q(lost_reason__name='Test')))
            leads_filter = get_filter(get_actual_dates(date_range, property.id, is_historical), [property])
            data['leads'] = list(Lead.objects.filter(leads_filter & Q(source=source))
                                 .exclude(lead_status_filter).values_list('id', flat=True))
            data['leases'] = list(Lead.objects.filter(property=property, source=source,
                                                      closed_status_date__lte=date_range[1],
                                                      closed_status_date__gte=date_range[0],
                                                      status=Lead.LEAD_CLOSED)
                                  .exclude(lead_status_filter).values_list('id', flat=True))
            data['tours'] = list(Lead.objects.filter(property=property, source=source,
                                                     tour_completed_date__lte=date_range[1],
                                                     tour_completed_date__gte=date_range[0])
                                 .exclude(lead_status_filter).values_list('id', flat=True))
            data['calls'] = list(
                Call.objects.filter(property=property, date__range=date_range).exclude(
                    Q(lead__status=Lead.LEAD_TEST) | (Q(lead__status=Lead.LEAD_LOST) &
                                                      Q(lead__lost_reason__name__in=['Spam', 'Test']))
                ).annotate(
                    migrated_source=Case(
                        When(tracking_number=None,
                             then=Subquery(
                                 SourceMatching.objects.filter(LH_source=OuterRef('source')).values('ResMan_source'))),
                        default=F('source'), output_field=models.CharField())
                ).filter(migrated_source__iexact=source.name).values_list('id', flat=True))

            if len(data['leads']) > 0 or len(data['leases']) > 0 or len(data['tours']) > 0 or len(data['calls']) > 0:
                result.append(data)
    return result


def load_source_data(date_range, properties=None, is_performance=True, show_paid_only=False):
    """
    todo this is just temporary fix, we will migrate mechanism to store the reports data to Model and load it soon.
    This report shows the total number of leads, tours, and leases in the time range, grouped by lead source.
    :param date_range:
    :param properties:
    :param show_paid_only: only show Paid source if its True
    :param is_performance:
    :return:
    """
    sources_filter = get_filter(None, properties)
    lead_status_filter = (Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test')))
    if show_paid_only:
        q_keys = Q()
        spends_dates = [
            {'date': datetime(year=m // 12, month=m % 12 + 1, day=1).strftime('%Y-%m-%d')} for m in
            range(date_range[0].year * 12 + date_range[0].month - 1, date_range[1].year * 12 + date_range[1].month)
        ]
        for spends_date in spends_dates:
            q_keys |= Q(spends__contains=[spends_date])
        sources_filter &= Q(q_keys)

    leads = []
    for property in properties:
        leads_filter = get_filter(get_actual_dates(date_range, property.id), [property])
        leads += Lead.objects.filter(leads_filter).exclude(
            Q(status=Lead.LEAD_TEST) | lead_status_filter
        ).values_list('id', flat=True)

    # overall filters
    leases_filter = Count('leads', filter=Q(leads__closed_status_date__lte=date_range[1],
                                            leads__closed_status_date__gte=date_range[0],
                                            leads__status=Lead.LEAD_CLOSED))
    leads_status_filter = (Q(leads__status=Lead.LEAD_LOST) &
                           (Q(leads__lost_reason__name='Spam') | Q(leads__lost_reason__name='Test')))
    tours_filter = Count('leads', filter=Q(
        leads__tour_completed_date__lte=date_range[1],
        leads__tour_completed_date__gte=date_range[0]
    ) & (~Q(leads__status=Lead.LEAD_TEST) | ~leads_status_filter))

    # performance filters
    leases_filter_performance = Count(
        'leads', filter=Q(leads__closed_status_date__lte=date_range[1],
                          leads__closed_status_date__gte=date_range[0], leads__status=Lead.LEAD_CLOSED, leads__in=leads)
    )
    tours_filter_performance = Count(
        'leads',
        filter=Q(leads__tour_completed_date__lte=date_range[1], leads__tour_completed_date__gte=date_range[0],
                 leads__in=leads) & (~Q(leads__status=Lead.LEAD_TEST) | ~leads_status_filter)
    )

    calls = Call.objects.exclude(
        Q(lead__status=Lead.LEAD_TEST) |
        (Q(lead__status=Lead.LEAD_LOST) & (Q(lead__lost_reason__name='Spam') | Q(lead__lost_reason__name='Test')))
    ).annotate(
        migrated_source=Case(When(tracking_number=None, then=Subquery(
            SourceMatching.objects.filter(LH_source=OuterRef('source')).values('ResMan_source'))),
                             default=F('source'),
                             output_field=models.CharField()))
    calls = calls.filter(
        migrated_source__iexact=OuterRef('name'), property=OuterRef('property'), date__range=date_range).values(
        'migrated_source').annotate(number=Count('*')).values('number')
    sources = ProspectSource.objects.filter(sources_filter).annotate(
        leads_cnt=Count('leads', filter=Q(leads__in=leads)),
        leases=leases_filter_performance if is_performance else leases_filter,
        tours=tours_filter_performance if is_performance else tours_filter).filter(
        Q(leads_cnt__gt=0) | Q(leases__gt=0) | Q(tours__gt=0)).order_by('-leads_cnt', 'property__name', 'name')

    call_sources = ProspectSource.objects.filter(sources_filter).annotate(
        calls=Coalesce(Subquery(calls, output_field=models.IntegerField()), 0)
    ).filter(calls__gt=0)

    result_sources_data = list(sources.values('name', 'leads_cnt', 'leases', 'tours', 'spends', 'property__pk', 'id'))
    call_sources_data = list(call_sources.values('id', 'calls'))
    if len(result_sources_data) and len(call_sources_data):
        df1 = pd.DataFrame(list(result_sources_data))
        df2 = pd.DataFrame(list(call_sources_data))
        df = pd.merge(df1, df2, on='id', how='left').fillna(0)
        return json.loads(df.to_json(orient='table')).get('data', [])
    elif len(result_sources_data):
        return [dict(calls=0, **item) for item in result_sources_data]
    elif len(call_sources_data):
        return [dict(leads_cnt=0, leases=0, tours=0, spends=[], **item) for item in
                list(call_sources.values('id', 'name', 'calls'))]
    return []


def get_lead_source_data(reports, limit=None, page=None, is_performance=True, show_paid_only=False,
                         aggregate_mode=False):
    """
    This report shows the total number of leads, tours, and leases in the time range, grouped by lead source.
    :param reports:
    :param limit:
    :param page:
    :param aggregate_mode: we will aggregate source data if this set to True
    :param show_paid_only: only show Paid source if its True
    :param is_performance:
    :return:
    """
    sources = list(itertools.chain(*list(reports.values_list('sources', flat=True))))

    # aggregation for same sources from different dates
    if len(sources):
        df = pd.DataFrame(sources)
        df = df.groupby('id').agg(
            {'leads': lambda s: sum(s, []), 'leases': lambda s: sum(s, []), 'tours': lambda s: sum(s, []),
             'calls': lambda s: sum(s, []), 'spends': lambda s: sum(s, []),
             'name': 'first', 'property': 'first'}).reset_index()
        if show_paid_only:
            df = df[df['spends'].apply(lambda x: len(x)) > 0]

        # it's possible that we don't have any sources after spends filtering
        if df.empty:
            return {'results': [], 'count': 0} if limit and page else []

        if is_performance:
            df['leases'] = df.apply(lambda row: [x for x in row['leases'] if x in row['leads']], axis=1)
            df['tours'] = df.apply(lambda row: [x for x in row['tours'] if x in row['leads']], axis=1)
            df = df.drop(df[(df['leads'].map(len) == 0) & (df['leases'].map(len) == 0)
                            & (df['tours'].map(len) == 0) & (df['calls'].map(len) == 0)].index)
            if df.empty:
                return {'results': [], 'count': 0} if limit and page else []

        df['leads'] = df['leads'].apply(len)
        df['leases'] = df['leases'].apply(len)
        df['tours'] = df['tours'].apply(len)
        df['calls'] = df['calls'].apply(len)

        if aggregate_mode:
            df = df.groupby('name').agg(
                {'leads': 'sum', 'leases': 'sum', 'tours': 'sum', 'id': 'min', 'calls': 'sum',
                 'spends': lambda s: sum(s, [])}).reset_index()

        df['leased_rate'] = df.apply(lambda row: simple_divider(row.leases * 100, row.leads), axis=1)
        df['tour_completed_rate'] = df.apply(lambda row: simple_divider(row.tours * 100, row.leads), axis=1)

        df['source'] = df['name']
        del df['name']
        sources = json.loads(df.to_json(orient='table')).get('data', [])

    # now we'll need aggregate source not only in aggregate mode, but for same sources in different days
    def aggregate_spends(source):
        if not len(source['spends']):
            return source
        df = pd.DataFrame([spends for spends in source['spends'] if spends.get('date')])
        source['spends'] = json.loads(df.groupby('date').agg('sum').to_json(orient='table')).get('data', [])
        return source

    sources = sorted([aggregate_spends(source) for source in sources], key=lambda source: source['leads'], reverse=True)

    count = 0
    if limit and page:
        paginator = Paginator(sources, limit)
        current_page = paginator.page(page)
        sources = current_page.object_list
        count = paginator.count

    result = {'results': sources, 'count': count} if limit and page else sources
    return result


def get_lead_lost_data(reports, properties=None, is_performance=True, is_drilldown=False):
    """
    This report shows the total count of leads lost in the time range, grouped by lead lost reason.
    :param reports:
    :param is_drilldown: defines if calculations are for report drilldown
    :param properties:
    :param is_performance:
    :return:
    """
    lost_reason_names = ProspectLostReason.objects.filter(
        property__in=properties).values_list('name', flat=True).distinct()
    result = {'lost_leads': 0}
    df = pd.DataFrame(reports)
    if df.empty:
        return result if not is_drilldown else []
    if is_drilldown:
        df = df.groupby('property_id').agg({'leads': lambda s: sum(filter(None, s), []),
                                            'lost_leads': lambda s: sum(filter(None, s), [])}).reset_index()
    else:
        result = {}
        for field in ['leads', 'lost_leads']:
            result[field] = flatten(filter(None, df[field].to_list()))
        df = pd.Series(result)
    if df.empty:
        return result if not is_drilldown else []

    if is_performance:
        df['lost_leads'] = df.apply(lambda row: list(set(row['leads']) & set(row['lost_leads'])), axis=1) \
            if is_drilldown else list(set(df['leads']) & set(df['lost_leads']))
    if df.empty:
        return result if not is_drilldown else []

    for lost_reason in lost_reason_names:
        if is_drilldown:
            df[hyphens(lost_reason)] = df.apply(lambda row: dict(
                name=lost_reason,
                value=Lead.objects.filter(id__in=row['lost_leads'], lost_reason__name=lost_reason).count()), axis=1)
        else:
            df[hyphens(lost_reason)] = dict(
                name=lost_reason,
                value=Lead.objects.filter(id__in=df['lost_leads'], lost_reason__name=lost_reason).count())

    df['lost_leads'] = df['lost_leads'].apply(len) if is_drilldown else len(df['lost_leads'])
    del df['leads']

    if is_drilldown:
        df['property'] = df['property_id']
        del df['property_id']
        result = json.loads(df.to_json(orient='table')).get('data', [])
    else:
        result = df.to_dict()
    return result


def calculate_occupied_units(date_range, units):
    occupied_units = 0
    df = pd.DataFrame(list(units.filter(lease_dates__0__start_date__isnull=False,
                                        lease_dates__0__end_date__isnull=False).values('id', 'lease_dates')))
    if not df.empty:
        df1 = pd.concat([pd.DataFrame(x) for x in df['lease_dates']], keys=df['lease_dates'].index)
        df = df.drop('lease_dates', 1).join(df1.reset_index(level=1, drop=True)).reset_index(drop=True)
        mask = (pd.to_datetime(df['start_date']).dt.date <= date_range[1].date()) & (
                date_range[0].date() <= pd.to_datetime(df['end_date']).dt.date)
        df = df.loc[mask]
        occupied_units = df['id'].nunique()
    return occupied_units


def get_occupancy_ltn_data(date_range, properties=None, unit_type=None):
    """
    This report shows the total count of units at the property and the associated occupancy rate and forecasted LTN data.
    :param unit_type: selected unit type
    :param date_range:
    :param properties:
    :return:
    """
    result = {}
    LTN = 93.70
    reports = Report.objects.filter(property__in=properties, date__gte=date_range[0].date(),
                                    date__lte=date_range[1].date()).values()

    filtered_units = Unit.objects.filter(property__in=properties, floor_plan=unit_type.id) if unit_type else \
        Unit.objects.filter(property__in=properties)
    result['expected_move_ins'] = sum([report['expected_move_ins'] for report in reports])
    result['notice_to_vacates'] = sum([report['notice_to_vacates'] for report in reports])
    result['units'] = filtered_units.count()
    result['occupied_units'] = calculate_occupied_units(date_range, filtered_units)
    result['occupancy'] = simple_divider(result['occupied_units'] * 100, result['units'])
    result['ltn'] = simple_divider(result['occupied_units'] +
                                   (result['expected_move_ins'] - result['notice_to_vacates']), result['units'])
    result['units_to_hit_ltn'] = round(LTN * result['units'] + result['notice_to_vacates'] - result['occupied_units'],
                                       1)

    return result


def bedrooms_to_unit_class(bedrooms, is_marketing=True):
    unit_classes = ['STUDIO', 'ONE_BED', 'TWO_BED', 'THREE_BED', 'FOUR_BED'] \
        if is_marketing else ['STUDIO', 'ONE BEDROOM', 'TWO BEDROOM', 'THREE BEDROOM', 'FOUR BEDROOM']
    return unit_classes[bedrooms]


def date_range_to_list(date_range):
    dates = [datetime(year=m // 12, month=m % 12 + 1, day=1).date() for m in
             range(date_range[0].year * 12 + date_range[0].month - 1, date_range[1].year * 12 + date_range[1].month)]
    return dates


def get_marketing_comp_averages(date_range, properties):
    dates = date_range_to_list(date_range)

    mt_rent_sums = Unit.objects.filter(property__in=properties).values('bed_rooms').annotate(
        market_rent_sum=Coalesce(Sum('market_rent'), 0, output_field=models.FloatField()),
        effective_rent_sum=Coalesce(Sum('effective_rent'), 0, output_field=models.FloatField()),
        count=Coalesce(Count('market_rent'), 0, output_field=models.FloatField()))

    for rent in mt_rent_sums:
        rent['unit_class'] = bedrooms_to_unit_class(rent['bed_rooms'])
        del rent['bed_rooms']

    competitors_rent_sums = Competitor.objects.filter(property__in=properties, surveys__date__in=dates).values(
        'surveys__unit_class').annotate(
        unit_class=F('surveys__unit_class'), market_rent_sum=Sum('surveys__market_rent'),
        effective_rent_sum=Coalesce(Sum('surveys__effective_rent'), 0, output_field=models.FloatField()),
        count=Coalesce(Count('surveys__market_rent'), 0, output_field=models.FloatField()))\
        .values('market_rent_sum', 'effective_rent_sum', 'count', 'unit_class')

    rent_sums = list(mt_rent_sums) + list(competitors_rent_sums)

    market_rent_avg = []
    effective_rent_avg = []
    if rent_sums:
        df = pd.DataFrame(rent_sums).groupby('unit_class').agg(
            {'market_rent_sum': 'sum', 'effective_rent_sum': 'sum', 'count': 'sum'})
        df['market_rent_avg'] = round(df['market_rent_sum'] / df['count'], 1)
        df['effective_rent_avg'] = round(df['effective_rent_sum'] / df['count'], 1)

        market_rent_avg = json.loads(df['market_rent_avg'].to_json(orient='table')).get('data', [])
        effective_rent_avg = json.loads(df['effective_rent_avg'].to_json(orient='table')).get('data', [])

    return market_rent_avg, effective_rent_avg


def get_marketing_comp_data(date_range, properties=None):
    """
    This report shows MT property unit prices compared to direct competitors in the area.
    :param date_range:
    :param properties:
    :return:
    """

    # data for tables
    mt_rents = Unit.objects.filter(property__in=properties).values('bed_rooms', 'property', 'property__name').annotate(
        market_rent_low=Coalesce(Min('market_rent'), 0, output_field=models.FloatField()),
        market_rent_high=Coalesce(Max('market_rent'), 0, output_field=models.FloatField()),
        market_rent=Coalesce(Avg('market_rent'), 0, output_field=models.FloatField()),
        effective_rent_low=Coalesce(Min('effective_rent'), 0, output_field=models.FloatField()),
        effective_rent_high=Coalesce(Max('effective_rent'), 0, output_field=models.FloatField()),
        effective_rent=Coalesce(Avg('effective_rent'), 0, output_field=models.FloatField()),
    ).values('property', 'property__name', 'bed_rooms', 'market_rent_low', 'market_rent_high', 'market_rent',
             'effective_rent_low', 'effective_rent_high', 'effective_rent')

    for rent in mt_rents:
        rent['id'] = rent['property']
        del rent['property']

        rent['name'] = rent['property__name']
        del rent['property__name']

        rent['unit_class'] = bedrooms_to_unit_class(rent['bed_rooms'])
        del rent['bed_rooms']

    dates = date_range_to_list(date_range)

    competitor_rents = Competitor.objects.filter(property__in=properties, surveys__date__in=dates).values(
        'id', 'surveys__unit_class', 'name').annotate(
        market_rent_low=Coalesce(Min('surveys__market_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
        market_rent_high=Coalesce(Max('surveys__market_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
        market_rent=Coalesce(Avg('surveys__market_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
        effective_rent_low=Coalesce(Min('surveys__effective_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
        effective_rent_high=Coalesce(Max('surveys__effective_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
        effective_rent=Coalesce(Avg('surveys__effective_rent', filter=Q(surveys__date__in=dates)), 0, output_field=models.FloatField()),
    )

    for rent in competitor_rents:
        rent['unit_class'] = rent['surveys__unit_class']
        del rent['surveys__unit_class']

    market_rent_avg, effective_rent_avg = get_marketing_comp_averages(date_range, properties)

    return dict(mt_rents=mt_rents, competitor_rents=competitor_rents, market_rent_avg=market_rent_avg,
                effective_rent_avg=effective_rent_avg)


def get_tours_data(date_range, properties=None):
    lead_status_filter = (
            Q(lead__status=Lead.LEAD_LOST) & (Q(lead__lost_reason__name='Spam') | Q(lead__lost_reason__name='Test')))

    tasks = Task.objects.exclude(Q(lead__status=Lead.LEAD_TEST) | lead_status_filter)
    in_person_tours = tasks.filter(property__in=properties, tour_date__range=date_range,
                                   type=Task.TYPE_IN_PERSON, is_cancelled=False).values_list('id', flat=True)
    virtual_tours = tasks.filter(property__in=properties, tour_date__range=date_range,
                                 type=Task.TYPE_VIRTUAL_TOUR, is_cancelled=False).values_list('id', flat=True)
    guided_virtual_tours = tasks.filter(property__in=properties, tour_date__range=date_range,
                                        type=Task.TYPE_GUIDED_VIRTUAL_TOUR, is_cancelled=False
                                        ).values_list('id', flat=True)
    facetime_tours = tasks.filter(property__in=properties, tour_date__range=date_range,
                                  type=Task.TYPE_FACETIME, is_cancelled=False).values_list('id', flat=True)

    leases = Lead.objects.filter(property__in=properties, closed_status_date__lte=date_range[1],
                                 closed_status_date__gte=date_range[0], status=Lead.LEAD_CLOSED) \
        .annotate(in_person_tours=Count('tasks', filter=Q(tasks__type=Task.TYPE_IN_PERSON, tasks__is_cancelled=False)),
                  virtual_tours=Count('tasks', filter=Q(tasks__type=Task.TYPE_VIRTUAL_TOUR, tasks__is_cancelled=False)),
                  guided_virtual_tours=Count('tasks', filter=Q(tasks__type=Task.TYPE_GUIDED_VIRTUAL_TOUR,
                                                               tasks__is_cancelled=False)),
                  facetime_tours=Count('tasks', filter=Q(tasks__type=Task.TYPE_FACETIME, tasks__is_cancelled=False)))

    in_person_tours_leases = leases.filter(in_person_tours__gt=0).values_list('id', flat=True)
    virtual_tours_leases = leases.filter(virtual_tours__gt=0).values_list('id', flat=True)
    guided_virtual_tours_leases = leases.filter(guided_virtual_tours__gt=0).values_list('id', flat=True)
    facetime_tours_leases = leases.filter(facetime_tours__gt=0).values_list('id', flat=True)

    return dict(in_person_tours=list(in_person_tours),
                virtual_tours=list(virtual_tours),
                guided_virtual_tours=list(guided_virtual_tours),
                facetime_tours=list(facetime_tours),
                in_person_tours_leases=list(in_person_tours_leases),
                virtual_tours_leases=list(virtual_tours_leases),
                guided_virtual_tours_leases=list(guided_virtual_tours_leases),
                facetime_tours_leases=list(facetime_tours_leases))


def get_chat_data(date_range, properties=None):
    # Total chat conversations
    lead_status_filter = (
            Q(lead__status=Lead.LEAD_LOST) & (Q(lead__lost_reason__name='Spam') | Q(lead__lost_reason__name='Test')))
    guest_card_status_filter = (
            Q(guest_card__status=Lead.LEAD_LOST) &
            (Q(guest_card__lost_reason__name='Spam') | Q(guest_card__lost_reason__name='Test'))
    )
    prospects = ChatProspect.objects.exclude(Q(lead__status=Lead.LEAD_TEST) | lead_status_filter)
    prospects = prospects.exclude(Q(guest_card__status=Lead.LEAD_TEST) | guest_card_status_filter)

    prospect_lead_status_filter = (
            Q(prospect__lead__status=Lead.LEAD_LOST) &
            (Q(prospect__lead__lost_reason__name='Spam') | Q(prospect__lead__lost_reason__name='Test'))
    )
    prospect_guest_card_status = (
            Q(prospect__guest_card__status=Lead.LEAD_LOST) &
            (Q(prospect__guest_card__lost_reason__name='Spam') | Q(prospect__guest_card__lost_reason__name='Test'))
    )
    convos = ChatConversation.objects.exclude(Q(prospect__lead__status=Lead.LEAD_TEST) | prospect_lead_status_filter)
    convos = convos.exclude(Q(prospect__guest_card__status=Lead.LEAD_TEST) | prospect_guest_card_status)

    conversations = convos.filter(
        property__in=properties,
        date__range=date_range,
        type=ChatConversation.TYPE_GREETING
    )

    # Count of chat conversations that have at least one action triggered in single session
    chat_conversations = 0
    # Count of chat conversations transferred to live agent
    agent_chat_conversations = 0
    # Hobbes total questions asked
    hobbes_chat_conversations = 0
    for conversation in conversations:
        next_conversation = conversation.prospect.conversations.filter(
            date__gt=conversation.date, type=ChatConversation.TYPE_GREETING).order_by('date').first()

        additional_args = dict()
        # if we have another more recent session, messages date should be less than this session date
        if next_conversation:
            additional_args = dict(date__lt=next_conversation.date)

        next_message = conversation.prospect.conversations.exclude(type=ChatConversation.TYPE_GREETING) \
            .filter(date__gt=conversation.date, **additional_args).order_by('date').first()
        if next_message:
            chat_conversations += 1

        # messages to agent in current session
        agent_conversations = conversation.prospect.conversations.filter(action=None,
                                                                         type=ChatConversation.TYPE_PROSPECT,
                                                                         to_agent=True,
                                                                         date__gt=conversation.date,
                                                                         **additional_args)
        # questions to bot in current session
        question_actions = conversation.prospect.conversations.filter(
            date__gt=conversation.date, action=ChatConversation.ACTION_QUESTION, **additional_args)
        questions_asked = conversation.prospect.conversations.filter(action=None, to_agent=False,
                                                                     type=ChatConversation.TYPE_PROSPECT,
                                                                     date__gt=conversation.date, **additional_args)
        # at least one message to agent
        if agent_conversations.count():
            agent_chat_conversations += 1

        # at least one "I have a Question" action click and at least one message to bot
        if question_actions.count() and questions_asked.count():
            hobbes_chat_conversations += 1

    # Total count of repeat chat conversation engagements
    repeat_chat_conversations = prospects.filter(property__in=properties).annotate(
        greetings_count=Count('conversations',
                              filter=Q(conversations__type=ChatConversation.TYPE_GREETING,
                                       conversations__date__range=date_range))).filter(
        greetings_count__gte=2).count()

    # Starter prompt actions breakdown
    view_photos_count = convos.filter(property__in=properties, date__range=date_range,
                                      action=ChatConversation.ACTION_VIEW_PHOTOS).count()

    schedule_tour_count = convos.filter(property__in=properties,
                                        date__range=date_range, action=ChatConversation.ACTION_SCHEDULE_TOUR).count()

    reschedule_tour_count = convos.filter(property__in=properties,
                                          date__range=date_range,
                                          action=ChatConversation.ACTION_RESCHEDULE_TOUR).count()

    cancel_tour_count = convos.filter(property__in=properties,
                                      date__range=date_range, action=ChatConversation.ACTION_CANCEL_TOUR).count()

    check_prices_count = convos.filter(property__in=properties, date__range=date_range,
                                       action=ChatConversation.ACTION_CHECK_PRICES).count()

    # Visitor chat engagement
    visitor_chat_engagement = prospects.filter(
        property__in=properties).annotate(
        actions_count=Count('conversations', filter=Q(
            conversations__action__isnull=False, conversations__date__range=date_range))
    ).filter(actions_count__gt=0).count()

    # Tours scheduled
    tours_scheduled = Task.objects.filter(
        property__in=properties, is_created_through_chat=True, created__range=date_range, type__in=[*Task.TOUR_TYPES]
    ).exclude(Q(type=Task.TYPE_TOUR) | Q(lead__status=Lead.LEAD_TEST) | lead_status_filter).count()

    # Guest creation
    guests_created = prospects.filter(property__in=properties,
                                      guest_card__isnull=False, guest_card__created__range=date_range).count()

    # Hobbes questions successfully answered
    hobbes_answered_questions = convos.filter(property__in=properties, date__range=date_range,
                                              question_result=ChatConversation.QUESTION_RESULT_ANSWERED,
                                              type=ChatConversation.TYPE_BOT).count()

    # Count of “I have a question” actions initiated
    question_count = convos.filter(property__in=properties,
                                   date__range=date_range, action=ChatConversation.ACTION_QUESTION).count()

    return dict(chat_conversations=chat_conversations, agent_chat_conversations=agent_chat_conversations,
                repeat_chat_conversations=repeat_chat_conversations, view_photos_count=view_photos_count,
                schedule_tour_count=schedule_tour_count, reschedule_tour_count=reschedule_tour_count,
                cancel_tour_count=cancel_tour_count, check_prices_count=check_prices_count,
                visitor_chat_engagement=visitor_chat_engagement, tours_scheduled=tours_scheduled,
                guests_created=guests_created, hobbes_chat_conversations=hobbes_chat_conversations,
                hobbes_answered_questions=hobbes_answered_questions,
                question_count=question_count)


def get_audition_data(reports, type):
    if type == 'leads':
        lead_ids = [item for sublist in [report.get('leads') for report in reports] for item in sublist]
        leads = list(Lead.objects.filter(id__in=lead_ids)
                     .annotate(owner_name=Concat('owner__first_name', Value(' '), 'owner__last_name'))
                     .values('first_name', 'last_name', 'email', 'source__name', 'acquisition_date',
                             'last_followup_date', 'owner_name', 'id', 'created', 'status', 'is_deleted_by_merging'))
        for lead in leads:
            lead['created'] = '' if not lead['created'] else lead['created'].astimezone(tz=TZ)
            lead['acquisition_date'] = '' if not lead['acquisition_date'] \
                else lead['acquisition_date'].astimezone(tz=TZ)
            lead['last_followup_date'] = '' if not lead['last_followup_date'] \
                else lead['last_followup_date'].astimezone(tz=TZ)

        return leads

    if type == 'tours':
        tour_ids = [item for sublist in [report.get('tours') for report in reports] for item in sublist]
        tours = list(Lead.objects.filter(id__in=tour_ids)
                     .annotate(owner_name=Concat('owner__first_name', Value(' '), 'owner__last_name'))
                     .values('first_name', 'last_name', 'email', 'source__name', 'tour_completed_date', 'owner_name',
                             'id'))

        for lead in tours:
            lead['tour_completed_date'] = '' if not lead['tour_completed_date'] \
                else lead['tour_completed_date'].astimezone(tz=TZ)
            tasks = Task.objects.filter(lead=lead.get('id'), is_cancelled=False,
                                        type__in=[
                                            Task.TYPE_IN_PERSON,
                                            Task.TYPE_VIRTUAL_TOUR,
                                            Task.TYPE_FACETIME,
                                            Task.TYPE_GUIDED_VIRTUAL_TOUR,
                                            Task.TYPE_SELF_GUIDED_TOUR,
                                        ])
            floor_plan_types = []
            tour_types = []
            for task in tasks:
                floor_plan_types += [bedrooms_to_unit_class(int(bedrooms), is_marketing=False).capitalize()
                                     for bedrooms in
                                     task.units.values_list('floor_plan__bedrooms', flat=True).distinct()]
                tour_types += [Task.TOUR_TYPES[task.type]]
            lead['tour_type'] = ', '.join(set(tour_types))
            lead['floor_plan_type'] = ', '.join(set(floor_plan_types))

        return tours

    if type == 'leases':
        lease_ids = [item for sublist in [report.get('leases') for report in reports] for item in sublist]
        leases = list(Lead.objects.filter(id__in=lease_ids)
                      .annotate(owner_name=Concat('owner__first_name', Value(' '), 'owner__last_name'))
                      .values('first_name', 'last_name', 'email', 'source__name', 'acquisition_date',
                              'closed_status_date', 'owner_name', 'id'))
        for lead in leases:
            lead['acquisition_date'] = '' if not lead['acquisition_date'] \
                else lead['acquisition_date'].astimezone(tz=TZ)
            lead['closed_status_date'] = '' if not lead['closed_status_date'] \
                else lead['closed_status_date'].astimezone(tz=TZ)

        return leases

    if type == 'responses':
        response_time_business = [item for sublist in [report.get('lead_response_time_business') for report in reports]
                                  for item in sublist]
        response_time_overall = [item for sublist in
                                 [report.get('lead_response_time_non_business') for report in reports]
                                 for item in sublist]
        lead_ids = [item.get('lead') for item in response_time_business]

        only_non_business_leads = [item for item in response_time_overall if item.get('lead') not in lead_ids]
        only_non_business_lead_ids = [item['lead'] for item in only_non_business_leads]
        leads = list(Lead.objects.filter(id__in=lead_ids + only_non_business_lead_ids)
                     .values('first_name', 'last_name', 'email', 'created', 'acquisition_date',
                             'last_followup_date', 'id'))
        for lead in leads:
            lead['created'] = '' if not lead['created'] else lead['created'].astimezone(tz=TZ)
            lead['acquisition_date'] = '' if not lead.get('acquisition_date') \
                else lead.get('acquisition_date').astimezone(tz=TZ)
            lead['last_followup_date'] = '' if not lead.get('last_followup_date') \
                else lead.get('last_followup_date').astimezone(tz=TZ)

            lead['response_time_business'] = next(
                (time.get('minutes') for time in response_time_business if time.get('lead') == lead.get('id')), 0)
            lead['response_time_overall'] = next(
                (time.get('minutes') for time in response_time_overall if time.get('lead') == lead.get('id')), 0)

            lead['first_followup_date'] = next(
                (time.get('first_followup_date') for time in response_time_overall
                 if time.get('lead') == lead.get('id')), None)
            lead['first_followup_type'] = next((time.get('type') for time in response_time_overall
                                                if time.get('lead') == lead.get('id')), None)

            if not lead['response_time_overall']:
                lead['response_time_overall'] = lead.get('response_time_business')
                lead['first_followup_date'] = next(
                    (time.get('first_followup_date') for time in response_time_business
                     if time.get('lead') == lead.get('id')), None)
                lead['first_followup_type'] = next((time.get('type') for time in response_time_business
                                                    if time.get('lead') == lead.get('id')), None)
            lead['first_followup_date'] = parse(lead['first_followup_date']).astimezone(tz=TZ) \
                if lead['first_followup_date'] else None

        return leads


def get_site_reports_data(reports, type):
    if type == 'site_visitor_data':
        data = [report.get('site_visitor_data') for report in reports]

        return data
    
    if type == 'conversion_data':
        data = [report.get('conversion_data') for report in reports]

        return data
    
    if type == 'source_behavior_data':
        data = [report.get('source_behavior_data') for report in reports]

        return data
    
    if type == 'demographics_data':
        result = {'male': {'all': 0, 'desktop': 0, 'tablet': 0, 'mobile': 0}, 'female': {'all': 0, 'desktop': 0, 'tablet': 0, 'mobile': 0}}

        result['male']['all'] = sum(sum(item['male_18_24'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['male']['all'] += sum(sum(item['male_25_34'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['male']['all'] += sum(sum(item['male_35_44'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['male']['all'] += sum(sum(item['male_45_54'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['male']['all'] += sum(sum(item['male_55_64'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['male']['all'] += sum(sum(item['male_65'] for item in report['demographics_data']) for report in reports if report['demographics_data'])

        result['female']['all'] = sum(sum(item['female_18_24'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['female']['all'] += sum(sum(item['female_25_34'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['female']['all'] += sum(sum(item['female_35_44'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['female']['all'] += sum(sum(item['female_45_54'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['female']['all'] += sum(sum(item['female_55_64'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        result['female']['all'] += sum(sum(item['female_65'] for item in report['demographics_data']) for report in reports if report['demographics_data'])
        
        for device in ['desktop', 'tablet', 'mobile']:
            result['male'][device] = sum(sum(item['male_18_24'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['male'][device] += sum(sum(item['male_25_34'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['male'][device] += sum(sum(item['male_35_44'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['male'][device] += sum(sum(item['male_45_54'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['male'][device] += sum(sum(item['male_55_64'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['male'][device] += sum(sum(item['male_65'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            
            result['female'][device] = sum(sum(item['female_18_24'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['female'][device] += sum(sum(item['female_25_34'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['female'][device] += sum(sum(item['female_35_44'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['female'][device] += sum(sum(item['female_45_54'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['female'][device] += sum(sum(item['female_55_64'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])
            result['female'][device] += sum(sum(item['female_65'] for item in report['demographics_data'] if (item['device_category'] == device)) for report in reports if report['demographics_data'])

        return result
    
    if type == 'devices_data':
        data = [report.get('devices_data') for report in reports]

        return data
    
    if type == 'seo_score_data':
        data = [report.get('seo_score_data') for report in reports]

        return data
    
    if type == 'acquisition_channels_data':
        data = [report.get('acquisition_channels_data') for report in reports]

        return data

