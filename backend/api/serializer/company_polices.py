from rest_framework import serializers
from backend.api.models import CompanyPolices


class CompanyPolicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPolices
        exclude = ['customer']
