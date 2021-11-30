from rest_framework import viewsets, mixins

from backend.api.permissions import DwellAuthorized
from backend.hobbes.models import ChatReport
from backend.hobbes.serializer import ChatReportSerializer


class ChatReportView(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin):
    serializer_class = ChatReportSerializer
    permission_classes = [DwellAuthorized]
    model = ChatReport

    def get_queryset(self):
        return ChatReport.objects.filter(property=self.request.property).order_by('-session_date')

