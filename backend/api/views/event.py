from backend.api.models import Event, Property
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import EventSerializer
from backend.api.views import PropertyLevelViewSet


class EventView(PropertyLevelViewSet):
    serializer_class = EventSerializer
    permission_classes = [DwellAuthorized]
    queryset = Event.objects.all()

    def get_queryset(self):
        current_property = self.request.property
        queryset = Event.objects.filter(property=current_property)
        return queryset.filter(
            calendar__in=current_property.nylas_selected_calendars.all()).distinct() \
            if current_property.nylas_selected_calendars.count() and not \
            current_property.calendar_sync_option == Property.NYLAS_SYNC_OPTION_ALL else queryset
