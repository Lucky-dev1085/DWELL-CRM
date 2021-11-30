from rest_framework import serializers
from backend.api.models import Survey


class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        exclude = ('created', 'updated', 'property')
