from rest_framework import serializers

from backend.api.models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        exclude = ('external_id', 'property')
