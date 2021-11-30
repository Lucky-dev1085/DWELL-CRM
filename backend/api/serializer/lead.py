from datetime import datetime, timedelta

from django.db.models.functions import Concat
from django.utils import timezone

from django.db import connection, transaction
from django.db.models import Q, F, Value
from next_prev import next_or_prev_in_order
from rest_framework import serializers

from backend.api.models import Lead, Task, ActiveLeadsFilter, LeadsFilter, Activity, Property, ProspectSource, Roommate, \
    Note, AssignLeadOwners, ChatProspect
from backend.api.views.filters import get_filtered_leads
from backend.api.utils import dedupe_lead
from backend.api.tasks.smartrent.delete_prospect import delete_prospect
from backend.api.tasks.smartrent.update_prospect import update_prospect
from .task import TaskListSerializer
from .roommate import RoommateSerializer
from .call import CallSerializer, CallCommunicationSerializer
from .chat import ChatProspectSerializer, ChatConversationCommunicationSerializer
from .note import NoteListSerializer, NoteCommunicationSerializer
from .email_message import EmailMessageSerializer, EmailMessageCommunicationSerializer
from .activity import ActivityCommunicationSerializer
from .sms import SMSContentCommunicationSerializer


class LeadAuditSerializer(serializers.ModelSerializer):
    all_leads_count = serializers.SerializerMethodField()
    active_leads_count = serializers.SerializerMethodField()
    my_leads_count = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ['all_leads_count', 'active_leads_count', 'my_leads_count']

    def get_all_leads_count(self, instance):
        return instance.property.leads.filter(acquisition_date__gte=timezone.now() - timedelta(days=120)).count()

    def get_active_leads_count(self, instance):
        return instance.property.leads.filter(
            status='ACTIVE', acquisition_date__gte=timezone.now() - timedelta(days=120)
        ).count()

    def get_my_leads_count(self, instance):
        return instance.property.leads.filter(
            owner=self.context.get('request').user,
            status='ACTIVE',
            acquisition_date__gte=timezone.now() - timedelta(days=120)
        ).count()


class LeadListSerializer(LeadAuditSerializer):
    next_task = serializers.SerializerMethodField()
    next_task_date = serializers.SerializerMethodField()
    owner = serializers.SlugRelatedField(read_only=True, slug_field='email')
    source = serializers.SlugRelatedField(read_only=True, slug_field='name')

    def get_next_task(self, instance):
        return instance.next_task.title if instance.next_task else None

    def get_next_task_date(self, instance):
        if instance.next_task:
            task = instance.next_task
            return task.tour_date if task.type in Task.TOUR_TYPES.keys() else task.due_date
        return None

    class Meta:
        model = Lead
        fields = ['id', 'name', 'stage', 'owner', 'move_in_date', 'days_to_move_in', 'source', 'last_followup_date',
                  'created', 'next_task', 'next_task_date', 'last_activity_date', 'status', 'floor_plan',
                  'acquisition_date'] + LeadAuditSerializer.Meta.fields


class LeadNameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'name', 'email', 'phone_number']


class LeadCreateSerializer(LeadAuditSerializer):
    def validate(self, attrs):
        super(LeadCreateSerializer, self).validate(attrs)
        if not self.initial_data.get('allow_duplication'):
            lead_queryset = Lead.objects.filter(property=self.context.get('request').property)
            lead = lead_queryset.filter(first_name__iexact=attrs.get('first_name'),
                                        last_name__iexact=attrs.get('last_name')).first()
            if lead:
                raise serializers.ValidationError(dict(
                    id=lead.pk,
                    message='It looks like a lead with name {} already exists.'.format(lead.name)))
            if attrs.get('email'):
                lead = lead_queryset.filter(email__iexact=attrs.get('email')).first()
                if lead:
                    raise serializers.ValidationError(dict(
                        id=lead.pk,
                        message='It looks like a lead with email address {} already exists.'.format(lead.email)))
            if attrs.get('phone_number'):
                lead = lead_queryset.filter(phone_number=attrs.get('phone_number')).first()
                if lead:
                    raise serializers.ValidationError(dict(
                        id=lead.pk,
                        message='It looks like a lead with phone number {} already exists.'.format(lead.phone_number)))
        return attrs

    class Meta:
        model = Lead
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'source', 'move_in_date', 'floor_plan',
                  'id', 'owner'] + LeadAuditSerializer.Meta.fields


