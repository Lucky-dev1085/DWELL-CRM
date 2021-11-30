from backend.api.models import Activity
from backend.api.permissions import LeadLevelAccessAuthorized
from backend.api.serializer import ActivitySerializer
from backend.api.views import LeadLevelViewSet


class ActivityView(LeadLevelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [LeadLevelAccessAuthorized]
    queryset = Activity.objects.all()
