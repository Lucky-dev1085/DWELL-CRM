from rest_framework.permissions import BasePermission
from rest_framework.exceptions import ValidationError

from backend.api.models import Property, User, VendorAuth
from .dwell import DwellAuthorized


class PublicPageDataAccessAuthorized(BasePermission):
    def has_permission(self, request, view):
        x_domain = request.META.get('HTTP_X_DOMAIN')
        if x_domain:
            try:
                request.property = Property.objects.get(domain=x_domain)
                return True
            except Property.DoesNotExist:
                raise ValidationError('Given x_domain is not correct.')
        return False


class PageDataAccessAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        if not super(DwellAuthorized, self).has_permission(request, view):
            return False
        if request.user.role == User.G_ADMIN:
            return False
        return True


class LocationChromeExtensionAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        client_id = request.META.get('HTTP_CLIENT_ID')
        secret_key = request.META.get('HTTP_SECRET_KEY')
        vendor = VendorAuth.objects.filter(client_id=client_id, secret_key=secret_key, partner='Dwell').first()
        if not vendor:
            return False
        return True
