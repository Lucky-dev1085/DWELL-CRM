from rest_framework.permissions import IsAuthenticated
from backend.api.models import Lead, ChatProspect, User
from .base import PropertyLevelAccessAuthorized


class DwellAuthorized(PropertyLevelAccessAuthorized):
    def has_permission(self, request, view):
        super(DwellAuthorized, self).has_permission(request, view)
        return bool(getattr(request, 'property', None))


class ReportAccessAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        result = super(ReportAccessAuthorized, self).has_permission(request, view)
        if result:
            return result
        return request.user.has_advanced_reports_access


class LeadLevelAccessAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        result = super(LeadLevelAccessAuthorized, self).has_permission(request, view)
        lead_pk = request.parser_context['kwargs'].get('lead_pk')
        if not result:
            return False
        try:
            if lead_pk:
                lead = Lead.objects.filter(pk=lead_pk).first()
                if lead and lead.shared_leads.filter(property=request.property).exists():
                    request.lead = Lead.objects.get(pk=lead_pk)
                else:
                    request.lead = Lead.objects.get(property=request.property, pk=lead_pk)
            return True
        except Lead.DoesNotExist:
            return False


class ProspectAccessAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        result = super(ProspectAccessAuthorized, self).has_permission(request, view)
        prospect_pk = request.parser_context['kwargs'].get('prospect_pk')
        if not result:
            return False
        try:
            request.prospect = ChatProspect.objects.filter(pk=prospect_pk).first()
            return True
        except ChatProspect.DoesNotExist:
            return False


class CompanyPolicesAuthorized(DwellAuthorized):
    def has_permission(self, request, view):
        if not super(CompanyPolicesAuthorized, self).has_permission(request, view):
            return False
        return request.user.role in [User.C_ADMIN, User.LL_ADMIN]


class CallRescoreAuthorized(IsAuthenticated):
    def has_permission(self, request, view):
        result = super(CallRescoreAuthorized, self).has_permission(request, view)
        if not result:
            return False
        if request.META.get('HTTP_X_NAME') != 'call-rescores':
            return False
        request.property = request.META.get('HTTP_X_NAME')
        return True
