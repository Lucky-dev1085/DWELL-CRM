from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Column
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import ColumnSerializer
from backend.api.utils import push_bulk_update_event
from backend.api.views import PropertyLevelViewSet


class ColumnView(PropertyLevelViewSet):
    serializer_class = ColumnSerializer
    permission_classes = [DwellAuthorized]
    queryset = Column.objects.all()

    @action(methods=['PUT'], detail=False)
    def bulk_update(self, request, **kwargs):
        for column in request.data.get('columns', []):
            instance = Column.objects.get(id=column['id'])
            serializer = ColumnSerializer(instance=instance, data=column)
            if serializer.is_valid():
                serializer.save()
        serializer = ColumnSerializer(Column.objects.filter(property=self.request.property).all(), many=True)
        push_bulk_update_event(request, serializer.data, 'column')
        return Response(serializer.data, status=200)

    @action(methods=['POST'], detail=False)
    def bulk_create(self, request, **kwargs):
        for column in request.data.get('columns', []):
            column['property'] = request.property.id
            serializer = ColumnSerializer(data=column)
            if serializer.is_valid():
                serializer.save()
        serializer = ColumnSerializer(Column.objects.filter(property=self.request.property).all(), many=True)
        push_bulk_update_event(request, serializer.data, 'column')
        return Response(serializer.data, status=201)
