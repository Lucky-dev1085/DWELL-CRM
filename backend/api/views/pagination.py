from datetime import timedelta
from django.utils import timezone

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomResultsSetPagination(PageNumberPagination):
    show_all = None
    count = 0

    def paginate_queryset(self, queryset, request, view=None):
        self.count = self.get_count(queryset)
        self.show_all = request.query_params.get('show_all', None)
        if self.show_all and self.show_all.lower() == 'true':
            return list(queryset)

        return super().paginate_queryset(queryset, request, view)

    def get_page_size(self, request):
        return int(request.query_params.get('limit', '20'))

    def get_paginated_response(self, data):
        next, previous = (None, None) if self.show_all and self.show_all.lower() == 'true' \
            else (self.get_next_link(), self.get_previous_link())
        return Response({
            'next': next,
            'previous': previous,
            'count': self.count,
            'results': data
        })

    def get_count(self, queryset):
        try:
            return queryset.count()
        except (AttributeError, TypeError):
            return len(queryset)


class LeadsPagination(CustomResultsSetPagination):
    count = 0
    all_leads_count = 0
    active_leads_count = 0
    my_leads_count = 0

    def paginate_queryset(self, queryset, request, view=None):
        self.count = self.get_count(queryset)

        audit_queryset = request.property.leads.filter(acquisition_date__gte=timezone.now() - timedelta(days=120))
        self.all_leads_count = audit_queryset.count()
        self.active_leads_count = audit_queryset.filter(status='ACTIVE').count()
        self.my_leads_count = audit_queryset.filter(owner=request.user, status='ACTIVE').count()

        self.show_all = request.query_params.get('show_all', None)
        if self.show_all and self.show_all.lower() == 'true':
            return list(queryset)

        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        next, previous = (None, None) if self.show_all and self.show_all.lower() == 'true' \
            else (self.get_next_link(), self.get_previous_link())
        return Response({
            'next': next,
            'previous': previous,
            'count': self.count,
            'results': data,
            'all_leads_count': self.all_leads_count,
            'active_leads_count': self.active_leads_count,
            'my_leads_count': self.my_leads_count,
        })

    def get_count(self, queryset):
        try:
            return queryset.count()
        except (AttributeError, TypeError):
            return len(queryset)
