from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from backend.api.models import Customer, User, Property, Client
from backend.api.serializer import UserSerializer, PropertySerializer, ClientSerializer


class CustomerSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    admins = serializers.SerializerMethodField()
    active_properties = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()
    properties = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), many=True)
    clients = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), many=True)

    class Meta:
        model = Customer
        fields = '__all__'

    def update_user(self, validated_data, customer):
        user_data = self.initial_data.get('user')
        user_data['role'] = User.C_ADMIN
        user = None
        try:
            user = User.objects.get(pk=user_data.get('id'))
        except User.DoesNotExist:
            pass
        user_data['customer'] = customer.pk
        user_data['is_super_customer'] = True
        user_serializer = UserSerializer(user, data=user_data, context={'request': self.context.get('request')})
        if not user_serializer.is_valid():
            raise ValidationError(user_serializer.errors)
        user_serializer.save()
        return customer

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.copy()
        instance = super(CustomerSerializer, self).create(validated_data)
        return self.update_user(user_data, instance)

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.copy()
        instance = super(CustomerSerializer, self).update(instance, validated_data)
        return self.update_user(user_data, instance)

    def get_active_properties(self, instance):
        return instance.properties.count()

    def get_employees_count(self, instance):
        return instance.employee.count()

    def get_admins(self, instance):
        return instance.employee.filter(role=User.C_ADMIN).values('id', 'first_name', 'last_name', 'is_super_customer')

    def get_user(self, instance):
        return UserSerializer(instance.employee.filter(role=User.C_ADMIN, is_super_customer=True).first()).data


class CustomerLogoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer
        fields = ('logo', )


class CustomerDetailSerializer(serializers.ModelSerializer):
    admins = serializers.SerializerMethodField()
    employee = serializers.SerializerMethodField()
    clients = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    properties = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Customer
        fields = ('id', 'customer_name', 'clients', 'properties', 'admins', 'employee')

    def get_employee(self, instance):
        return instance.employee.exclude(role=User.LL_ADMIN)\
            .exclude(role=User.C_ADMIN).values('id', 'first_name', 'last_name', 'role')

    def get_admins(self, instance):
        return instance.employee.filter(role=User.C_ADMIN).values('id', 'first_name', 'last_name', 'role')


class OnboardSerializer(serializers.ModelSerializer):

    def save(self, **kwargs):
        current_user = self.context.get('request').user
        customer_data = self.initial_data.get('customer')
        client_data = self.initial_data.get('client')
        property_data = self.initial_data.get('property')
        user_data = self.initial_data.get('user')

        property = user = None
        context = {'request': self.context.get('request')}

        with transaction.atomic():
            if client_data.get('id'):
                client = Client.objects.get(id=client_data.get('id'))
            else:
                client = ClientSerializer(data=client_data, context=context)
                client.is_valid(raise_exception=True)
                client = client.save()

            if property_data.get('name'):
                property_data['client_id'] = client.pk
                property = PropertySerializer(data=property_data, context=context)
                property.is_valid(raise_exception=True)
                property = property.save()
            else:
                raise ValidationError('Property name is required')

            if current_user.role == User.LL_ADMIN:
                customer = Customer.objects.get(id=customer_data.get('id'))
            else:
                customer = current_user.customer

            customer.properties.add(property)
            customer.clients.add(client)

            customer_admin = customer.employee.filter(is_super_customer=True).first()
            if customer_admin:
                customer_admin.properties.add(property)
                customer_admin.clients.add(client)

            if user_data.get('ids'):
                for user in User.objects.filter(pk__in=user_data.get('ids')):
                    user.clients.add(client)
                    user.properties.add(property)
        return dict(
            customer=CustomerSerializer(customer, context=context).data,
            property=PropertySerializer(property, context=context).data,
            client=ClientSerializer(client, context=context).data,
            user=UserSerializer(user, context=context).data,
        )

    class Meta:
        model = Customer
        fields = ('id',)
