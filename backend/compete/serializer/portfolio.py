from django.db.models import Min, Max, Avg, Sum, Q
from rest_framework import serializers
from backend.compete.models import Market, Submarket, UnitType, Property, Unit
from .unit import UnitTypeOverviewSerializer


class MarketSerializer(serializers.ModelSerializer):
    unit_types = serializers.SerializerMethodField()
    properties_count = serializers.IntegerField()
    units_count = serializers.IntegerField()
    available_units_count = serializers.IntegerField()
    avg_rent = serializers.FloatField()
    properties_offering_concession = serializers.SerializerMethodField()
    avg_concession = serializers.SerializerMethodField()
    min_concession = serializers.SerializerMethodField()
    max_concession = serializers.SerializerMethodField()
    ltn_occupancy = serializers.SerializerMethodField()

    class Meta:
        model = Market
        fields = '__all__'

    def get_unit_types(self, instance):
        properties = instance.get_properties()
        unit_types = UnitType.objects.filter(property__in=properties)\
            .exclude(Q(units_count=0) | Q(units_count=None)).values('name').distinct()
        return UnitTypeOverviewSerializer(
            unit_types, many=True,
            context={'properties': properties}
        ).data

    def get_properties_offering_concession(self, instance):
        return instance.get_properties().exclude(concession_amount=None).count()

    def get_avg_concession(self, instance):
        return instance.get_properties().aggregate(Avg('concession_amount')).get('concession_amount__avg')

    def get_min_concession(self, instance):
        return instance.get_properties().aggregate(Min('concession_amount')).get('concession_amount__min')

    def get_max_concession(self, instance):
        return instance.get_properties().aggregate(Max('concession_amount')).get('concession_amount__max')

    def get_ltn_occupancy(self, instance):
        properties = instance.get_properties()
        total_units_count = properties.aggregate(Sum('units_count')).get('units_count__sum')
        total_completed_units_count = (
            properties.filter(is_lease_up=True).aggregate(Sum('completed_units_count'))
            .get('completed_units_count__sum') or 0
        ) + (
            properties.filter(is_lease_up=False).aggregate(Sum('units_count')).get('units_count__sum') or 0
        )
        available_units_count = Unit.objects.filter(property__in=properties, on_market=True).count()
        if total_units_count and total_completed_units_count and available_units_count:
            return round((total_completed_units_count - available_units_count) * 100 / total_units_count, 2)
        return None


class SubMarketSerializer(MarketSerializer):
    submarkets_count = serializers.SerializerMethodField()
    is_mtr_group = serializers.SerializerMethodField()

    def get_unit_types(self, instance):
        properties = instance.get_properties()
        unit_types = UnitType.objects.filter(property__in=properties).exclude(beds=None).exclude(units_count=0) \
            .values('name').distinct()
        return UnitTypeOverviewSerializer(
            unit_types, many=True,
            context={'properties': properties}
        ).data

    def get_submarkets_count(self, instance):
        return instance.mtr_submarkets.count()

    def get_is_mtr_group(self, instance):
        return instance.is_mtr_group

class MarketNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = ['id', 'name']


class SubMarketNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submarket
        fields = ['id', 'name']


class PropertyNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'name', 'external_id']


class SubMarketBreakdownSerializer(serializers.ModelSerializer):
    units_count = serializers.SerializerMethodField()
    min_unit_size = serializers.SerializerMethodField()
    max_unit_size = serializers.SerializerMethodField()
    min_rent = serializers.SerializerMethodField()
    max_rent = serializers.SerializerMethodField()
    avg_unit_size = serializers.SerializerMethodField()
    avg_rent = serializers.SerializerMethodField()
    avg_occupancy = serializers.SerializerMethodField()

    class Meta:
        model = Submarket
        fields = ['id', 'name', 'units_count', 'min_unit_size', 'max_unit_size', 'avg_unit_size', 'avg_rent',
                  'min_rent', 'max_rent', 'avg_occupancy']

    def get_units_count(self, instance):
        return instance.get_properties().aggregate(Sum('units_count')).get('units_count__sum')

    def get_min_unit_size(self, instance):
        return Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(Min('unit_size')).get('unit_size__min')

    def get_max_unit_size(self, instance):
        return Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(Max('unit_size')).get('unit_size__max')

    def get_min_rent(self, instance):
        return Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(Min('rent')).get('rent__min')

    def get_max_rent(self, instance):
        return Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(Max('rent')).get('rent__max')

    def get_avg_unit_size(self, instance):
        value = Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(average_sqft=Avg('unit_size')).get('average_sqft')
        return round(value, 2) if type(value) is float else None

    def get_avg_rent(self, instance):
        value = Unit.objects.filter(
            property__in=instance.get_properties(), on_market=True
        ).aggregate(average_rent=Avg('rent')).get('average_rent')
        return round(value, 2) if type(value) is float else None

    def get_avg_occupancy(self, instance):
        units_count = instance.get_properties().aggregate(Sum('units_count')).get('units_count__sum')
        available_units_count = Unit.objects.filter(property__in=instance.get_properties(), on_market=True).count()
        return round((units_count - available_units_count) / units_count * 100, 2)\
            if units_count and available_units_count else None
