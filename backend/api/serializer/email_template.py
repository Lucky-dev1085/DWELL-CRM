from rest_framework import serializers
from backend.api.models import EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        exclude = ('property', )
