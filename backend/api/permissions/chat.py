from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission

from backend.api.models import Property, ChatProspect


class PublicProspectAccessAuthorized(BasePermission):
    def has_permission(self, request, view):
        client_id = request.META.get('HTTP_CLIENT_ID')
        if client_id:
            try:
                request.property = Property.objects.get(client_external_id=client_id)
                return True
            except Property.DoesNotExist:
                raise ValidationError('Invalid request.')
        return False


class PublicConversationAccessAuthorized(PublicProspectAccessAuthorized):
    def has_permission(self, request, view):
        if not super(PublicConversationAccessAuthorized, self).has_permission(request, view):
            return False
        try:
            request.prospect = ChatProspect.objects.get(
                external_id=request.parser_context.get('kwargs').get('prospect_pk'))
            return True
        except ChatProspect.DoesNotExist:
            raise ValidationError('Invalid request.')
