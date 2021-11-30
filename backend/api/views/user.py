from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.api import views
from backend.api.models import User
from backend.api.permissions import UserAccessAuthorized, ManageAccessAuthorized
from backend.api.serializer import UserSerializer, CurrentUserSerializer, UserListSerializer
from backend.api.views.mixin import PusherMixin
from .pagination import CustomResultsSetPagination


class UserView(PusherMixin, views.BaseViewSet):
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [UserAccessAuthorized]
    pagination_class = CustomResultsSetPagination
    filterset_fields = ['status']
    search_fields = ['first_name', 'last_name', 'email']
    ordering = ('-created',)
    ordering_fields = ('created',)

    def set_available_users_by_role(self) -> Q:
        user_filter = Q()
        logged_user_role = self.request.user.role

        if logged_user_role in [User.C_ADMIN, User.P_ADMIN]:
            user_filter = Q(role=User.G_ADMIN) | Q(role=User.P_ADMIN) | Q(pk=self.request.user.pk)

            if logged_user_role == User.C_ADMIN:
                user_filter = user_filter | Q(role=User.C_ADMIN)

        if logged_user_role == User.G_ADMIN:
            user_filter |= Q(role=User.G_ADMIN) | Q(pk=self.request.user.pk)

        return user_filter

    def get_queryset(self):
        user_filter = self.set_available_users_by_role()
        property_filter = Q()
        if hasattr(self.request, 'property'):
            properties = list(self.request.user.properties.all())
            if self.request.user.role == User.P_ADMIN:
                properties = list(self.request.user.customer.properties.all())
            if self.request.method == 'GET':
                property_filter = Q(properties__in=properties) | Q(properties=None)
        basic_filter = User.objects.filter(user_filter & property_filter).distinct()
        return basic_filter

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def current_user(self, request, **kwargs):
        context = {'request': self.request}
        serializer = CurrentUserSerializer(request.user, context=context)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=False, permission_classes=[ManageAccessAuthorized])
    def team_members(self, request, **kwargs):
        users = User.objects.filter(
            role=User.G_ADMIN, properties__in=[self.request.property], is_team_account=True).distinct()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=200)
