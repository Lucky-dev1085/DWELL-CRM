from backend.api.permissions import DwellAuthorized
from rest_framework.viewsets import ModelViewSet
from backend.site.serializer import PromotionSerializer


class PromotionView(ModelViewSet):
    serializer_class = PromotionSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        return self.request.property.promotion.all()

    def perform_create(self, serializer, **kwargs):
        serializer.save(property=self.request.property)
