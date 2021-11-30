from rest_framework import serializers

from backend.api.models import DemoTour
from timezone_field.rest_framework import TimeZoneSerializerField


class DemoTourSerializer(serializers.ModelSerializer):
    timezone = TimeZoneSerializerField()

    class Meta:
        model = DemoTour
        exclude = ('id',)
