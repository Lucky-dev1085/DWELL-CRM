from rest_framework.permissions import BasePermission


class DemoTourAuthorized(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return False
        return True
