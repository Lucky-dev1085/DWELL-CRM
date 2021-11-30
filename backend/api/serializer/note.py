from rest_framework import serializers

from backend.api.models import Note


class NoteListSerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source='actor.name', read_only=True)
    transformed_text = serializers.SerializerMethodField()

    def get_transformed_text(self, instance):
        if instance.has_shared_lead_link and instance.lead.source_lead:
            user = self.context['request'].user
            property = self.context['request'].property
            source_lead = instance.lead.source_lead
            label = 'shared' if '{shared_lead_link}' in instance.text else 'transferred'
            if source_lead.property in user.properties.all():
                return instance.text.replace('{shared_lead_link}' if label == 'shared' else '{transferred_lead_link}',
                                             '/{}/leads/{}'.format(source_lead.property.external_id, source_lead.id))
            else:
                return instance.text.replace('{shared_lead_link}' if label == 'shared' else '{transferred_lead_link}',
                                             '/{}/leads/{}#{}'.format(property.external_id, source_lead.id, label))
        return instance.text

    class Meta:
        model = Note
        fields = '__all__'


class NoteCommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('id', 'text', 'is_auto_generated', 'updated')
