from rest_framework_nested import routers
from django.urls import path
from .views import PropertyView, MarketView, SubMarketView, UnitView, PropertyBreakdownView, ExploreMarketView,\
    WatchlistView, AlertView, AlertLogDetailsView, rent_history, occupancy_history, concession_history, RentCompView,\
    ComparisonView, CompetitorSetView, AlertLogView, SubmarketBreakdownView, rent_compare_history, UnitSessionView, \
    HighestAverageRentsView, HighestOccupancyRatesView, PropertyListView
from .views.history import download_csv

compete_routes = routers.SimpleRouter()

compete_routes.register(r'properties', PropertyView, basename='property')
compete_routes.register(r'properties', PropertyListView, basename='property')
compete_routes.register(r'markets', MarketView, basename='market')
compete_routes.register(r'submarkets', SubMarketView, basename='submarket')

compete_routes.register(r'markets/(?P<market_pk>[^/.]+)/submarkets', SubmarketBreakdownView,
                        basename='submarket_breakdown')
compete_routes.register(r'properties/(?P<property_pk>[^/.]+)/units', UnitView, basename='property_unit')

compete_routes.register(r'properties/(?P<property_pk>[^/.]+)/competitors', PropertyBreakdownView,
                        basename='competitors')
compete_routes.register(r'submarkets/(?P<sub_market_pk>[^/.]+)/properties', PropertyBreakdownView,
                        basename='sub_market_properties')
compete_routes.register(r'submarkets/(?P<mtr_group_submarket_pk>[^/.]+)/mtr_group_submarkets', SubmarketBreakdownView,
                        basename='mtr_group_submarkets')
compete_routes.register(r'markets/(?P<market_pk>[^/.]+)/mtr_group_submarkets', SubmarketBreakdownView,
                        basename='overall_mtr_group_submarkets')

compete_routes.register(r'markets/(?P<market_pk>[^/.]+)/rent_comps', RentCompView, basename='market_rent_comps')
compete_routes.register(r'submarkets/(?P<sub_market_pk>[^/.]+)/rent_comps', RentCompView,
                        basename='sub_market_rent_comps')

compete_routes.register(r'explore_markets', ExploreMarketView, basename='explore_market')
compete_routes.register(r'watchlist', WatchlistView, basename='watchlist')
compete_routes.register(r'alerts', AlertView, basename='alert')
compete_routes.register(r'alert_logs/(?P<alert_log_pk>[^/.]+)/details', AlertLogDetailsView,
                        basename='alert_log_details')
compete_routes.register(r'alert_logs', AlertLogView, basename='alert_log')
compete_routes.register(r'comparisons', ComparisonView, basename='comparison')
compete_routes.register(r'competitor_set', CompetitorSetView, basename='competitor_set')
compete_routes.register(r'unit_sessions', UnitSessionView, basename='unit_session')

urlpatterns = compete_routes.urls + [
    path('properties/<int:property_pk>/rent_history/', rent_history, name='rent_history'),
    path('markets/<int:market_pk>/rent_history/', rent_history, name='rent_history'),
    path('submarkets/<int:sub_market_pk>/rent_history/', rent_history, name='rent_history'),

    path('properties/<int:property_pk>/occupancy_history/', occupancy_history, name='occupancy_history'),
    path('markets/<int:market_pk>/occupancy_history/', occupancy_history, name='occupancy_history'),
    path('submarkets/<int:sub_market_pk>/occupancy_history/', occupancy_history, name='occupancy_history'),

    path('properties/<int:property_pk>/concession_history/', concession_history, name='concession_history'),
    path('markets/<int:market_pk>/concession_history/', concession_history, name='concession_history'),
    path('submarkets/<int:sub_market_pk>/concession_history/', concession_history, name='concession_history'),

    path('properties/<int:property_pk>/rent_compare_history/', rent_compare_history, name='rent_compare_history'),
    path('history/<int:history_pk>/download_csv/', download_csv, name='concession_history'),

    path('comparisons/<int:comparison_pk>/highest_average_rents/', HighestAverageRentsView.as_view({'get': 'list'}), name='highest_average_rents'),
    path('comparisons/<int:comparison_pk>/highest_occupancy/', HighestOccupancyRatesView.as_view({'get': 'list'}), name='highest_occupancy'),
]
