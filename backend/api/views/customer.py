from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api import views
from backend.api.models import Customer, User
from backend.api.permissions import CustomerAccessAuthorized, ManageAccessAuthorized
from backend.api.serializer import CustomerSerializer, CustomerLogoSerializer, CustomerDetailSerializer
from backend.api.views.pagination import CustomResultsSetPagination
from .mixin import GetSerializerClassMixin


class CustomerView(GetSerializerClassMixin, views.BaseViewSet):
    serializer_class = CustomerSerializer
    serializer_action_classes = {
        'partial_update': CustomerLogoSerializer,
    }
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer_name']
    ordering = ('-created',)
    ordering_fields = ('created',)
    permission_classes = [
        ManageAccessAuthorized, CustomerAccessAuthorized,
    ]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        property_filter = Q()
        if hasattr(self.request, 'property') and self.request.user.role != User.LL_ADMIN:
            if self.request.method == 'GET':
                property_filter = Q(properties__in=[self.request.property])
        return Customer.objects.filter(property_filter).distinct()

    def perform_destroy(self, instance):
        for property in instance.properties.all():
            property.delete()
        for client in instance.clients.all():
            client.delete()
        instance.employee.all().delete()
        instance.delete()

    @action(methods=['GET'], detail=True, permission_classes=[ManageAccessAuthorized])
    def get_details(self, request, **kwargs):
        customer = self.get_object()
        serializer = CustomerDetailSerializer(customer)
        return Response(serializer.data, status=200)

    @action(methods=['POST'], detail=False)
    def onboard(self, request, **kwargs):
        from backend.api.serializer.customer import OnboardSerializer
        context = {'request': self.request}
        serializer = OnboardSerializer(data=request.data, context=context)
        results = serializer.save()
        return Response(results, status=200)
