from django.conf.urls import url
from django.urls import path, include
from rest_framework_nested import routers

from .views import (PropertyView, UserView, ClientView, CustomerView, ConversionView, LeadView, LeadsFilterView,
                    TaskView, NoteView, ActivityView, EmailTemplateView, NotificationView, AssignLeadOwnersView,
                    EmailMessageView, EmailLabelView, ColumnView, RoommateView, PortfolioView, ReportsView,
                    ProspectSourceView, CompetitorView, SurveyView, CallView, ActiveLeadsFilterView, BusinessHoursView,
                    PropertyAdminView, PropertyAdminUpdateView, PhoneNumberViewSet, SMSContentView, sms_track,
                    sms_status_callback, ScoredCallView, CallScoringQuestionView, PublicLeadView, CalendarView,
                    book_tour, reschedule_tour, cancel_tour, ChatConversationView, chat_settings,
                    ChatProspectView, tour_available_time, dwell_chat_script, hobbies_sources, text_me,
                    AgentRequestView, timed_out_agent_request_prospect, LeaseDefaultView, PropertyPolicyView,
                    RentableItemView, capture_data, CompanyPolicesView, hobbes_training_sources, SmartRentView,
                    DemoTourView, ChatTemplateView, PublicTourView, DurationPricingView)
from backend.api.views.token_auth import TokenObtainPairAndProcessXNameView
from backend.api.views.nylas_auth import authorize

# root level routers
api_routers = routers.SimpleRouter()

api_routers.register(r'properties', PropertyView, basename='property')
api_routers.register(r'users', UserView, basename='user')
api_routers.register(r'clients', ClientView, basename='client')
api_routers.register(r'customers', CustomerView, basename='customer')
api_routers.register(r'conversions', ConversionView, basename='conversion')
api_routers.register(r'leads', LeadView, basename='lead')
api_routers.register(r'public_leads', PublicLeadView, basename='public_lead')
api_routers.register(r'leads_filters', LeadsFilterView, basename='leads_filter')
api_routers.register(r'tasks', TaskView, basename='task')
api_routers.register(r'notes', NoteView, basename='notes')
api_routers.register(r'email_templates', EmailTemplateView, basename='email_templates')
api_routers.register(r'notifications', NotificationView, basename='notifications')
api_routers.register(r'assign_lead_owners', AssignLeadOwnersView, basename='assign_lead_owners')
api_routers.register(r'email_messages', EmailMessageView, basename='email_messages')
api_routers.register(r'email_labels', EmailLabelView, basename='email_labels')
api_routers.register(r'columns', ColumnView, basename='columns')
api_routers.register(r'portfolios', PortfolioView, basename='portfolios')
api_routers.register(r'reports', ReportsView, basename='reports')
api_routers.register(r'prospect_sources', ProspectSourceView, basename='prospect_sources')
api_routers.register(r'calls', CallView, basename='calls')
api_routers.register(r'competitors', CompetitorView, basename='competitors')
api_routers.register(r'surveys', SurveyView, basename='surveys')
api_routers.register(r'active_filter', ActiveLeadsFilterView, basename='active_filter')
api_routers.register(r'business_hours', BusinessHoursView, basename='business_hours')
api_routers.register(r'phone_number', PhoneNumberViewSet, basename='phone_number')
api_routers.register(r'call_scoring_questions', CallScoringQuestionView, basename='call_scoring_questions')
api_routers.register(r'scored_calls', ScoredCallView, basename='scored_calls')
api_routers.register(r'calendars', CalendarView, basename='calendars')
api_routers.register(r'prospects', ChatProspectView, basename='prospects')
api_routers.register(r'agent_requests', AgentRequestView, basename='agent_requests')
api_routers.register(r'lease_defaults', LeaseDefaultView, basename='lease_defaults')
api_routers.register(r'property_polices', PropertyPolicyView, basename='property_polices')
api_routers.register(r'rentable_items', RentableItemView, basename='rentable_items')
api_routers.register(r'company_polices', CompanyPolicesView, basename='company_polices')
api_routers.register(r'smart_rent', SmartRentView, basename='smart_rent')
api_routers.register(r'demo_tours', DemoTourView, basename='demo_tours')
api_routers.register(r'chat_templates', ChatTemplateView, basename='chat_template')
api_routers.register(r'duration_pricing', DurationPricingView, basename='duration_pricing')

leads_router = routers.NestedSimpleRouter(api_routers, r'leads', lookup='lead')
leads_router.register(r'tasks', TaskView, basename='lead_task')
leads_router.register(r'notes', NoteView, basename='lead_note')
leads_router.register(r'activities', ActivityView, basename='lead_activity')
leads_router.register(r'roommates', RoommateView, basename='lead_roommate')
leads_router.register(r'sms', SMSContentView, basename='lead_sms')
leads_router.register(r'prospects', ChatProspectView, basename='lead_prospect')
leads_router.register(r'public_tours', PublicTourView, basename='public_tour')

prospects_router = routers.NestedSimpleRouter(api_routers, r'prospects', lookup='prospect')
prospects_router.register(r'conversations', ChatConversationView, basename='conversation')

api_urls = api_routers.urls + leads_router.urls + prospects_router.urls

urlpatterns = api_urls + [
    path('token/', TokenObtainPairAndProcessXNameView.as_view(), name='token_obtain_pair'),
    url('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('nylas_authorize/', authorize, name='nylas_auth'),
    path('property/<int:pk>/', PropertyAdminView.as_view(), name='retrieve-property'),
    path('property/update/<int:pk>/', PropertyAdminUpdateView.as_view(), name='update-property'),
    path('nylas_authorize/', authorize, name='nylas_auth'),
    path('sms_track/', sms_track, name='sms_track'),
    path('sms_callback/', sms_status_callback, name='sms_status_callback'),

    path('chat_settings/', chat_settings, name='chat_settings'),
    path('book_tour/', book_tour, name='book_tour'),
    path('reschedule_tour/', reschedule_tour, name='reschedule_tour'),
    path('cancel_tour/', cancel_tour, name='cancel_tour'),
    path('tour_available_time/', tour_available_time, name='tour_available_time'),
    path('hobbies_sources/', hobbies_sources, name='hobbies_sources'),
    path('hobbes_training_sources/', hobbes_training_sources, name='hobbes_training_sources'),
    url('dwell.js/?$', dwell_chat_script, name='dwell_chat_script'),
    path('timed_out_agent_request_prospect/', timed_out_agent_request_prospect, name='timed_out_agent_request_prospect'),
    path('capture_data/', capture_data, name='capture_data'),
    path('text_me/', text_me, name='text_me'),
]
