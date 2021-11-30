from django.db.models import Avg, Sum

from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from backend.compete.serializer import ComparisonSerializer, OccupancyRankingSerializer, \
    AverageRentRankingSerializer
from backend.compete.models import Comparison, Property, Submarket, Unit, UnitType
from backend.compete.views.mixin import SortableListModelMixin


class ComparisonView(ListModelMixin, CreateModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = ComparisonSerializer

    def get_queryset(self):
        return self.request.user.comparisons.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def get_assets(instance):
    is_property_mode = True
    properties = []
    submarkets = []

    if instance.subject_asset_type == Comparison.SUB_MARKET and instance.compared_asset_type == Comparison.MARKET:
        sub_market_ids = [instance.subject_sub_market.id] + list(
            instance.market.submarkets.values_list('id', flat=True))
        submarkets = Submarket.objects.filter(pk__in=sub_market_ids)
        is_property_mode = False
    else:
        property_ids = []
        if instance.subject_asset_type == Comparison.PROPERTY:
            property_ids += [instance.subject_property.id]
        if instance.subject_asset_type == Comparison.SUB_MARKET:
            property_ids += list(instance.subject_sub_market.get_properties().values_list('id', flat=True))

        if instance.compared_asset_type == Comparison.PROPERTY:
            property_ids += [instance.compared_property.id]
        if instance.compared_asset_type == Comparison.SUB_MARKET:
            property_ids += list(instance.compared_sub_market.get_properties().values_list('id', flat=True))
        if instance.compared_asset_type == Comparison.MARKET:
            property_ids += list(instance.market.get_properties().values_list('id', flat=True))

        properties = Property.objects.filter(pk__in=property_ids)

    return is_property_mode, properties if is_property_mode else submarkets


class CustomPagination(PageNumberPagination):
    page_size = 20

    def get_paginated_response(self, data):
        subject = next((item for item in self.page.paginator.object_list if item['is_subject']), None)
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'results': data,
            'subject_type': subject['subject_type'],
            'subject_name': subject['name'],
            'subject_rank': subject['rank']
        })


class HighestAverageRentsView(SortableListModelMixin, GenericViewSet):
    manual_ordering_fields = ['name', 'rank', 'average_rent', 'average_rent_per_sqft', 'units_count']
    serializer_class = AverageRentRankingSerializer
    pagination_class = CustomPagination

    def get_paginated_response(self, page):
        return super(HighestAverageRentsView, self).get_paginated_response(page)

    def get_queryset(self):
        comparison = get_object_or_404(Comparison.objects.all(), pk=self.kwargs.get('comparison_pk'))

        is_property_mode, assets = get_assets(comparison)
        unit_type_name = self.request.query_params.get('unit_type', 'COMBINED')
        queryset = []

        if is_property_mode:
            for property in assets:
                units = property.units.filter(on_market=True)
                if unit_type_name == 'COMBINED':
                    units_count = UnitType.objects.filter(property=property) \
                        .aggregate(units_count_sum=Sum('units_count')).get('units_count_sum')
                else:
                    unit_type = property.unit_types.filter(name=unit_type_name).first()
                    units_count = unit_type.units_count
                    units = units.filter(unit_type=unit_type)
                average_rent = units.aggregate(average_rent=Avg('rent')).get('average_rent')
                average_sqft = units.aggregate(average_sqft=Avg('unit_size')).get('average_sqft')
                if average_rent and average_sqft:
                    average_rent_per_sqft = round(average_rent / average_sqft, 2)
                else:
                    average_rent_per_sqft = None

                is_subject = property in [comparison.subject_property, comparison.compared_property]
                queryset.append(dict(
                    average_rent=average_rent or 0, average_rent_per_sqft=average_rent_per_sqft,
                    units_count=units_count, name=property.name, id=property.pk, is_subject=is_subject,
                    subject_type='PROPERTY'
                ))

        else:
            for submarket in assets:
                units = Unit.objects.filter(property__in=submarket.get_properties(), on_market=True)
                if unit_type_name == 'COMBINED':
                    units_count = UnitType.objects.filter(property__in=submarket.get_properties()) \
                        .aggregate(units_count_sum=Sum('units_count')).get('units_count_sum')
                else:
                    units_count = UnitType.objects.filter(property__in=submarket.get_properties(), name=unit_type_name) \
                        .aggregate(units_count_sum=Sum('units_count')).get('units_count_sum')
                    units = units.filter(unit_type__name=unit_type_name)
                average_rent = units.aggregate(average_rent=Avg('rent')).get('average_rent')
                average_sqft = units.aggregate(average_sqft=Avg('unit_size')).get('average_sqft')
                if average_rent and average_sqft:
                    average_rent_per_sqft = round(average_rent / average_sqft, 2)
                else:
                    average_rent_per_sqft = None

                is_subject = submarket == comparison.subject_sub_market
                queryset.append(dict(
                    average_rent=average_rent or 0, average_rent_per_sqft=average_rent_per_sqft,
                    units_count=units_count, name=submarket.name, id=submarket.pk, is_subject=is_subject,
                    subject_type='SUBMARKET'
                ))

        queryset = sorted(
            queryset,
            key=lambda t: (t['average_rent'] is None, True, t['average_rent']),
            reverse=True
        )
        for index, item in enumerate(queryset):
            item['rank'] = index + 1

        return queryset


class HighestOccupancyRatesView(SortableListModelMixin, GenericViewSet):
    manual_ordering_fields = ['name', 'rank', 'occupancy', 'units_count']
    pagination_class = CustomPagination
    serializer_class = OccupancyRankingSerializer

    def get_queryset(self):
        comparison = get_object_or_404(Comparison.objects.all(), pk=self.kwargs.get('comparison_pk'))

        is_property_mode, assets = get_assets(comparison)

        queryset = []
        if is_property_mode:
            for property in assets:
                is_subject = property in [comparison.subject_property, comparison.compared_property]
                queryset.append(dict(
                    occupancy=property.occupancy or 0, units_count=property.units_count, name=property.name,
                    id=property.pk, is_subject=is_subject, subject_type='PROPERTY'
                ))
        else:
            for submarket in assets:
                is_subject = submarket == comparison.subject_sub_market
                occupancy = submarket.get_properties().aggregate(avg_occupancy=Avg('occupancy')).get('avg_occupancy')
                queryset.append(dict(
                    occupancy=occupancy or 0, units_count=submarket.units_count, name=submarket.name,
                    id=submarket.pk, is_subject=is_subject, subject_type='SUBMARKET'
                ))

        queryset = sorted(
            queryset,
            key=lambda t: (t['occupancy'] is None, True, t['occupancy']),
            reverse=True
        )
        for index, item in enumerate(queryset):
            item['rank'] = index + 1

        return queryset
