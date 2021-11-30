from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import BusinessHours
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import BusinessHoursSerializer
from backend.api.views import PropertyLevelViewSet


class BusinessHoursView(PropertyLevelViewSet):
    serializer_class = BusinessHoursSerializer
    permission_classes = [DwellAuthorized]
    queryset = BusinessHours.objects.all()

    @action(methods=['PUT'], detail=False)
    def bulk_update(self, request, **kwargs):
        for item in request.data.get('business_hours', []):
            instance = BusinessHours.objects.get(id=item['id'])
            serializer = BusinessHoursSerializer(instance=instance, data=item)
            if serializer.is_valid():
                serializer.save()
        serializer = BusinessHoursSerializer(BusinessHours.objects.filter(property=self.request.property).all(),
                                             many=True)
        return Response(serializer.data, status=200)

    @action(methods=['POST'], detail=False)
    def bulk_create(self, request, **kwargs):
        for item in request.data.get('business_hours', []):
            item['property'] = request.property.id
            serializer = BusinessHoursSerializer(data=item)
            if serializer.is_valid():
                serializer.save()
        serializer = BusinessHoursSerializer(BusinessHours.objects.filter(property=self.request.property).all(),
                                             many=True)
        return Response(serializer.data, status=201)
