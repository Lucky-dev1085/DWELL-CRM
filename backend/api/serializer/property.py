from datetime import datetime

from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from backend.api.models import Property, Client, FloorPlan, Unit, User, ProspectSource, ProspectLostReason,\
    ReasonForMoving, PetType, RelationshipType, PetWeight, PriceRange
from .lease import LeaseDefaultSerializer, PropertyPolicySerializer, RentableItemSerializer, DurationPricingSerializer
from .company_polices import CompanyPolicesSerializer


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        exclude = ('created', 'updated')


class FloorPlanSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = FloorPlan
        exclude = ('created', 'updated', 'property')


class PublicFloorPlanSerializer(serializers.ModelSerializer):
    property = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = FloorPlan
        exclude = ('created', 'updated')


class ProspectSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectSource
        exclude = ('created', 'updated', 'property', 'spends')


class SourceSpendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectSource
        exclude = ('created', 'updated', 'property', 'external_id')


class ReasonForMovingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReasonForMoving
        fields = '__all__'


class PetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetType
        fields = '__all__'


class PetWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetWeight
        fields = '__all__'


class PriceRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceRange
        fields = '__all__'


class ProspectLostReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectLostReason
        exclude = ('created', 'updated')


class PropertyUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class RelationshipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipType
        fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
    active_users = serializers.IntegerField(source='users.count', read_only=True)
    creator = serializers.CharField(source='creator.email', read_only=True)
    client = serializers.CharField(source='client.name', read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
    users = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    tracking_number = serializers.CharField(read_only=True)
    sms_tracking_number = serializers.CharField(read_only=True)
    not_scored_calls_count = serializers.SerializerMethodField()
    has_scored_calls_today = serializers.SerializerMethodField()
    active_prospects = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)

    class Meta:
        model = Property
        exclude = ['timezone']
        read_only_fields = [
            'created', 'updated', 'login_count', 'external_id', 'active_users',  'active_prospects',
            'client', 'logo', 'nylas_status', 'nylas_sync_option', 'nylas_selected_labels', 'shared_email',
            'unread_count'
        ]

    def create(self, validated_data):
        client = validated_data.pop('client_id')
        new_property = Property(**validated_data)
        new_property.client = client
        new_property.creator = self.context.get('request').user
        new_property.save()
        return new_property

    def update(self, instance, validated_data):
        logo = self.initial_data.get('logo')
        client = validated_data.pop('client_id', None)
        instance = super(PropertySerializer, self).update(instance, validated_data)

        if client:
            if client.customer == instance.customer:
                instance.client = client
                instance.save()
            else:
                raise ValidationError('The customer does not have access rights to given client.')

        if logo:
            instance.logo = logo
            instance.save()
        return instance

    def get_logo(self, instance):
        return instance.logo.name

    def get_users(self, instance):
        return PropertyUsersSerializer(instance.team_members, many=True, read_only=True).data

    def get_not_scored_calls_count(self, instance):
        return instance.last_2_weeks_eligible_calls.filter(scored_calls=None).count()

    def get_has_scored_calls_today(self, instance):
        start_time = instance.timezone.localize(
            datetime.combine(timezone.now().astimezone(tz=instance.timezone).date(), datetime.min.time())
        )
        end_time = instance.timezone.localize(
            datetime.combine(timezone.now().astimezone(tz=instance.timezone).date(), datetime.max.time())
        )
        return instance.scored_calls.filter(
            scored_at__gte=start_time, scored_at__lte=end_time, rescore_status='NOT_REQUIRED'
        ).exists()

    def get_active_prospects(self, instance):
        return instance.chat_prospects.filter(is_active=True, is_archived=False).count()

    def get_unread_count(self, instance):
        user = None
        if self.context.get('request'):
            user = self.context.get('request').user
        return instance.notifications.filter(is_read=False, user=user).count() \
               + instance.sms.filter(is_read=False).count() \
               + instance.conversations.filter(is_read=False).count()


class PropertyDetailSerializer(PropertySerializer):
    units = serializers.SerializerMethodField()
    floor_plans = FloorPlanSerializer(many=True, read_only=True)
    sources = ProspectSourceSerializer(many=True, read_only=True)
    reason_for_moving = ReasonForMovingSerializer(many=True, read_only=True)
    pet_types = PetTypeSerializer(many=True, read_only=True)
    pet_weights = PetWeightSerializer(many=True, read_only=True)
    price_ranges = PriceRangeSerializer(many=True, read_only=True)
    lost_reasons = ProspectLostReasonSerializer(many=True, read_only=True)
    relationship_types = serializers.SerializerMethodField()
    lease_default = serializers.SerializerMethodField()
    polices = PropertyPolicySerializer(read_only=True)
    rentable_items = RentableItemSerializer(many=True, read_only=True)
    customer_properties = serializers.SerializerMethodField()
    company_polices = serializers.SerializerMethodField()
    market = serializers.SerializerMethodField()
    submarket = serializers.SerializerMethodField()
    competitors = serializers.SerializerMethodField()
    competitor_property = serializers.PrimaryKeyRelatedField(source='compete_property', read_only=True)
    duration_pricing = DurationPricingSerializer(read_only=True)

    class Meta:
        model = Property
        exclude = ['timezone', 'nylas_access_token', 'nylas_account_id', 'real_page_pmc_id', 'real_page_site_id',
                   'resman_account_id', 'resman_property_id']

    def get_customer_properties(self, instance):
        if self.context.get('request').user.role in [User.LL_ADMIN, User.C_ADMIN]:
            return [dict(id=property.id, name=property.name)
                    for property in self.context.get('request').user.properties.all()]
        else:
            return [dict(id=property.id, name=property.name)
                    for property in self.context.get('request').user.customer.properties.all()]

    def get_units(self, instance):
        return UnitSerializer(instance.units.filter(not_used_for_marketing=False), many=True).data

    def get_lease_default(self, instance):
        lease_default = instance.lease_defaults.filter().first()
        return LeaseDefaultSerializer(lease_default).data if lease_default else dict()

    def get_company_polices(self, instance):
        return CompanyPolicesSerializer(instance.customer.company_polices).data \
            if getattr(instance.customer, 'company_polices', None) else dict()

    def get_market(self, instance):
        compete_property = getattr(instance, 'compete_property', None)
        if compete_property:
            return compete_property.submarket.market.pk if compete_property.submarket else None
        return None

    def get_submarket(self, instance):
        compete_property = getattr(instance, 'compete_property', None)
        if compete_property:
            return compete_property.submarket.pk if compete_property.submarket else None
        return None

    def get_competitors(self, instance):
        compete_property = getattr(instance, 'compete_property', None)
        if compete_property:
            return compete_property.competitors.values_list('id', flat=True)
        return None

    def get_relationship_types(self, instance):
        return RelationshipTypeSerializer(
            instance.relationship_types.exclude(name__icontains='Guarantor'), many=True
        ).data
