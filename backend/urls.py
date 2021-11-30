from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.conf.urls import include, url

from backend.api.views import tour_scheduler, load_private_static
from .views import index, pusher_auth, ManualTaskTrigger, CompetePropertyManualTaskTrigger, \
    CompeteAlertManualTaskTrigger, CompeteMarketAuditExport, CompeteSubMarketAuditExport, SendILSTestEmail
from django.urls import re_path

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    path('admin/', admin.site.urls),
    path('<str:property_id>/tour-scheduler/', tour_scheduler),
    url(r'^admin/django-ses/', include('django_ses.urls')),
    url(r'^api/v1/', include('backend.api.urls')),
    url(r'^api/v1/', include('backend.site.urls')),
    url(r'^api/v1/compete/', include('backend.compete.urls')),
    url(r'^api/v1/hobbes/', include('backend.hobbes.urls')),
    url(r'^pusher/auth', pusher_auth),
    url(
        regex=r'^manual-action-trigger/$',
        view=ManualTaskTrigger.as_view(),
        name='manual-action-trigger'
    ),
    url(
        regex=r'^compete-property-manual-action-trigger/$',
        view=CompetePropertyManualTaskTrigger.as_view(),
        name='compete-property-manual-action-trigger'
    ),
    url(
        regex=r'^compete-alert-manual-action-trigger/$',
        view=CompeteAlertManualTaskTrigger.as_view(),
        name='compete-alert-manual-action-trigger'
    ),
    url(
        regex=r'^compete-market-audit-export/$',
        view=CompeteMarketAuditExport.as_view(),
        name='compete-market-audit-export'
    ),
    url(
        regex=r'^compete-submarket-audit-export/$',
        view=CompeteSubMarketAuditExport.as_view(),
        name='compete-submarket-audit-export'
    ),
    url(
        regex=r'^dwell-send-test-ils-email/$',
        view=SendILSTestEmail.as_view(),
        name='dwell-send-test-ils-email'
    ),
    re_path(r'^private_static/(?P<path>.*)$', load_private_static),
    url(r'', index),
]
