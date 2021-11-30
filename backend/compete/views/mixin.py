import functools

from django.db.models import QuerySet
from rest_framework.response import Response


class SortableListModelMixin:
    """
    List a queryset.
    """

    def sort_queryset(self, queryset, field, order):
        def rgetattr(obj, attr, *args):
            def _getattr(obj, attr):
                return getattr(obj, attr, *args)

            return functools.reduce(_getattr, [obj] + attr.split('.'))

        field_name = getattr(self, 'model_ordering_fields', {}).get(field) or field

        def format_sorting_value(row):
            value = rgetattr(row, field_name)
            return value.lower() if type(value) == str else value

        query_args = {}
        query_args[field_name.replace('.', '__')] = None
        sorted_queryset = sorted(
            queryset.exclude(**query_args), key=lambda t: format_sorting_value(t), reverse=order == 'desc'
        )
        return list(sorted_queryset) + list(queryset.filter(**query_args))

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        field = self.request.query_params.get('field')
        order = self.request.query_params.get('order')

        manual_sort_required = field in getattr(self, 'manual_ordering_fields', [])

        if manual_sort_required:
            parsed_records = self.get_serializer(queryset, many=True).data

            def format_sorting_value(row):
                value = row[field]
                if type(value) == str:
                    return value.lower()
                elif type(value) in [list, QuerySet]:
                    return ', '.join(value)
                else:
                    return value

            sorted_records = sorted(
                parsed_records, key=lambda t: (t[field] is None, t[field] == '', format_sorting_value(t)),
                reverse=order == 'desc'
            )
            page = self.paginate_queryset(sorted_records)
            if page is not None:
                return self.get_paginated_response(page)
            return Response(sorted_records)

        else:
            if order and field:
                queryset = self.sort_queryset(queryset, field, order)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
