from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.core import exceptions
import django.contrib.auth.password_validation as validators

from backend.api.models import User, Client, Property
from backend.api.serializer import NestedPropertySerializer
from backend.api.utils import get_image_url, get_user_last_activity


class UserSerializer(serializers.ModelSerializer):
    clients = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), many=True, required=False)
    properties = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), many=True, required=False)
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)
    change_password = serializers.BooleanField(required=False)
    current_password = serializers.CharField(required=False)
    new_password = serializers.CharField(required=False)
    confirm_password = serializers.CharField(required=False)

    class Meta:
        model = User
        exclude = ('is_superuser', 'is_staff', 'is_active', 'groups', 'user_permissions', 'username')
        read_only_fields = [
            'is_password_changed', 'date_joined', 'login_count', 'customer_record', 'last_login', 'logo'
        ]
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def validate_properties(self, value):
        current_user = self.context.get('request').user
        current_user_properties = set()
        validated_user_properties = set(value)
        if current_user.role in [User.C_ADMIN, User.P_ADMIN]:
            current_user_properties = set(current_user.customer.properties.all())
        if current_user.role == User.G_ADMIN:
            if self.instance and current_user:
                # the existing user's properties that current user can not get access
                access_not_allowed_properties = self.instance.properties.exclude(pk__in=current_user.properties.all())
                value += access_not_allowed_properties
            current_user_properties = set(current_user.properties.all())
        if current_user.role == User.LL_ADMIN:
            current_user_properties = set(Property.objects.all())
        if not validated_user_properties.issubset(current_user_properties):
            raise ValidationError({
                'properties':
                'Current user doesnt have access to one of listed properties'
            })
        return value

    def validate_clients(self, value):
        current_user = self.context.get('request').user
        current_user_clients = set()
        validated_user_clients = set(value)
        if current_user.role in [User.C_ADMIN, User.P_ADMIN]:
            current_user_clients = set(current_user.customer.clients.all())
        if current_user.role == User.G_ADMIN:
            if self.instance and current_user:
                # the existing user's clients that current user can not get access
                access_not_allowed_clients = self.instance.clients.exclude(pk__in=current_user.clients.all())
                value += access_not_allowed_clients
            current_user_clients = set(current_user.clients.all())
        if current_user.role == User.LL_ADMIN:
            current_user_clients = set(Client.objects.all())
        if not set(validated_user_clients).issubset(current_user_clients):
            raise ValidationError({
                'clients':
                'Current user doesnt have access to one of listed clients'
            })
        return value

    def validate_role(self, value):
        current_user = self.context.get('request').user
        current_role = current_user.role
        if current_role == User.LL_ADMIN:
            return value
        if current_role == User.C_ADMIN and value != User.LL_ADMIN:
            return value
        if current_role in [User.C_ADMIN, User.P_ADMIN] and value in [User.P_ADMIN, User.G_ADMIN]:
            return value
        if current_role == User.G_ADMIN and value == User.G_ADMIN:
            return value
        raise ValidationError({'role': 'Invalid user role'})

    def validate_password(self, value):
        try:
            validators.validate_password(value)
        except exceptions.ValidationError as e:
            raise ValidationError({'password': list(e.messages)})
        return value

    def validate_customer(self, value):
        current_user = self.context.get('request').user
        if current_user.role == User.LL_ADMIN and \
                self.initial_data.get('role') in [User.G_ADMIN, User.P_ADMIN, User.C_ADMIN]:
            if not value:
                raise ValidationError({'customer': 'Customer is required'})
        if current_user.role in [User.G_ADMIN, User.P_ADMIN, User.C_ADMIN]:
            if current_user.customer != value:
                raise ValidationError({'customer': 'You do not permission to allocate given customer access.'})
        return value

    def validate(self, attrs):
        if attrs.get('change_password'):
            if not self.context.get('request').user.check_password(attrs.get('current_password')):
                raise ValidationError({'change_password': 'Current password is incorrect.'})
            if attrs.get('new_password') != attrs.get('confirm_password'):
                raise ValidationError({'change_password': 'Confirm password is incorrect.'})
        return attrs

    def save_password(self, instance, password):
        instance.set_password(password)
        instance.save()
        return instance

    def create(self, validated_data):
        password = validated_data.pop('password')
        if validated_data.get('role') == User.LL_ADMIN:
            validated_data['clients'] = Client.objects.values_list('pk', flat=True)
            validated_data['properties'] = Property.objects.values_list('pk', flat=True)
        if validated_data.get('role') == User.C_ADMIN:
            validated_data['clients'] = validated_data['customer'].clients.values_list('pk', flat=True)
            validated_data['properties'] = validated_data['customer'].properties.values_list('pk', flat=True)
        user = super(UserSerializer, self).create(validated_data)
        return self.save_password(user, password)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if validated_data.get('role') == User.C_ADMIN and instance.customer != validated_data.get('customer')\
                and validated_data.get('customer'):
            validated_data['clients'] = validated_data['customer'].clients.values_list('pk', flat=True)
            validated_data['properties'] = validated_data['customer'].properties.values_list('pk', flat=True)

        changed_to_ll_admin = validated_data.get('role') == User.LL_ADMIN and instance.role != User.LL_ADMIN
        user = super(UserSerializer, self).update(instance, validated_data)

        if changed_to_ll_admin:
            user.clients.set(Client.objects.values_list('pk', flat=True))
            user.properties.set(Property.objects.values_list('pk', flat=True))

        if password:
            return self.save_password(user, password)

        if validated_data.get('change_password'):
            self.save_password(user, validated_data.get('new_password'))
        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    properties = NestedPropertySerializer(many=True, read_only=True)
    logo = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'role', 'properties', 'logo', 'id', 'email', 'customer', 'avatar',
                  'has_advanced_reports_access', 'is_call_scorer', 'last_login_property', 'is_available',
                  'customer_name', 'last_property', 'is_chat_reviewer']

    def get_logo(self, instance):
        url = ''
        try:
            if instance.role == User.LL_ADMIN:
                url = '{}{}'.format(settings.CRM_HOST, FileSystemStorage().url('LL_Logo.svg'))
            if instance.role in [User.G_ADMIN, User.P_ADMIN, User.C_ADMIN] and instance.customer:
                url = get_image_url(instance.customer.logo.url)
        except ValueError:
            return ''
        return url


class UserListSerializer(serializers.ModelSerializer):
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'avatar', 'last_activity', 'properties']

    def get_last_activity(self, instance):
        return get_user_last_activity(instance.id)
