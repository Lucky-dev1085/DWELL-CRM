from backend.api.models import Competitor
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import CompetitorSerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.views.pagination import CustomResultsSetPagination
from rest_framework.response import Response
from rest_framework import status


class CompetitorView(PropertyLevelViewSet):
    serializer_class = CompetitorSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = CustomResultsSetPagination
    queryset = Competitor.objects.all()

    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)