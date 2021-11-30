from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from backend.api.models import LeaseDefault, PropertyPolicy, RentableItem, Property, DurationPricing
from backend.api.permissions import DwellAuthorized
from backend.api.serializer.lease import LeaseDefaultSerializer, PropertyPolicySerializer, RentableItemSerializer, \
    DurationPricingSerializer
from backend.api.views import PropertyLevelViewSet


class LeaseDefaultView(CreateModelMixin, GenericViewSet):
    serializer_class = LeaseDefaultSerializer
    permission_classes = [DwellAuthorized]
    queryset = LeaseDefault.objects.all()

    def perform_create(self, serializer):
        lease_default_setting = self.request.property.lease_defaults.filter(is_default_setting=True).first()
        if lease_default_setting:
            serializer.instance = lease_default_setting
            serializer.save(property=self.request.property)
        else:
            serializer.save(property=self.request.property, is_default_setting=True)

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated, IsAdminUser],
            authentication_classes=[SessionAuthentication])
    def get_lease_default_setting(self, *args, **kwargs):
        property = Property.objects.get(pk=int(self.request.GET.get('property')))
        lease_default_setting = property.lease_defaults.filter(is_default_setting=True).first()
        return Response(LeaseDefaultSerializer(instance=lease_default_setting).data, status=200)


class PropertyPolicyView(CreateModelMixin, GenericViewSet):
    serializer_class = PropertyPolicySerializer
    permission_classes = [DwellAuthorized]
    queryset = PropertyPolicy.objects.all()

    def perform_create(self, serializer):
        if hasattr(self.request.property, 'polices'):
            serializer.instance = self.request.property.polices
            serializer.save(property=self.request.property, id=self.request.property.polices.pk)
        else:
            serializer.save(property=self.request.property)


class RentableItemView(PropertyLevelViewSet):
    serializer_class = RentableItemSerializer
    permission_classes = [DwellAuthorized]
    queryset = RentableItem.objects.all()


class DurationPricingView(CreateModelMixin, GenericViewSet):
    serializer_class = DurationPricingSerializer
    permission_classes = [DwellAuthorized]
    queryset = DurationPricing.objects.all()

    def perform_create(self, serializer):
        if hasattr(self.request.property, 'duration_pricing'):
            serializer.instance = self.request.property.duration_pricing
            serializer.save(property=self.request.property, id=self.request.property.duration_pricing.pk)
        else:
            serializer.save(property=self.request.property)
