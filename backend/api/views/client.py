from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from backend.api import views
from backend.api.models import Client, User
from backend.api.serializer import ClientSerializer
from backend.api.views.pagination import CustomResultsSetPagination
from backend.api.permissions import ClientAccessAuthorized


class ClientView(views.BaseViewSet):
    serializer_class = ClientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering = ('-created',)
    ordering_fields = ('created',)
    permission_classes = [ClientAccessAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        current_user = self.request.user
        if current_user.role in [User.G_ADMIN, User.C_ADMIN]:
            return current_user.clients.all()
        if current_user.role == User.P_ADMIN:
            return current_user.customer.clients.all()
        return Client.objects.all()
