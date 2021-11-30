from rest_framework import serializers
from backend.api.models import Client, Property, User


class NestedPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'name', 'domain']


class ClientSerializer(serializers.ModelSerializer):
    properties = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)
    creator = serializers.SlugField('creator.email', read_only=True)

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['created', 'updated', 'creator']

    def get_properties(self, client):
        user = self.context.get('request').user

        available_properties = []
        if user.role in User.G_ADMIN:
            available_properties = user.properties.all()
        if user.role in [User.C_ADMIN, User.P_ADMIN]:
            available_properties = user.customer.properties.all()
        if user.role == User.LL_ADMIN:
            available_properties = Property.objects.all()

        pks = [property.pk for property in available_properties]
        properties = client.properties.filter(pk__in=pks)
        return NestedPropertySerializer(properties, many=True).data

    def get_customers(self, client):
        return [item.pk for item in client.customers.all()]
