import pytz

from rest_framework import serializers
from django.db.models import Min, Max, Sum
from django.utils import timezone
from backend.compete.models import Unit, UnitType, UnitSession, History

TZ = pytz.timezone('America/Phoenix')


class UnitTypeOverviewSerializer(serializers.Serializer):
    unit_type = serializers.CharField(source='name')
    beds = serializers.SerializerMethodField()
    min_baths = serializers.SerializerMethodField()
    max_baths = serializers.SerializerMethodField()
    units_count = serializers.SerializerMethodField()
    distribution = serializers.SerializerMethodField()
    ltn_occupancy = serializers.SerializerMethodField()
    available_units_count = serializers.SerializerMethodField()
    avg_size = serializers.SerializerMethodField()
    min_size = serializers.SerializerMethodField()
    max_size = serializers.SerializerMethodField()
    avg_rent = serializers.SerializerMethodField()
    min_rent = serializers.SerializerMethodField()
    max_rent = serializers.SerializerMethodField()

    def get_units(self, obj=None):
        properties = self.context.get('properties')
        return Unit.objects.filter(property__in=properties, unit_type__name=obj.get('name'), on_market=True)

    def get_unit_type(self, obj=None):
        return obj.get('name')

    def get_units_count(self, obj):
        return UnitType.objects.filter(
            property__in=self.context.get('properties'), name=obj.get('name')
        ).aggregate(Sum('units_count')).get('units_count__sum')

    def get_available_units_count(self, obj):
        return self.get_units(obj).count()

    def get_distribution(self, obj):
        properties = self.context.get('properties')
        units_count_by_type = self.get_units_count(obj)
        total_count = properties.aggregate(Sum('units_count')).get('units_count__sum')
        if total_count and units_count_by_type:
            return round(units_count_by_type / total_count * 100, 2)
        return None

    def get_ltn_occupancy(self, obj):
        available_units_count = self.get_available_units_count(obj)
        units_count = self.get_units_count(obj)
        if units_count and available_units_count:
            return round((units_count - available_units_count) / units_count * 100, 2)
        return None

    def get_avg_size(self, obj):
        unit_size_sum = self.get_units(obj).aggregate(Sum('unit_size')).get('unit_size__sum')
        units_count = self.get_units(obj).count()
        return round(unit_size_sum / units_count, 2) if unit_size_sum and units_count else None

    def get_min_size(self, obj):
        return self.get_units(obj).aggregate(Min('unit_size')).get('unit_size__min')

    def get_max_size(self, obj):
        return self.get_units(obj).aggregate(Max('unit_size')).get('unit_size__max')

    def get_avg_rent(self, obj):
        rent_sum = self.get_units(obj).aggregate(Sum('rent')).get('rent__sum')
        units_count = self.get_units(obj).count()
        return round(rent_sum / units_count, 2) if rent_sum and units_count else None

    def get_min_rent(self, obj):
        return self.get_units(obj).aggregate(Min('rent')).get('rent__min')

    def get_max_rent(self, obj):
        return self.get_units(obj).aggregate(Max('rent')).get('rent__max')

    def get_beds(self, obj):
        return self.get_units(obj).aggregate(Max('beds')).get('beds__max')

    def get_min_baths(self, obj):
        return self.get_units(obj).aggregate(Min('baths')).get('baths__min')

    def get_max_baths(self, obj):
        return self.get_units(obj).aggregate(Max('baths')).get('baths__max')


class UnitTypeSerializer(serializers.ModelSerializer):
    available_units_count = serializers.SerializerMethodField()
    min_size = serializers.SerializerMethodField()
    max_size = serializers.SerializerMethodField()
    min_rent = serializers.SerializerMethodField()
    max_rent = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    distribution = serializers.SerializerMethodField()
    ltn_occupancy = serializers.SerializerMethodField()
    average_rent_sqft = serializers.SerializerMethodField()
    property = serializers.CharField(source='property.name')
    submarket = serializers.CharField(source='property.submarket.name')

    def get_available_units_count(self, instance):
        return instance.market_units.count()

    def get_min_size(self, instance):
        return instance.market_units.aggregate(Min('unit_size')).get('unit_size__min')

    def get_max_size(self, instance):
        return instance.market_units.aggregate(Max('unit_size')).get('unit_size__max')

    def get_min_rent(self, instance):
        return instance.market_units.aggregate(Min('rent')).get('rent__min')

    def get_max_rent(self, instance):
        return instance.market_units.aggregate(Max('rent')).get('rent__max')

    def get_rank(self, instance):
        return getattr(instance, 'rank', None)

    def get_distribution(self, instance):
        if instance.units_count and instance.property.units_count:
            total_units_count = instance.property.completed_units_count \
                if instance.property.is_lease_up else instance.property.units_count
            if instance.units_count and total_units_count:
                return round(instance.units_count / total_units_count * 100, 2)
        return None

    def get_ltn_occupancy(self, instance):
        property = instance.property
        available_units_count = instance.market_units.count()
        units_count = instance.units_count
        total_units = property.units_count
        if property.is_lease_up:
            distribution = self.get_distribution(instance)
            if units_count and available_units_count and distribution and units_count:
                return round(
                    (units_count - available_units_count) * 100 / (total_units * distribution / 100), 2
                )
        else:
            if units_count and available_units_count:
                return round((units_count - available_units_count) * 100 / units_count, 2)
        return None

    def get_average_rent_sqft(self, instance):
        if instance.average_rent and instance.average_size:
            return instance.average_rent / instance.average_size
        return None

    class Meta:
        model = UnitType
        exclude = ['created', 'updated']


class UnitSessionListSerializer(serializers.ModelSerializer):

    class Meta:
        model = UnitSession
        exclude = ['created', 'updated', 'property']


class UnitSerializer(serializers.ModelSerializer):
    avg_rent_per_sqft = serializers.FloatField()
    unit_type = serializers.SerializerMethodField()
    unit_sessions = serializers.SerializerMethodField()

    def get_unit_type(self, instance):
        if not instance.unit_type:
            return None
        return next(
            (unit_type[1] for unit_type in UnitType.UNIT_TYPE_CHOICES if instance.unit_type.name == unit_type[0]), None
        )

    def get_unit_sessions(self, instance):
        return UnitSessionListSerializer(instance.unit_sessions.order_by('-start_listing_date'), many=True).data

    class Meta:
        model = Unit
        exclude = ['created', 'updated', 'property']


class UnitSessionDetailSerializer(serializers.ModelSerializer):
    unit_type = serializers.CharField(source='unit.unit_type')
    unit_size = serializers.CharField(source='unit.unit_size')
    unit_pricing = serializers.SerializerMethodField()
    days_on_market = serializers.SerializerMethodField()

    def get_days_on_market(self, instance):
        if instance.end_listing_date:
            return (instance.end_listing_date - instance.start_listing_date).days
        else:
            today = timezone.now().astimezone(TZ).date()
            return (today - instance.start_listing_date).days

    def get_unit_pricing(self, instance):
        common_queries = dict(
            property=instance.property,
            apartment=instance.unit.number,
            scrapping_date__gte=instance.start_listing_date
        )
        if instance.end_listing_date:
            histories = History.objects.filter(
                scrapping_date__lte=instance.end_listing_date, **common_queries
            )
        else:
            histories = History.objects.filter(**common_queries)

        return histories.order_by('scrapping_date').values('scrapping_date', 'rent').distinct('scrapping_date')

    class Meta:
        model = UnitSession
        exclude = ['created', 'updated', 'property']
