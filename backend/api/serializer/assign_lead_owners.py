from rest_framework import serializers
from backend.api.models import AssignLeadOwners


class AssignLeadOwnersSerializer(serializers.ModelSerializer):

    class Meta:
        model = AssignLeadOwners
        fields = '__all__'
