from datetime import time, datetime
from django.db.models import Q, Max, DateField, F, ExpressionWrapper, DurationField
from django.db.models.functions import Greatest, Now, ExtractDay

from backend.api.models import LeadsFilter, LeadsFilterItem


def get_filtered_leads(queryset, filter_items, filter_type, property):
    queryset = queryset.annotate(
        days_move_in=ExtractDay(ExpressionWrapper(F('move_in_date') - Now(), output_field=DurationField())),
        task_date=Max('tasks__due_date', filter=Q(tasks__status='OPEN') & ~Q(tasks__type='TOUR')),
        tour_date=Max('tasks__tour_date__date', filter=Q(tasks__status='OPEN') & Q(tasks__type='TOUR'))).annotate(
        next_task_due_date=Greatest('task_date', 'tour_date', output_field=DateField()))
    query = Q()
    query_operator = Q.AND if filter_type == LeadsFilter.TYPE_ALL else Q.OR
    for item in filter_items:
        if item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS:
            query.add(Q(**{item.get('compare_field'): item.get('compare_value')[0]}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_ON:
            date = datetime.strptime(item.get('compare_value')[0], '%Y-%m-%d')
            day_min = datetime.combine(date, time.min).replace(tzinfo=property.timezone)
            day_max = datetime.combine(date, time.max).replace(tzinfo=property.timezone)
            query.add(Q(**{'{}__range'.format(item.get('compare_field')): (day_min, day_max)}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_NOT:
            query.add(~Q(**{item.get('compare_field'): item.get('compare_value')[0]}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_STARTS_WITH:
            query.add(Q(**{'{}__startswith'.format(item.get('compare_field')): item.get('compare_value')[0]}),
                      query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_ENDS_WITH:
            query.add(Q(**{'{}__endswith'.format(item.get('compare_field')): item.get('compare_value')[0]}),
                      query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_BETWEEN:
            if item.get('compare_field') in ['created', 'updated', 'move_in_date', 'pms_sync_date',
                                             'last_activity_date', 'next_task_due_date']:
                start_date = datetime.strptime(item.get('compare_value')[0], '%Y-%m-%d').replace(
                    tzinfo=property.timezone)
                end_date = datetime.combine(datetime.strptime(item.get('compare_value')[1], '%Y-%m-%d'),
                                            time.max).replace(tzinfo=property.timezone)
                query.add(Q(**{'{}__range'.format(item.get('compare_field')): (start_date, end_date)}),
                          query_operator)
            else:
                query.add((Q(**{'{}__gte'.format(item.get('compare_field')): item.get('compare_value')[0]}) &
                           Q(**{'{}__lte'.format(item.get('compare_field')): item.get('compare_value')[1]})),
                          query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_LESS_THAN:
            query.add(Q(**{'{}__lt'.format(item.get('compare_field')): item.get('compare_value')[0]}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_GREATER_THAN:
            query.add(Q(**{'{}__gt'.format(item.get('compare_field')): item.get('compare_value')[0]}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_ON_OR_BEFORE:
            date = datetime.strptime(item.get('compare_value')[0], '%Y-%m-%d').replace(
                tzinfo=property.timezone)
            query.add(Q(**{'{}__lte'.format(item.get('compare_field')): date}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_ON_OR_AFTER:
            date = datetime.strptime(item.get('compare_value')[0], '%Y-%m-%d').replace(
                tzinfo=property.timezone)
            query.add(Q(**{'{}__gte'.format(item.get('compare_field')): date}), query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_ONE_OF:
            result_query = Q()
            for value in item.get('compare_value'):
                result_query |= Q(**{item.get('compare_field'): value})
            query.add(result_query, query_operator)
        elif item.get('compare_operator') == LeadsFilterItem.OPERATOR_IS_NOT_SET:
            query.add(Q(**{'{}__isnull'.format(item.get('compare_field')): True}), query_operator)
    return queryset.filter(query)
