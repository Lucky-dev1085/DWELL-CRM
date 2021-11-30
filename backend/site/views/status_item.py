from backend.api.permissions import DwellAuthorized, PublicPageDataAccessAuthorized
from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet
from rest_framework import mixins
from rest_framework.generics import get_object_or_404

from backend.site.models import PageData, Resource, StatusItem
from backend.site.serializer import PageDataSerializer, ResourceSectionBaseSerializer, PromotionSerializer,\
    StatusItemSerializer, PageDataSectionBaseSerializer


class PublicPageDataView(ReadOnlyModelViewSet):
    serializer_class = PageDataSerializer
    permission_classes = [PublicPageDataAccessAuthorized]
    queryset = PageData.objects.all()


class ResourceView(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = ResourceSectionBaseSerializer
    permission_classes = [DwellAuthorized]
    queryset = Resource.objects.all()

    def get_queryset(self):
        return self.request.property.resource.all()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), section__iexact=self.kwargs['pk'])


class PromotionView(ModelViewSet):
    serializer_class = PromotionSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        return self.request.property.promotion.all()

    def perform_create(self, serializer, **kwargs):
        serializer.save(property=self.request.property)


class StatusItemView(ModelViewSet):
    serializer_class = StatusItemSerializer
    permission_classes = [DwellAuthorized]
    queryset = StatusItem.objects.all()


class PageDataView(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = PageDataSectionBaseSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        return self.request.property.page_data.all()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), section__iexact=self.kwargs['pk'])
