from django.urls import path
from rest_framework_nested import routers
from .views import PublicPageDataView, PromotionView, ResourceView, StatusItemView, PageDataView, image_upload, \
    get_customers, create_location, get_categories

site_routers = routers.SimpleRouter()

site_routers.register(r'public_page_data', PublicPageDataView, basename='public_page_data')
site_routers.register(prefix=r'(?P<property_hyphens>.+?)/promotion', viewset=PromotionView, basename='promotion')
site_routers.register(r'status_item', StatusItemView, basename='status_item')
site_routers.register(prefix=r'(?P<property_hyphens>.+?)/resource', viewset=ResourceView, basename='resource')
site_routers.register(prefix=r'(?P<property_hyphens>.+?)/page_data', viewset=PageDataView, basename='page_data')

urlpatterns = site_routers.urls + [
    path('image_upload/', image_upload, name='image_upload'),
    path('location_ce/customers/', get_customers, name='get_customers'),
    path('location_ce/categories/', get_categories, name='get_customers'),
    path('location_ce/add_location/', create_location, name='create_location'),
]
