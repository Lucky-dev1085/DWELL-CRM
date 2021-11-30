from rest_framework import viewsets, mixins

from backend.api.permissions import DwellAuthorized
from backend.hobbes.models import ChatReportMessage, ChatReportConversation
from backend.hobbes.serializer import ChatReportMessageSerializer


class ChatReportMessageViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin):
    serializer_class = ChatReportMessageSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = None
    model = ChatReportMessage

    def get_queryset(self):
        return ChatReportConversation.objects.get(pk=self.kwargs.get('id')).report_messages.all()
