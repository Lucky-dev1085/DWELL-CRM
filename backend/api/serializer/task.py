from rest_framework import serializers
from backend.api.models import Task, Lead, Activity
from backend.api.serializer import UnitSerializer
from backend.api.tasks.smartrent.create_tour import create_tour
from backend.api.tasks.smartrent.update_tour import update_tour
from backend.api.tasks.smartrent.cancel_tour import cancel_tour


class CommonTaskDetailSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    owner_name = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()

    def get_owner_name(self, instance):
        return '{} {}'.format(instance.owner.first_name, instance.owner.last_name) if instance.owner else None

    def get_last_activity(self, instance):
        if not instance.lead:
            return None
        from backend.api.serializer import ActivityCommunicationSerializer
        activity = instance.lead.activities.filter(
            object_id=instance.pk, object_content_type__model='task'
        ).order_by('-created').first()
        return ActivityCommunicationSerializer(activity).data

    class Meta:
        model = Task


class TaskDetailSerializer(CommonTaskDetailSerializer):

    class Meta:
        model = Task
        exclude = ['units', 'tour_date']
        extra_kwargs = {
            'due_date': {'required': True},
            'owner': {'required': True},
        }


class TourDetailSerializer(CommonTaskDetailSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)

    class Meta:
        model = Task
        exclude = ['due_date']
        extra_kwargs = {
            'units': {'required': True},
            'tour_date': {'required': True},
            'owner': {'required': True},
        }

    def save(self, **kwargs):
        should_update_completed_date = False
        created = True
        if self.instance:
            # If a tour is completed, then we should set tour completed date with actual tour happening date
            tour = self.instance
            tour_types = [Task.TYPE_TOUR, Task.TYPE_IN_PERSON, Task.TYPE_FACETIME, Task.TYPE_VIRTUAL_TOUR,
                          Task.TYPE_GUIDED_VIRTUAL_TOUR, Task.TYPE_SELF_GUIDED_TOUR]
            if tour.type in tour_types and \
                    self.validated_data.get('status') == Task.TASK_COMPLETED and \
                    tour.status == Task.TASK_OPEN and tour.lead:
                should_update_completed_date = True

            created = False

            tour_date_changed = self.instance.tour_date != self.validated_data.get('tour_date') \
                if self.validated_data.get('tour_date') else False

            unit_ids = sorted(self.instance.units.values_list('id', flat=True))
            new_unit_ids = sorted([unit.id for unit in self.validated_data.get('units', [])])
            unit_changed = unit_ids != new_unit_ids if self.validated_data.get('units') else False

            if tour_date_changed or unit_changed:
                Activity.objects.create(
                    property=tour.property, lead=tour.lead, type=Activity.TOUR_UPDATED, content=tour.title,
                    creator=tour.actor, object=tour
                )
                if self.instance.type == Task.TYPE_SELF_GUIDED_TOUR:
                    update_tour.delay(self.instance.lead.id, self.instance.id)
                    self.validated_data['status'] = 'PENDING'

            elif not self.instance.is_cancelled and self.validated_data.get('is_cancelled'):
                Activity.objects.create(
                    property=tour.property, lead=tour.lead, type=Activity.TOUR_CANCELLED, content=tour.title,
                    creator=tour.actor, object=tour
                )
                if self.instance.type == Task.TYPE_SELF_GUIDED_TOUR:
                    cancel_tour.delay(self.instance.lead.id, self.instance.id)

                if self.instance.lead.stage == Lead.STAGE_TOUR_SET:
                    # If the tour is cancelled and lead status is on tour set, then we revert the stage to previous one
                    self.instance.lead.stage = self.instance.lead.last_stage or Lead.STAGE_CONTACT_MADE
                    self.instance.lead.save()

        if created and self.validated_data['type'] == Task.TYPE_SELF_GUIDED_TOUR:
            self.validated_data['status'] = 'PENDING'

        tour = super(TourDetailSerializer, self).save(**kwargs)

        if created and tour.type == Task.TYPE_SELF_GUIDED_TOUR:
            create_tour.delay(tour.lead.id, tour.id)

        if created and tour.lead.status == Lead.LEAD_LOST:
            lead = tour.lead
            lead.status = Lead.LEAD_ACTIVE
            lead.save()

        if created and tour.type in Task.TOUR_TYPES.keys() and tour.status != Task.TOUR_PENDING:
            lead = tour.lead
            lead.stage = Lead.STAGE_TOUR_SET
            lead.save()

        if should_update_completed_date:
            lead = tour.lead
            lead.tour_completed_date = tour.tour_date
            lead.stage = Lead.STAGE_TOUR_COMPLETED
            lead.save()
        return tour


class TaskListSerializer(CommonTaskDetailSerializer):
    showing_units = serializers.SerializerMethodField()

    def get_showing_units(self, instance):
        return UnitSerializer(instance.units.get_queryset(), many=True).data

    class Meta:
        model = Task
        fields = '__all__'


class PublicTourDetailSerializer(TourDetailSerializer):
    units = serializers.ListField(write_only=True)
    showing_units = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'type', 'description', 'tour_date', 'lead', 'units', 'showing_units', 'status']

    def validate_units(self, value):
        property = self.context.get('request').property
        return property.units.filter(unit__in=value)

    def get_showing_units(self, instance):
        return list(instance.units.values_list('unit', flat=True))
