from rest_framework import serializers
from backend.api.models import BusinessHours


class BusinessHoursSerializer(serializers.ModelSerializer):

    class Meta:
        model = BusinessHours
        exclude = ['updated', 'created']
