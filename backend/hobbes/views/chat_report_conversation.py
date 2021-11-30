from rest_framework import viewsets, mixins

from backend.api.permissions import DwellAuthorized
from backend.hobbes.models import ChatReport
from backend.hobbes.renderers import CustomChatReportRenderer
from backend.hobbes.serializer import ChatReportConversationSerializer


class ChatReportConversationViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin):
    serializer_class = ChatReportConversationSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = None
    renderer_classes = CustomChatReportRenderer,

    def get_queryset(self):
        return ChatReport.objects.get(pk=self.kwargs.get('id')).chats.all()
