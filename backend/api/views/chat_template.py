from backend.api.models import ChatTemplate
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import ChatTemplateSerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.views.pagination import CustomResultsSetPagination


class ChatTemplateView(PropertyLevelViewSet):
    serializer_class = ChatTemplateSerializer
    permission_classes = [DwellAuthorized]
    queryset = ChatTemplate.objects.all()
    pagination_class = CustomResultsSetPagination
