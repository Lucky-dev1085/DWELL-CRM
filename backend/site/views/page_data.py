from backend.api.permissions import DwellAuthorized, PublicPageDataAccessAuthorized
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet
from rest_framework import mixins
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from backend.site.models import PageData
from backend.site.serializer import PageDataSerializer, PageDataSectionBaseSerializer, HobbesPromotionSerializer


def get_median_time(hours):
    return sorted(hours)[len(hours) // 2]


class PublicPageDataView(ReadOnlyModelViewSet):
    serializer_class = PageDataSerializer
    permission_classes = [PublicPageDataAccessAuthorized]
    queryset = PageData.objects.all()

    def get_queryset(self):
        return self.request.property.page_data.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        promotion = self.request.property.promotion.filter(is_active=True).first()
        if promotion:
            promotion = HobbesPromotionSerializer(promotion).data
        results = serializer.data

        business_hours = {}
        start_hours = []
        close_hours = []
        for business_hour in self.request.property.business_hours.all():
            if business_hour.is_workday:
                time = f"{business_hour.start_time.strftime('%-I:%M %p')} - " \
                       f"{business_hour.end_time.strftime('%-I:%M %p')}"

                if business_hour.weekday not in [5, 6]:
                    start_hours.append(business_hour.start_time)
                    close_hours.append(business_hour.end_time)
            else:
                time = 'Closed'

            if business_hour.weekday == 5:
                business_hours['saturday'] = time
            if business_hour.weekday == 6:
                business_hours['sunday'] = time

        if len(start_hours):
            time = f"{get_median_time(start_hours).strftime('%-I:%M %p')} - " \
                   f"{get_median_time(close_hours).strftime('%-I:%M %p')}"
            business_hours['general'] = time
        else:
            business_hours['general'] = 'Closed'

        for result in results:
            if result['section'] == 'CONTACT':
                result['values']['business_hours'] = business_hours

        results.append({'section': 'PROMOTION', 'values': promotion})
        return Response(dict(data=results, status=self.request.property.status))


class PageDataView(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = PageDataSectionBaseSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        return self.request.property.page_data.all()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), section__iexact=self.kwargs['pk'])
