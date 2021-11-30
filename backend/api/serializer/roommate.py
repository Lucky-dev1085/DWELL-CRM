from django.utils import timezone
from rest_framework import serializers
from backend.api.models import Roommate


class RoommateSerializer(serializers.ModelSerializer):
    last_activity = serializers.SerializerMethodField()

    def get_last_activity(self, instance):
        if not instance.lead:
            return None
        from backend.api.serializer import ActivityCommunicationSerializer
        activity = instance.lead.activities.filter(
            object_id=instance.pk, object_content_type__model='roommate'
        ).order_by('-created').first()
        return ActivityCommunicationSerializer(activity, context=self.context).data

    class Meta:
        model = Roommate
        exclude = ['updated', 'created', 'resman_person_id', 'real_page_customer_id']

    def save(self, **kwargs):
        instance = super(RoommateSerializer, self).save(**kwargs)
        instance.lead.last_activity_date = timezone.now()
        instance.lead.save()
        return instance
