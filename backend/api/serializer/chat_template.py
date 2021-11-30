from rest_framework import serializers
from backend.api.models import ChatTemplate


class ChatTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatTemplate
        exclude = ('property', )
