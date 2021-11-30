from rest_framework import viewsets

from backend.api.models import Portfolio
from backend.api.permissions import ReportAccessAuthorized
from backend.api.serializer import PortfolioSerializer
from backend.api.views.pagination import CustomResultsSetPagination


class PortfolioView(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [ReportAccessAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        return Portfolio.objects.all()
