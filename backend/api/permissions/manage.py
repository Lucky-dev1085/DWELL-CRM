from rest_framework.permissions import BasePermission, SAFE_METHODS

from backend.api.models import User
from .base import PropertyLevelAccessAuthorized


class ManageAccessAuthorized(PropertyLevelAccessAuthorized):
    def has_permission(self, request, view):
        return super(ManageAccessAuthorized, self).has_permission(request, view)


class ClientAccessAuthorized(BasePermission):
    def has_permission(self, request, view):
        is_authenticated = bool(request.user and request.user.is_authenticated)
        return is_authenticated and (request.user.role in
                                     (User.C_ADMIN, User.LL_ADMIN) or request.method in SAFE_METHODS)


class PropertyAccessAuthorized(ClientAccessAuthorized):
    def has_permission(self, request, view):
        return super(PropertyAccessAuthorized, self).has_permission(request, view)


class CustomerAccessAuthorized(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated) and request.user.role == User.LL_ADMIN


class UserAccessAuthorized(PropertyLevelAccessAuthorized):
    def has_permission(self, request, view):
        if not super(UserAccessAuthorized, self).has_permission(request, view):
            return False
        if request.user.role == User.G_ADMIN and request.method in ['POST']:
            return False
        return True
