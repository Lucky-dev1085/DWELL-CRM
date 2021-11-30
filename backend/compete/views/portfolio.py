from rest_framework.viewsets import GenericViewSet, ViewSet
from rest_framework import mixins
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from django.db.models import Q, F, When, Case, FloatField
from django.db.models.expressions import Window
from django.db.models.functions import Rank
from backend.compete.models import Market, Submarket, Property, UnitType
from backend.compete.serializer import MarketSerializer, SubMarketSerializer, MarketNameSerializer,\
    SubMarketNameSerializer, PropertyNameSerializer, UnitTypeSerializer, SubMarketBreakdownSerializer
from .mixin import SortableListModelMixin


class MarketView(mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = MarketSerializer
    queryset = Market.objects.all()


class SubmarketBreakdownView(SortableListModelMixin, GenericViewSet):
    serializer_class = SubMarketBreakdownSerializer
    manual_ordering_fields = ['units_count', 'avg_unit_size', 'min_unit_size', 'avg_rent', 'min_rent', 'avg_occupancy']

    def get_queryset(self):
        if self.basename == 'mtr_group_submarkets':
            submarket = get_object_or_404(Submarket.objects.all(), pk=self.kwargs.get('mtr_group_submarket_pk'))
            return submarket.mtr_submarkets.all()
        if self.basename == 'overall_mtr_group_submarkets':
            market = get_object_or_404(Market.objects.all(), pk=self.kwargs.get('market_pk'))
            return market.submarkets.filter(is_mtr_group=True)
        return Submarket.objects.filter(market=self.kwargs.get('market_pk'), is_mtr_group=False)


class SubMarketView(mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = SubMarketSerializer
    queryset = Submarket.objects.all()


class ExploreMarketView(ViewSet):
    def list(self, request):
        keyword = request.GET.get('keyword', '').strip()
        markets = MarketNameSerializer(Market.objects.filter(name__icontains=keyword), many=True).data
        submarkets = SubMarketNameSerializer(Submarket.objects.filter(name__icontains=keyword), many=True).data
        properties = PropertyNameSerializer(Property.objects.filter(name__icontains=keyword), many=True).data

        return Response(dict(markets=markets, submarkets=submarkets, properties=properties))


class RentCompView(SortableListModelMixin, GenericViewSet):
    serializer_class = UnitTypeSerializer
    model_ordering_fields = dict(
        property='property.name',
        submarket='property.submarket.name'
    )
    manual_ordering_fields = ['available_units_count', 'min_size', 'min_rent', 'rank', 'distribution', 'ltn_occupancy',
                              'average_rent_sqft']

    def get_queryset(self):
        properties = []
        unit_type_filter = Q()
        unit_type = self.request.GET.get('unit_type')
        if unit_type:
            unit_type_filter = Q(name=unit_type)

        if self.kwargs.get('market_pk'):
            market = get_object_or_404(Market.objects.all(), pk=self.kwargs.get('market_pk'))
            properties = market.get_properties()
        if self.kwargs.get('sub_market_pk'):
            submarket = get_object_or_404(Submarket.objects.all(), pk=self.kwargs.get('sub_market_pk'))
            properties = submarket.get_properties()

        unit_types = UnitType.objects.filter(Q(property__in=properties) & unit_type_filter)\
            .exclude(Q(units_count=None) | Q(units_count=0))
        unit_types = unit_types.annotate(
            formatted_average_rent=Case(
                When(average_rent=None, then=0.0), default=F('average_rent'), output_field=FloatField()
            )
        )
        return unit_types.annotate(rank=Window(
                expression=Rank(),
                order_by=F('formatted_average_rent').desc()
            ))
