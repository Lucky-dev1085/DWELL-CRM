from rest_framework import serializers
from backend.api.models import Activity, Task


class ActivitySerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField(read_only=True)
    transformed_content = serializers.SerializerMethodField()

    def get_creator(self, instance):
        return instance.creator.name if instance.creator else None

    def get_transformed_content(self, instance):
        content = instance.content
        if instance.type == Activity.NOTE_CREATED and instance.object:
            content = instance.object.text
            if instance.object.has_shared_lead_link and instance.lead.source_lead:
                user = self.context['request'].user
                property = self.context['request'].property
                source_lead = instance.lead.source_lead
                label = 'shared' if '{shared_lead_link}' in instance.content else 'transferred'
                if source_lead.property in user.properties.all():
                    content = content.replace(
                        '{shared_lead_link}' if label == 'shared' else '{transferred_lead_link}',
                        '/{}/leads/{}'.format(source_lead.property.external_id, source_lead.id))
                else:
                    content = content.replace(
                        '{shared_lead_link}' if label == 'shared' else '{transferred_lead_link}',
                        '/{}/leads/{}#{}'.format(property.external_id, source_lead.id, label))
        if instance.type in [Activity.TOUR_UPDATED, Activity.TOUR_CREATED,
                             Activity.TOUR_CANCELLED, Activity.TOUR_COMPLETED]:
            content = content.replace('Schedule', '')
        return content

    class Meta:
        model = Activity
        exclude = ('object_content_type',)


class ActivityCommunicationSerializer(ActivitySerializer):
    tour = serializers.SerializerMethodField()
    type_label = serializers.SerializerMethodField()
    note_auto_generated = serializers.SerializerMethodField()
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = (
            'id', 'transformed_content', 'type', 'tour', 'creator', 'created', 'type_label', 'note_auto_generated',
            'object_id', 'content_type'
        )

    def get_tour(self, instance):
        if instance.type == Activity.TOUR_CREATED and instance.object:
            owner_name = instance.object.owner.name if instance.object.owner else None
            return dict(
                units=instance.object.units.values_list('pk', flat=True), owner=owner_name,
                tour_date=instance.object.tour_date, description=instance.object.description
            )
        return None

    def get_type_label(self, instance):
        label_mapping = {
            'LEAD_CREATED': 'New Lead',
            'LEAD_UPDATED': 'Updated Lead',
            'NOTE_CREATED': 'Internal Note',
            'TASK_COMPLETED': 'Task Completed',
            'TOUR_CREATED': 'In-Person Tour (todo)',
            'TOUR_UPDATED': 'Tour Updated',
            'TOUR_CANCELLED': 'Tour Cancelled',
            'LEAD_SHARED': 'Shared Lead',
            'TASK_CREATED': 'Added New Task',
            'TASK_UPDATED': 'Task Updated',
            'TASK_DELETED': 'Task Deleted',
            'LEAD_MERGED': 'Merged Leads',
            'ROOMMATE_UPDATED': 'Roommate Updated',
            'ROOMMATE_CREATED': 'Added New Roommate',
            'ROOMMATE_DELETED': 'Roommate Deleted',
        }
        if instance.type == Activity.TOUR_CREATED and instance.object:
            return Task.TOUR_TYPES.get(instance.object.type)
        return label_mapping[instance.type] if instance.type in label_mapping.keys() else instance.type

    def get_note_auto_generated(self, instance):
        if instance.type == Activity.NOTE_CREATED and instance.object:
            return instance.object.is_auto_generated
        return None

    def get_content_type(self, instance):
        return instance.object_content_type.name if instance.object_content_type else None
