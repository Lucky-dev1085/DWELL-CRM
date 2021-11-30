from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.generics import get_object_or_404

from backend.compete.models import UnitSession, Property
from backend.compete.serializer import UnitSerializer, UnitSessionDetailSerializer
from .mixin import SortableListModelMixin


class UnitView(SortableListModelMixin, GenericViewSet):
    serializer_class = UnitSerializer
    manual_ordering_fields = ['avg_rent_per_sqft']
    model_ordering_fields = dict(
        unit_type='unit_type.beds'
    )

    def get_queryset(self):
        unit_type = self.request.GET.get('unit_type')
        queryset = None
        if self.kwargs.get('property_pk'):
            is_on_market = self.request.GET.get('on_market', 'true') == 'true'

            property = get_object_or_404(Property.objects.all(), pk=self.kwargs.get('property_pk'))
            queryset = property.units.filter(on_market=is_on_market)

        if queryset and unit_type:
            queryset = queryset.filter(unit_type__name=unit_type)
        return queryset


class UnitSessionView(RetrieveModelMixin, GenericViewSet):
    serializer_class = UnitSessionDetailSerializer
    queryset = UnitSession.objects.all()
