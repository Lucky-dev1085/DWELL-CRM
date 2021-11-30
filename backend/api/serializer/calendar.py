from rest_framework import serializers

from backend.api.models import Calendar


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        exclude = ('external_id', 'property')
