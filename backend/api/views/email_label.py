from backend.api.models import EmailLabel
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import EmailLabelSerializer
from backend.api.views import PropertyLevelViewSet


class EmailLabelView(PropertyLevelViewSet):
    serializer_class = EmailLabelSerializer
    permission_classes = [DwellAuthorized]
    queryset = EmailLabel.objects.all()
