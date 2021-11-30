from rest_framework import serializers
from backend.api.models import Competitor


class CompetitorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Competitor
        exclude = ('created', 'updated', 'property')
