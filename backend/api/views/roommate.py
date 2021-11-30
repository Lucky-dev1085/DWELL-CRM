from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Roommate
from backend.api.permissions import LeadLevelAccessAuthorized
from backend.api.serializer import RoommateSerializer
from backend.api.views import LeadLevelViewSet
from backend.api.views.mixin import PusherMixin


class RoommateView(PusherMixin, LeadLevelViewSet):
    serializer_class = RoommateSerializer
    permission_classes = [LeadLevelAccessAuthorized]
    queryset = Roommate.objects.all()

    @action(methods=['POST'], detail=False)
    def bulk_save(self, request, **kwargs):
        lead = self.request.lead
        property = self.request.property
        roommates = request.data or []

        for roommate in roommates:
            if roommate.get('id'):
                instance = Roommate.objects.get(id=roommate.get('id'))
                serializer = RoommateSerializer(instance=instance, data=roommate)
            else:
                serializer = RoommateSerializer(data=roommate)
            serializer.is_valid(raise_exception=True)
            serializer.save(property=property, lead=lead)
        serializer = RoommateSerializer(Roommate.objects.filter(property=property, lead=lead).all(), many=True)
        return Response(serializer.data, status=200)
