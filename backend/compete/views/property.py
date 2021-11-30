from rest_framework.viewsets import GenericViewSet
from rest_framework.generics import get_object_or_404
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins

from backend.compete.models import Property, Submarket, Alert
from backend.compete.serializer import PropertySerializer, CompetitorPropertySerializer, PropertyBreakdownSerializer, \
    MarketEnvironmentSerializer, CompetitorSetSerializer, AlertSubscriptionSerializer, PropertyListSerializer
from backend.api.views.pagination import CustomResultsSetPagination
from .mixin import SortableListModelMixin


class PropertyView(mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = PropertySerializer
    queryset = Property.objects.all()

    @action(methods=['POST'], detail=True)
    def add_market_environment(self, request, **kwargs):
        serializer = MarketEnvironmentSerializer(instance=self.get_object(), data=self.request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(dict(success=True), status=200)

    @action(methods=['GET'], detail=True)
    def alert_subscriptions(self, request, **kwargs):
        alert_ids = []
        for alert in Alert.objects.filter(user=self.request.user):
            if self.get_object() in alert.overall_properties:
                alert_ids.append(alert.pk)
        response = AlertSubscriptionSerializer(
            Alert.objects.filter(id__in=alert_ids).order_by('-created'), many=True,
            context=dict(property=self.get_object())
        ).data
        return Response(response, status=200)


class PropertyListView(mixins.ListModelMixin, GenericViewSet):
    serializer_class = PropertyListSerializer
    queryset = Property.objects.all()
    pagination_class = CustomResultsSetPagination


class PropertyBreakdownView(SortableListModelMixin, GenericViewSet):
    model_ordering_fields = dict(
        submarket='submarket.name'
    )
    manual_ordering_fields = ['min_unit_size', 'min_rent', 'avg_unit_size', 'avg_rent']

    def get_serializer_class(self):
        return CompetitorPropertySerializer if self.kwargs.get('property_pk') else PropertyBreakdownSerializer

    def get_queryset(self):
        if self.kwargs.get('property_pk'):
            property = get_object_or_404(Property.objects.all(), pk=self.kwargs.get('property_pk'))
            return property.competitors.all().order_by('name')
        if self.kwargs.get('sub_market_pk'):
            submarket = get_object_or_404(Submarket.objects.all(), pk=self.kwargs.get('sub_market_pk'))
            return submarket.get_properties().order_by('name')
        return None


class CompetitorSetView(mixins.ListModelMixin, GenericViewSet):
    queryset = Property.objects.exclude(competitors=None)
    serializer_class = CompetitorSetSerializer
