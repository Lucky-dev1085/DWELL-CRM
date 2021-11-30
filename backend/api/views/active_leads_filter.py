from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from backend.api.models import ActiveLeadsFilter
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import ActiveLeadsFilterSerializer
from backend.api.views import PropertyLevelViewSet
from .mixin import GetSerializerClassMixin


class ActiveLeadsFilterView(GetSerializerClassMixin, PropertyLevelViewSet):
    serializer_class = ActiveLeadsFilterSerializer
    permission_classes = [DwellAuthorized]
    queryset = ActiveLeadsFilter.objects.all()

    @action(methods=['GET'], detail=False, permission_classes=[DwellAuthorized])
    def active_filter(self, request, **kwargs):
        try:
            active_filter = ActiveLeadsFilter.objects.get(property=self.request.property, user=self.request.user)
            return Response(active_filter.filter_id, status=200)
        except ActiveLeadsFilter.DoesNotExist:
            return Response('Unable to find matching record', status=HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False, permission_classes=[DwellAuthorized])
    def set_active_filter(self, request, **kwargs):
        active_filter, _ = ActiveLeadsFilter.objects.update_or_create(property=self.request.property,
                                                                      user=self.request.user)
        serializer = ActiveLeadsFilterSerializer(instance=active_filter, data=self.request.data)
        serializer.is_valid(raise_exception=True)
        active_filter = serializer.save()
        return Response(active_filter.filter_id, status=200)
