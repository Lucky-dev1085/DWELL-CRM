from backend.api.models import Note
from backend.api.permissions import LeadLevelAccessAuthorized
from backend.api.serializer import NoteListSerializer
from backend.api.views import LeadLevelViewSet
from backend.api.views.mixin import PusherMixin


class NoteView(PusherMixin, LeadLevelViewSet):
    serializer_class = NoteListSerializer
    permission_classes = [LeadLevelAccessAuthorized]
    queryset = Note.objects.all()
