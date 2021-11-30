from rest_framework import serializers
from backend.compete.models import WatchList
from backend.compete.serializer import MarketNameSerializer, SubMarketNameSerializer, PropertyNameSerializer, \
    ComparisonSerializer


class WatchListSerializer(serializers.ModelSerializer):
    market = MarketNameSerializer()
    submarket = SubMarketNameSerializer()
    property = PropertyNameSerializer()
    comparison = ComparisonSerializer()

    class Meta:
        model = WatchList
        fields = '__all__'
