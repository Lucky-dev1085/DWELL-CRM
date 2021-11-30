from rest_framework import serializers
from backend.site.models import StatusItem


class StatusItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusItem
        fields = '__all__'
