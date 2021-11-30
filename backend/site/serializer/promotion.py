from rest_framework import serializers
from backend.site.models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        exclude = ['property']


class HobbesPromotionSerializer(serializers.ModelSerializer):
    floor_plans = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        exclude = ['property']

    def get_floor_plans(self, instance):
        return list(instance.floor_plans.values_list('plan', flat=True))
