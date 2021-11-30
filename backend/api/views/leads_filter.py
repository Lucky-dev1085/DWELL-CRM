from backend.api.models import LeadsFilter
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import LeadsFilterSerializer
from backend.api.views import PropertyLevelViewSet
from .mixin import GetSerializerClassMixin, PusherMixin


class LeadsFilterView(GetSerializerClassMixin, PusherMixin, PropertyLevelViewSet):
    serializer_class = LeadsFilterSerializer
    permission_classes = [DwellAuthorized]
    queryset = LeadsFilter.objects.all()
