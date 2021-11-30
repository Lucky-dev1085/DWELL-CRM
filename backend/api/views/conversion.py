from django.db.models import Q
from rest_framework.exceptions import NotFound

from backend.api import views
from backend.api.models import Conversion, Property
from backend.api.permissions import ManageAccessAuthorized
from backend.api.views.pagination import CustomResultsSetPagination
from backend.api.serializer import ConversionSerializer


class ConversionView(views.BaseViewSet):
    serializer_class = ConversionSerializer
    permission_classes = []
    http_method_names = ['get', 'post', 'delete']
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        if hasattr(self.request, 'property'):
            property_filter = Q(property__in=[self.request.property])
        else:
            property_filter = Q(property__in=self.request.user.properties.all())
        return Conversion.objects.filter(property_filter).order_by('-created')

    def perform_create(self, serializer):
        try:
            property = Property.objects.get(domain=self.request.META.get('HTTP_X_DOMAIN'))
            serializer.save(property=property)
        except Property.DoesNotExist:
            raise NotFound()

    def get_permissions(self):
        if self.action == 'create':
            return ()
        return ManageAccessAuthorized(),