def get_filtered_queryset(request):
    filter_id = 'all_leads'
    active_filter = ActiveLeadsFilter.objects.filter(property=request.property, user=request.user).first()
    if active_filter:
        if active_filter.is_default_filter:
            filter_id = active_filter.lead_default_filter
        else:
            filter_id = active_filter.lead_filter.pk if active_filter.lead_filter else None

    queryset = Lead.objects.filter(property=request.property)
    if filter_id and filter_id != 'all_leads':
        if filter_id == 'my_leads':
            queryset = queryset.filter(owner=request.user, status=Lead.LEAD_ACTIVE)
        elif filter_id == 'active_leads':
            queryset = queryset.filter(status=Lead.LEAD_ACTIVE)
        else:
            try:
                lead_filter = LeadsFilter.objects.get(pk=filter_id)
                queryset = get_filtered_leads(queryset, [item for item in lead_filter.filter_items.all().values()],
                                              lead_filter.filter_type, request.property)
            except LeadsFilter.DoesNotExist:
                pass
    return queryset.order_by('-created')


class LeadDetailSerializer(LeadAuditSerializer):
    property = serializers.CharField(source='property.name', read_only=True)
    days_to_move_in = serializers.IntegerField(read_only=True)
    next_lead = serializers.SerializerMethodField()
    prev_lead = serializers.SerializerMethodField()
    lead_can_text = serializers.SerializerMethodField()
    acquisition_history = serializers.ListField(read_only=True)
    calls = CallSerializer(many=True, read_only=True)
    # chat_prospects = ChatProspectSerializer(many=True, read_only=True)
    chat_prospects = serializers.SerializerMethodField()
    roommates = RoommateSerializer(many=True, read_only=True)
    email_messages = EmailMessageSerializer(many=True, read_only=True)
    last_activity = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()

    def get_next_lead(self, instance):
        next_or_prev = next_or_prev_in_order(instance, get_filtered_queryset(self.context['request']), False, True)
        return next_or_prev.id if next_or_prev else None

    def get_prev_lead(self, instance):
        next_or_prev = next_or_prev_in_order(instance, get_filtered_queryset(self.context['request']), True, True)
        return next_or_prev.id if next_or_prev else None

    def get_lead_can_text(self, instance):
        return bool(instance.phone_number and instance.property.sms_tracking_number)

    def get_chat_prospects(self, instance):
        prospect_ids = list(instance.chat_prospects.values_list('id', flat=True)) + \
                       list(instance.chat_prospects_for_guest.values_list('id', flat=True))
        return ChatProspectSerializer(ChatProspect.objects.filter(id__in=prospect_ids), many=True).data

    def get_tasks(self, instance):
        return TaskListSerializer(instance.tasks.filter(is_cancelled=False), many=True).data

    def get_notes(self, instance):
        return NoteListSerializer(instance.notes.all(), many=True, context=self.context).data

    def get_last_activity(self, instance):
        from backend.api.serializer import ActivityCommunicationSerializer
        activity = instance.activities.filter(
            type__in=[Activity.LEAD_CREATED, Activity.LEAD_UPDATED, Activity.LEAD_SHARED]
        ).order_by('-created').first()
        return ActivityCommunicationSerializer(activity, context=self.context).data

    def save(self, **kwargs):
        # If the lead stage is changed to Tour Completed, then we set the current time to tour completed date
        if self.instance and self.instance.stage != Lead.STAGE_TOUR_COMPLETED \
                and self.validated_data.get('stage') \
                and self.validated_data.get('stage') == Lead.STAGE_TOUR_COMPLETED:
            self.validated_data['tour_completed_date'] = timezone.now()

        # If the lead is deleted, we will cancel the tours and remove the prospect from Smart Rent
        if self.instance \
                and self.validated_data.get('status') in [Lead.LEAD_LOST, Lead.LEAD_DELETED, Lead.LEAD_CLOSED] \
                and self.instance.status != self.validated_data.get('status'):
            if self.instance.smart_rent_id:
                delete_prospect.delay(self.instance.id)
            else:
                self.instance.tasks.exclude(status='COMPLETED').delete()

        # If the move in date is changed, we will sync it to Smart Rent
        move_in_date_changed = False
        if self.instance and 'move_in_date' in self.validated_data.keys() and \
                self.instance.move_in_date != self.validated_data.get('move_in_date'):
            move_in_date_changed = True

        changed_fields = []
        content = None
        if self.instance and self.validated_data.get('floor_plan'):
            new_plans = sorted([plan.id for plan in self.validated_data.get('floor_plan')])
            old_plans = sorted(list(self.instance.floor_plan.values_list('id', flat=True)))
            if new_plans != old_plans:
                plans = [plan.plan for plan in self.validated_data.get('floor_plan')]
                content = 'Floor plan updated to {}'.format(', '.join(plans))
                changed_fields.append('Floor plan')

        if self.instance and self.validated_data.get('units'):
            new_units = sorted([unit.id for unit in self.validated_data.get('units')])
            old_units = sorted(list(self.instance.units.values_list('id', flat=True)))
            if new_units != old_units:
                units = [unit.unit for unit in self.validated_data.get('units')]
                content = 'Units updated to {}'.format(', '.join(units))
                changed_fields.append('Units')

        if len(changed_fields) > 1:
            content = '{} were updated'.format(', '.join(changed_fields))
        if content:
            Activity.objects.create(
                property=self.instance.property, lead=self.instance, type=Activity.LEAD_UPDATED, content=content,
                creator=self.instance.actor
            )

        instance = super(LeadDetailSerializer, self).save(**kwargs)

        if move_in_date_changed:
            connection.on_commit(lambda: update_prospect.delay(self.instance.id))

        return instance

    class Meta:
        model = Lead
        exclude = [
            'smart_rent_id', 'real_page_customer_id', 'real_page_guest_card_id', 'resman_changed_field',
            'last_twilio_backup_date', 'confirmation_sms_reminder_async_id',
            'application_complete_email_sent', 'confirmation_reminder_async_id', 'followup_reminder_async_id',
            'resman_person_id', 'resman_prospect_id', 'resman_prospect_lost'
        ]
        read_only_fields = ['pms_sync_date', 'pms_sync_status', 'property']


