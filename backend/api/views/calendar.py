from backend.api.models import Calendar
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import CalendarSerializer
from backend.api.views import PropertyLevelViewSet


class CalendarView(PropertyLevelViewSet):
    serializer_class = CalendarSerializer
    permission_classes = [DwellAuthorized]
    queryset = Calendar.objects.all()
