from rest_framework import serializers
from backend.api.models import LeaseDefault, PropertyPolicy, RentableItem, DurationPricing


class LeaseDefaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseDefault
        exclude = ['property']


class PropertyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPolicy
        exclude = ['property']


class RentableItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentableItem
        exclude = ['property']


class DurationPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DurationPricing
        exclude = ['property']
