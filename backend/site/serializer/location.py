from json import loads

from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError

from backend.api.models import Customer, Property
from backend.site.views.image_upload import S3


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'name']


class CustomerSerializer(serializers.ModelSerializer):
    properties = PropertySerializer(many=True)

    class Meta:
        model = Customer
        fields = ['id', 'customer_name', 'properties']


class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class LocationSerializer(serializers.Serializer):
    customer = serializers.IntegerField()
    property = serializers.IntegerField()
    categories = serializers.CharField()
    name = serializers.CharField()
    image = serializers.ImageField()
    address = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    phone = serializers.CharField()
    website = serializers.CharField()

    def validate_property(self, value):
        property = Property.objects.filter(id=value).first()
        if not property:
            raise NotFound
        return property

    def validate_customer(self, value):
        customer = Customer.objects.filter(id=value).first()
        if not customer:
            raise NotFound
        return customer

    def validate_categories(self, value):
        return loads(value)

    def save(self, **kwargs):
        property = self.validated_data.pop('property')
        customer = self.validated_data.pop('customer')
        category = self.validated_data.pop('categories')
        lat = self.validated_data.get('lat')
        lng = self.validated_data.get('lng')
        if property.customer != customer:
            raise ValidationError('This property has not access to this customer.')

        neighborhood = property.page_data.filter(section='NEIGHBORHOOD').first()
        locations = neighborhood.values['locations']

        s3 = S3()
        try:
            image = self.validated_data.pop('image')
            path = s3.upload_file(image, property)
        except Exception as e:
            raise ValidationError(e)

        location = dict(
            isPropertyLocation=False,
            addressGeoPosition=dict(lat=lat, lng=lng),
            image=path,
            category=category,
            **self.validated_data
        )
        locations += [location]
        neighborhood.values['locations'] = locations
        neighborhood.save()