class BulkEditSerializer(LeadAuditSerializer):
    ids = serializers.PrimaryKeyRelatedField(queryset=Lead.objects.all(), many=True, required=False)
    compare_field = serializers.ChoiceField(choices=['stage', 'owner', 'status'], required=False)

    def validate(self, attrs):
        if not attrs.get('lost_reason') and attrs.get('status') == 'LOST':
            raise serializers.ValidationError('Please provide lost_reason.')
        return attrs

    def save(self, **kwargs):
        compare_field = self.validated_data.get('compare_field')
        for lead in self.validated_data.get('ids'):
            old_owner = lead.owner
            setattr(lead, compare_field, self.validated_data.get(compare_field))
            if compare_field == 'status' and self.validated_data.get(compare_field) == 'LOST':
                lead.lost_reason = self.validated_data.get('lost_reason')
            lead.save()

            pms_sync_delayed = lead.pms_sync(lead.owner != old_owner)
            if pms_sync_delayed:
                connection.on_commit(pms_sync_delayed)

    class Meta:
        model = Lead
        fields = ('status', 'stage', 'owner', 'lost_reason', 'compare_field', 'ids')


def update_primary_lead_field(primary_lead, leads, field):
    """
    Updates primary lead model field during merge action
    :param primary_lead: lead that was selected as primary for merging lead details
    :param leads: other leads that are used for merging lead details
    :param field: lead model field that being updated
    """
    if not getattr(primary_lead, field.name):
        recent_lead = leads.filter(Q(**{'{}__isnull'.format(field.name): False})).order_by('-updated').first()
        if recent_lead:
            setattr(primary_lead, field.name, getattr(recent_lead, field.name))
        primary_lead.created = min(primary_lead.created, leads.order_by('created').first().created)


def update_primary_lead_relation(primary_lead, leads, relation):
    """
    Updates primary lead related objects during merge action
    :param primary_lead: lead that was selected as primary for merging lead details
    :param leads: other leads that are used for merging lead details
    :param relation: lead related objects that being updated
    """
    if relation.name not in ['activities', 'shared_leads']:
        getattr(primary_lead, relation.name).add(*relation.related_model.objects.filter(lead__in=leads))
    else:
        created_activity = Activity.objects.filter(
            type=Activity.LEAD_CREATED, lead__in=leads + [primary_lead]).order_by('created').first()
        created_activity.content = primary_lead.name
        created_activity.save()
        activities = Activity.objects.exclude(type=Activity.LEAD_CREATED).filter(
            lead__in=leads + [primary_lead])
        primary_lead.activities.set(list(activities) + [created_activity])


