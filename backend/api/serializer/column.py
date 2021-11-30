from rest_framework import serializers
from backend.api.models import Column


class ColumnSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        exclude = ['updated', 'created']
