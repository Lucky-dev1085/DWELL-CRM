from backend.api import views
from backend.api.models import CallScoringQuestion
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import CallScoringQuestionSerializer


class CallScoringQuestionView(views.BaseViewSet):
    serializer_class = CallScoringQuestionSerializer
    permission_classes = [DwellAuthorized]

    def get_queryset(self):
        return CallScoringQuestion.objects.all()
