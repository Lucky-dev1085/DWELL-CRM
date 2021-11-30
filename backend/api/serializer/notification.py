from rest_framework import serializers
from backend.api.models import Notification


class NotificationListSerializer(serializers.ModelSerializer):
    redirect_url = serializers.SlugField('redirect_url')
    lead_owner = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_lead_owner(self, instance):
        if instance.type == Notification.TYPE_NEW_SMS:
            lead = getattr(instance.object, 'lead', None)
            if lead and lead.owner:
                return lead.owner.email
        return None
