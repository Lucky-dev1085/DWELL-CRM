from rest_framework_nested import routers
from django.urls import path
from .views import hobbes_static_data, amenity_categories, hobbes_auto_test_questions
from .views.chat_report import ChatReportView
from .views.chat_report_conversation import ChatReportConversationViewSet
from .views.chat_report_message import ChatReportMessageViewSet

hobbes_routes = routers.SimpleRouter()

hobbes_routes.register(r'evaluation', ChatReportView, basename='report_evaluation')
hobbes_routes.register(r'chat_report/(?P<id>\d+)/chat_conversation', ChatReportConversationViewSet,
                       basename='chat_report_conversation')
hobbes_routes.register(r'chat_report_conversation/(?P<id>\d+)/chat_message', ChatReportMessageViewSet,
                       basename='chat_report_message')
urlpatterns = hobbes_routes.urls + [
    path('hobbes_static_data/', hobbes_static_data, name='hobbes_static_data'),
    path('amenity_categories/', amenity_categories, name='amenity_categories'),
    path('hobbes_auto_test_questions/', hobbes_auto_test_questions, name='amenity_categories'),
]
