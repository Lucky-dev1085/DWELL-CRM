from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404

from backend.api.models import Customer, Property
from backend.api.permissions import LocationChromeExtensionAuthorized
from backend.site.serializer.location import CustomerSerializer, LocationSerializer, CategorySerializer


@api_view(['GET'])
@permission_classes([LocationChromeExtensionAuthorized])
def get_customers(request, **kwargs):
    serializer = CustomerSerializer(Customer.objects.all(), many=True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@permission_classes([LocationChromeExtensionAuthorized])
def get_categories(request, **kwargs):
    property = get_object_or_404(Property.objects.all(), pk=request.GET.get('property_id'))
    neighborhood = property.page_data.filter(section='NEIGHBORHOOD').first()
    serializer = CategorySerializer(neighborhood.values['categories'], many=True)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([LocationChromeExtensionAuthorized])
def create_location(request, **kwargs):
    data = request.data
    serializer = LocationSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(dict(success=True), status=200)
