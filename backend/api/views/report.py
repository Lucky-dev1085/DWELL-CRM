from rest_framework import viewsets

from backend.api.serializer import ReportSerializer


class ReportView(viewsets.GenericViewSet):
    serializer_class = ReportSerializer
