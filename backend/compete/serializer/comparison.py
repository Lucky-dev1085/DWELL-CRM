from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from backend.compete.models import Comparison
from backend.api.models import User


class ComparisonSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    subject_asset_name = serializers.SerializerMethodField()
    compared_asset_name = serializers.SerializerMethodField()

    def validate_subject_asset_type(self, value):
        if value == Comparison.SUB_MARKET:
            if not self.initial_data.get('subject_sub_market'):
                raise ValidationError('The given subject asset does not exists.')
        elif value == Comparison.PROPERTY:
            if not self.initial_data.get('subject_property'):
                raise ValidationError('The given subject asset does not exists.')
        return value

    def validate_compared_asset_type(self, value):
        if value == Comparison.MARKET:
            if not self.initial_data.get('market'):
                raise ValidationError('The given compared asset does not exists.')
        elif value == Comparison.SUB_MARKET:
            if not self.initial_data.get('compared_sub_market'):
                raise ValidationError('The given compared asset does not exists.')
        elif value == Comparison.PROPERTY:
            if not self.initial_data.get('compared_property'):
                raise ValidationError('The given compared asset does not exists.')
        elif value == Comparison.COMPETITORS:
            if not self.initial_data.get('competitor_property'):
                raise ValidationError('The given compared asset does not exists.')
        return value

    class Meta:
        model = Comparison
        exclude = ['created', 'updated']

    def get_subject_asset_name(self, instance):
        if instance.subject_asset_type == Comparison.SUB_MARKET:
            return instance.subject_sub_market.name
        else:
            return instance.subject_property.name

    def get_compared_asset_name(self, instance):
        if instance.compared_asset_type == Comparison.MARKET:
            return instance.market.name
        elif instance.compared_asset_type == Comparison.SUB_MARKET:
            return instance.compared_sub_market.name
        elif instance.compared_asset_type == Comparison.PROPERTY:
            return instance.compared_property.name
        else:
            return f'{instance.competitor_property.name}\'s Competitor Set'

    def create(self, validated_data):
        instance, _ = Comparison.objects.get_or_create(**validated_data)
        return instance
