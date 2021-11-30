from rest_framework import serializers
from backend.site.models import Resource


class ResourceSectionBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        exclude = ['section', 'id', 'property']
