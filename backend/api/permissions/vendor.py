from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from backend.api.models import Property, VendorAuth, Lead
from backend.api.tasks.smartrent.get_prospect import get_prospect


class PublicLeadAccessAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        client_id = request.META.get('HTTP_CLIENT_ID')
        secret_key = request.META.get('HTTP_SECRET_KEY')
        vendor = VendorAuth.objects.filter(client_id=client_id, secret_key=secret_key).first()
        if not vendor:
            return False

        x_email = request.META.get('HTTP_X_EMAIL')
        if not x_email:
            return False

        try:
            request.property = Property.objects.get(shared_email=x_email)
        except Property.DoesNotExist:
            raise ValidationError('Given x_email is not correct.')

        request.vendor = vendor
        if request.method == 'DELETE':
            return False
        return True


class SmartRentTourAccessAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        prospect = request.data.get('prospect')
        # disable until they are ready to use public API
        # client_id = request.META.get('HTTP_CLIENT_ID')
        # secret_key = request.META.get('HTTP_SECRET_KEY')
        # vendor = VendorAuth.objects.filter(client_id=client_id, secret_key=secret_key).first()
        # if not vendor:
        #     return False
        #
        # x_group = request.META.get('HTTP_X_GROUP')
        # if not x_group:
        #     return False

        try:
            group_id = get_prospect(prospect.get('id')).get('group', {}).get('id')
            request.property = Property.objects.get(smart_rent_group_id=group_id)
        except Property.DoesNotExist:
            raise ValidationError('We are unable to find property.')
        return True


class PublicTourAccessAuthorized(PublicLeadAccessAuthorized):
    def has_permission(self, request, view):
        is_authorized = super(PublicTourAccessAuthorized, self).has_permission(request, view)
        if not is_authorized:
            return False

        lead_pk = request.parser_context['kwargs'].get('lead_pk')
        try:
            if lead_pk:
                lead = Lead.objects.filter(pk=lead_pk).first()
                if lead and lead.shared_leads.filter(property=request.property).exists():
                    request.lead = Lead.objects.get(pk=lead_pk)
                else:
                    request.lead = Lead.objects.get(property=request.property, pk=lead_pk)
            return True
        except Lead.DoesNotExist:
            raise ValidationError('The lead id is incorrect.')


class SitePropertyListAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        client_id = request.META.get('HTTP_CLIENT_ID')
        secret_key = request.META.get('HTTP_SECRET_KEY')
        vendor = VendorAuth.objects.filter(client_id=client_id, secret_key=secret_key).first()
        if not vendor:
            return False

        if request.method != 'GET':
            return False
        return True


class HobbesAccessAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        client_id = request.META.get('HTTP_CLIENT_ID')
        secret_key = request.META.get('HTTP_SECRET_KEY')
        vendor = VendorAuth.objects.filter(client_id=client_id, secret_key=secret_key, source='Hobbes').first()
        if not vendor:
            return False

        return True