class LeadMergeSerializer(serializers.ModelSerializer):
    primary_lead = serializers.PrimaryKeyRelatedField(queryset=Lead.objects.all(), required=False)
    leads = serializers.PrimaryKeyRelatedField(queryset=Lead.objects.all(), many=True, required=False)

    @transaction.atomic
    def save(self, **kwargs):
        primary_lead = self.validated_data.get('primary_lead')
        leads = self.validated_data.get('leads')
        leads_queryset = Lead.objects.filter(id__in=[lead.id for lead in leads])
        last_activity_dates = leads_queryset.exclude(last_activity_date=None).order_by('-last_activity_date') \
            .values_list('last_activity_date', flat=True)
        last_activity_date = next((date for date in last_activity_dates), None)
        for field in Lead._meta.fields:
            update_primary_lead_field(primary_lead, leads_queryset, field)
        for relation in Lead._meta.related_objects:
            update_primary_lead_relation(primary_lead, leads, relation)
        Activity.objects.create(property=primary_lead.property, lead=primary_lead, type=Activity.LEAD_MERGED,
                                content='Merge Leads - {}, {}'.format(
                                    primary_lead.name, ', '.join(leads_queryset.annotate(
                                        name=Concat(F('first_name'), Value(' '), F('last_name'))).values_list(
                                        'name', flat=True))),
                                creator=primary_lead.actor)

        leads_queryset.update(status=Lead.LEAD_DELETED, is_deleted_by_merging=True)
        if last_activity_date and primary_lead.last_activity_date:
            primary_lead.last_activity_date = max(last_activity_date, primary_lead.last_activity_date)
        else:
            primary_lead.last_activity_date = last_activity_date
        primary_lead.save()

    class Meta:
        model = Lead
        fields = ('primary_lead', 'leads')


class LeadShareSerializer(serializers.ModelSerializer):
    lead = serializers.PrimaryKeyRelatedField(queryset=Lead.objects.all(), required=False)
    properties = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), many=True, required=False)

    @transaction.atomic
    def save(self, **kwargs):
        lead = self.validated_data.get('lead')
        properties = self.validated_data.get('properties')
        current_property = self.context.get('request').property
        is_transferred = current_property.id not in [p.id for p in properties]

        for property in properties:
            if property.id == current_property.id:
                continue

            source = None
            if lead.source:
                source = ProspectSource.objects.filter(name=lead.source.name, property=property).first() or \
                         ProspectSource.objects.filter(name='Other', property=property).first()
                if not source:
                    raise serializers.ValidationError(dict(
                        id=property.id,
                        message='It looks like a source with name {} in {} property does not exist.'.format(
                            lead.source.name, property.name)))
            owner = None
            assign_lead_owners = AssignLeadOwners.objects.filter(property=property).first()
            if assign_lead_owners:
                owner = getattr(assign_lead_owners, datetime.now(property.timezone).strftime('%A').lower(),
                                None)
            shared_lead = Lead.objects.create(
                property=property, first_name=lead.first_name, last_name=lead.last_name,
                email=lead.email,
                phone_number=lead.phone_number,
                origin=lead.origin,
                move_in_date=lead.move_in_date,
                desired_rent=lead.desired_rent,
                lease_term=lead.lease_term,
                moving_reason=lead.moving_reason,
                best_contact_method=lead.best_contact_method,
                best_contact_time=lead.best_contact_time,
                occupants=lead.occupants,
                beds=lead.beds,
                baths=lead.baths,
                pets=lead.pets,
                pet_type=lead.pet_type,
                vehicles=lead.vehicles,
                washer_dryer_method=lead.washer_dryer_method,
                source=source,
                source_lead=lead,
                owner=owner,
            )

            for roommate in lead.roommates.all():
                Roommate.objects.create(first_name=roommate.first_name,
                                        last_name=roommate.last_name,
                                        relationship=roommate.relationship,
                                        email=roommate.email,
                                        phone_number=roommate.phone_number,
                                        lead=shared_lead,
                                        property=property)
            Note.objects.create(
                property=property, lead=shared_lead,
                text='Lead <a href="{link_variable}" target="_blank">{lead_name}</a> {label} by {first_name} {last_name} at {property}'.format(
                    lead_name=lead.name,
                    label='shared' if not is_transferred else 'transferred',
                    first_name=self.context.get('request').user.first_name,
                    last_name=self.context.get('request').user.last_name,
                    property=self.context.get('request').property.name,
                    link_variable='{shared_lead_link}' if not is_transferred else '{transferred_lead_link}',
                ), has_shared_lead_link=True, is_auto_generated=True)

            Activity.objects.create(property=self.context.get('request').property, type=Activity.LEAD_SHARED,
                                    lead=lead, creator=self.context.get('request').user,
                                    content='Lead {} {} by {} {}'.format(
                                        'shared with' if not is_transferred else 'transferred to',
                                        property.name,
                                        self.context.get('request').user.first_name,
                                        self.context.get('request').user.last_name,
                                    ))

        if current_property.id not in [p.id for p in properties]:
            lead.status = Lead.LEAD_DELETED
            lead.save()

        return lead

    class Meta:
        model = Lead
        fields = ('lead', 'properties')


class LeadSMSListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    last_message_date = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ['id', 'name', 'property', 'phone_number', 'last_message', 'last_message_date', 'unread_count']

    def get_last_message(self, instance):
        last_conversation = instance.sms.order_by('-date').first()
        return last_conversation.message if last_conversation else None

    def get_last_message_date(self, instance):
        last_conversation = instance.sms.order_by('-date').first()
        return last_conversation.date.isoformat() if last_conversation else None

    def get_unread_count(self, instance):
        return instance.sms.filter(is_read=False).count()


class PublicLeadDetailSerializer(serializers.ModelSerializer):
    property = serializers.CharField(source='property.name', read_only=True)
    moving_reason = serializers.CharField(required=False, allow_blank=True)
    pet_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Lead
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'origin', 'move_in_date', 'desired_rent',
                  'lease_term', 'moving_reason', 'best_contact_method', 'best_contact_time', 'occupants', 'beds',
                  'baths', 'pets', 'pet_type', 'vehicles', 'washer_dryer_method', 'stage', 'status', 'property']

    def validate_moving_reason(self, value):
        property = self.context.get('request').property
        reason = property.reason_for_moving.filter(reason=value).first()
        return reason

    def validate_pet_type(self, value):
        property = self.context.get('request').property
        pet = property.pet_types.filter(name=value).first()
        return pet

    def save(self, **kwargs):
        kwargs.pop('owner', None)
        kwargs.pop('actor', None)
        return super(PublicLeadDetailSerializer, self).save(**kwargs)


class PublicLeadCreateSerializer(serializers.ModelSerializer):
    property = serializers.CharField(source='property.name', read_only=True)
    comments = serializers.CharField(required=False, allow_blank=True)
    moving_reason = serializers.CharField(required=False, allow_blank=True)
    pet_type = serializers.CharField(required=False, allow_blank=True)

    def validate_moving_reason(self, value):
        property = self.context.get('request').property
        reason = property.reason_for_moving.filter(reason=value).first()
        return reason

    def validate_pet_type(self, value):
        property = self.context.get('request').property
        pet = property.pet_types.filter(name=value).first()
        return pet

    def create(self, validated_data):
        request = self.context.get('request')
        property = request.property
        source_name = getattr(request.vendor, 'source', None)
        comments = self.validated_data.pop('comments', None)

        source = self.validated_data.get('source') or \
                 ProspectSource.objects.filter(name=source_name, property=property).first()

        lead, _ = dedupe_lead(property, source=source, vendor=request.vendor, **self.validated_data)
        if comments:
            Note.objects.create(lead=lead, text=comments, property=property)
        return lead

    class Meta:
        model = Lead
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'origin', 'move_in_date', 'desired_rent',
                  'lease_term', 'moving_reason', 'best_contact_method', 'best_contact_time', 'occupants', 'beds',
                  'baths', 'pets', 'pet_type', 'vehicles', 'washer_dryer_method', 'stage', 'status', 'property', 'id',
                  'comments']


class LeadCommunicationSerializer(serializers.Serializer):
    type = serializers.CharField()
    date = serializers.DateTimeField()
    is_property_communication = serializers.BooleanField(allow_null=True)
    object = serializers.SerializerMethodField()

    def get_object(self, obj):
        if obj['type'] == 'ACTIVITY':
            return ActivityCommunicationSerializer(obj['object'], context=self.context).data
        if obj['type'] == 'CALL':
            return CallCommunicationSerializer(obj['object']).data
        if obj['type'] == 'EMAIL':
            return EmailMessageCommunicationSerializer(obj['object']).data
        if obj['type'] == 'CHATS':
            return ChatConversationCommunicationSerializer(obj['object'], many=True).data
        if obj['type'] == 'SMS':
            return SMSContentCommunicationSerializer(obj['object']).data
        if obj['type'] == 'NOTE':
            return NoteCommunicationSerializer(obj['object']).data
