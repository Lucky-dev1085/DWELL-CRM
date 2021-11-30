from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from backend.api.models import Property
from backend.api.utils import hyphens


class PropertyLevelAccessAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        """
        Check the property level access by property hyphens.
        This will be base permission for Dwell, Manage, Site permissions.
        """
        if not super(PropertyLevelAccessAuthorized, self).has_permission(request, view):
            return False

        x_name = request.META.get('HTTP_X_NAME')
        # todo this permission should be removed once we move the property hyphens in url segment across all properties.
        if x_name and request.user:
            if x_name == 'call-rescores':
                if request.user.is_call_scorer:
                    request.property = x_name
                else:
                    raise ValidationError('You do not have permission to do this action.')
            else:
                try:
                    request.property = request.user.properties.get(external_id=hyphens(x_name))
                except Property.DoesNotExist:
                    raise ValidationError('Given x_name is not correct.')

        property_hyphens = request.parser_context['kwargs'].get('property_hyphens')
        if property_hyphens:
            try:
                request.property = Property.objects.get(external_id=property_hyphens)
            except Property.DoesNotExist:
                raise ValidationError('Given property hyphens is not correct.')

        return True
