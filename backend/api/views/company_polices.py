from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet
from backend.api.models import CompanyPolices
from backend.api.permissions import CompanyPolicesAuthorized
from backend.api.serializer import CompanyPolicesSerializer


class CompanyPolicesView(CreateModelMixin, GenericViewSet):
    serializer_class = CompanyPolicesSerializer
    permission_classes = [CompanyPolicesAuthorized]
    queryset = CompanyPolices.objects.all()

    def perform_create(self, serializer):
        customer = self.request.property.customer
        if hasattr(customer, 'company_polices'):
            serializer.instance = customer.company_polices
            serializer.save(customer=customer, id=customer.company_polices.pk)
        else:
            serializer.save(customer=customer)
