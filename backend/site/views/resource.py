from backend.api.permissions import DwellAuthorized
from rest_framework.viewsets import GenericViewSet
from rest_framework import mixins
from rest_framework.generics import get_object_or_404

from backend.site.models import Resource
from backend.site.serializer import ResourceSectionBaseSerializer


class ResourceView(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = ResourceSectionBaseSerializer
    permission_classes = [DwellAuthorized]
    queryset = Resource.objects.all()

    def get_queryset(self):
        return self.request.property.resource.all()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), section__iexact=self.kwargs['pk'])
