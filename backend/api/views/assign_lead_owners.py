from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import AssignLeadOwners
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import AssignLeadOwnersSerializer, UserSerializer
from backend.api.views import PropertyLevelViewSet


class AssignLeadOwnersView(PropertyLevelViewSet):
    serializer_class = AssignLeadOwnersSerializer
    permission_classes = [DwellAuthorized]
    queryset = AssignLeadOwners.objects.all()

    @action(methods=['GET'], detail=False, permission_classes=[DwellAuthorized])
    def current_assigned_owner(self, request, **kwargs):
        property = request.property
        weekday = timezone.now().astimezone(tz=property.timezone).strftime('%A').lower()

        owner = None
        if hasattr(property, 'assign_lead_owner') and property.assign_lead_owner.is_enabled:
            owner = getattr(property.assign_lead_owner, weekday, None)

        data = None
        if owner:
            serializer = UserSerializer(owner)
            data = serializer.data
        return Response(data, status=200)
