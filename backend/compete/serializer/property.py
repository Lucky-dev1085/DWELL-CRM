from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db.models import Min, Max, Avg, Q
from backend.compete.models import Property, Market, Submarket
from .unit import UnitTypeSerializer


class PropertySerializer(serializers.ModelSerializer):
    unit_types = serializers.SerializerMethodField()
    concession_avg_rent_percent = serializers.FloatField()
    submarket = serializers.CharField(source='submarket.name')
    market = serializers.CharField(source='submarket.market.name')
    type = serializers.SerializerMethodField()

    class Meta:
        model = Property
        exclude = ['created', 'updated', 'property']

    def get_unit_types(self, instance):
        return UnitTypeSerializer(instance.unit_types.exclude(Q(units_count=0) | Q(units_count=None)), many=True).data

    def get_type(self, instance):
        return instance.get_type_display()


class PropertyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'name']


class PropertyBreakdownBaseSerializer(serializers.ModelSerializer):
    min_unit_size = serializers.SerializerMethodField()
    max_unit_size = serializers.SerializerMethodField()
    min_rent = serializers.SerializerMethodField()
    max_rent = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['name', 'external_id', 'submarket', 'units_count', 'min_unit_size', 'max_unit_size', 'min_rent',
                  'max_rent', 'occupancy', 'is_lease_up']

    def get_min_unit_size(self, instance):
        return instance.units.all().aggregate(Min('unit_size')).get('unit_size__min')

    def get_max_unit_size(self, instance):
        return instance.units.all().aggregate(Max('unit_size')).get('unit_size__max')

    def get_min_rent(self, instance):
        return instance.units.all().aggregate(Min('rent')).get('rent__min')

    def get_max_rent(self, instance):
        return instance.units.all().aggregate(Max('rent')).get('rent__max')


class CompetitorPropertySerializer(PropertyBreakdownBaseSerializer):
    submarket = serializers.CharField(source='submarket.name')

    class Meta:
        model = Property
        fields = PropertyBreakdownBaseSerializer.Meta.fields + ['submarket', 'id']


class CompetitorSetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Property
        fields = ['id', 'name']


class PropertyBreakdownSerializer(PropertyBreakdownBaseSerializer):
    avg_unit_size = serializers.SerializerMethodField()
    avg_rent = serializers.FloatField(source='average_rent')
    avg_rent_per_sqft = serializers.FloatField(source='average_rent_per_sqft')

    class Meta:
        model = Property
        fields = PropertyBreakdownBaseSerializer.Meta.fields + \
                 ['submarket', 'avg_unit_size', 'avg_rent', 'avg_rent_per_sqft', 'id']

    def get_avg_unit_size(self, instance):
        value = instance.units.all().aggregate(average_sqft=Avg('unit_size')).get('average_sqft')
        return round(value, 2) if type(value) is float else None

    def get_max_rent(self, instance):
        return instance.units.all().aggregate(Max('rent')).get('rent__max')


class MarketEnvironmentSerializer(serializers.ModelSerializer):
    market = serializers.PrimaryKeyRelatedField(queryset=Market.objects.all())
    submarket = serializers.PrimaryKeyRelatedField(queryset=Submarket.objects.all())
    competitors = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), many=True)

    def validate_sub_market(self, value):
        if value.market.pk != int(self.initial_data.get('market')):
            raise ValidationError(dict(submarket='The given sub market is not belongs to given market.'))
        return value

    def save(self, **kwargs):
        self.validated_data.pop('market')
        return super(MarketEnvironmentSerializer, self).save(**kwargs)

    class Meta:
        model = Property
        fields = ['market', 'submarket', 'competitors']


class AverageRentRankingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    rank = serializers.IntegerField()
    average_rent = serializers.SerializerMethodField()
    average_rent_per_sqft = serializers.FloatField()
    units_count = serializers.IntegerField()
    is_subject = serializers.BooleanField()
    subject_type = serializers.CharField()

    def get_average_rent(self, obj):
        if obj['average_rent'] == 0:
            return None
        return obj['average_rent']


class OccupancyRankingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    rank = serializers.IntegerField()
    occupancy = serializers.SerializerMethodField()
    units_count = serializers.IntegerField()
    is_subject = serializers.BooleanField()
    subject_type = serializers.CharField()

    def get_occupancy(self, obj):
        if obj['occupancy'] == 0:
            return None
        return obj['occupancy']
