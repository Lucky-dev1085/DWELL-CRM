import pytz

from django.contrib import admin
from django.shortcuts import render
from django.utils.html import format_html

from backend.api.utils import require_confirmation
from .models import Property, Market, Submarket, Unit, Alert, AlertLog, AlertUnitRentLog, Report,\
    UnitRentReport, AlertLogDetail, UnitType, Comparison, History, UnitSession
from .form import PropertyActionForm, AlertActionForm, MarketAuditExportActionForm, SubMarketAuditExportActionForm


@require_confirmation
def handle_property_based_action(modeladmin, request, queryset):
    form = PropertyActionForm(initial=dict(properties=queryset))
    return render(request, 'compete/property_based_admin_action.html', {'form': form})


handle_property_based_action.short_description = 'Property based action'


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'type', 's3_name', 'website', 'submarket', 'mt_submarket',
                    'concession_description', 'concession_amount', 'average_rent', 'average_rent_per_sqft', 'occupancy',
                    'last_sync_date')
    search_fields = ('name',)
    actions = [handle_property_based_action]

    def last_sync_date(self, instance):
        last_record = instance.histories.all().order_by('-scrapping_date').first()
        return last_record.scrapping_date if last_record else None


@require_confirmation
def handle_market_audit_export(modeladmin, request, queryset):
    form = MarketAuditExportActionForm(initial=dict(markets=queryset))
    return render(request, 'compete/market_audit_export.html', {'form': form})


handle_market_audit_export.short_description = 'Market Audit Export'


@admin.register(Market)
class MarketAdmin(admin.ModelAdmin):
    list_display = ('name',)
    actions = [handle_market_audit_export]


@require_confirmation
def handle_submarket_audit_export(modeladmin, request, queryset):
    form = SubMarketAuditExportActionForm(initial=dict(submarkets=queryset))
    return render(request, 'compete/submarket_audit_export.html', {'form': form})


handle_submarket_audit_export.short_description = 'Submarket Audit Export'


@admin.register(Submarket)
class SubMarketAdmin(admin.ModelAdmin):
    list_display = ('name', 'market', 'is_mtr_group', 'mtr_group', 'is_mt_exclusive_group')
    list_filter = ('market__name',)
    actions = [handle_submarket_audit_export]


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = (
        'number', 'unit_type', 'floor_plan_name', 'beds', 'baths', 'unit_size', 'rent', 'available_date', 'updated',
        'on_market'
    )
    list_filter = ('property__name',)


@admin.register(UnitSession)
class UnitSessionAdmin(admin.ModelAdmin):
    list_display = (
        'property', 'unit', 'start_listing_date', 'end_listing_date'
    )
    list_filter = ('property__name',)


@admin.register(UnitType)
class UnitTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'units_count', 'beds', 'baths', 'average_rent', 'average_size')
    list_filter = ('property__name',)


@require_confirmation
def handle_alert_action(modeladmin, request, queryset):
    form = AlertActionForm(initial=dict(alerts=queryset))
    return render(request, 'compete/alert_admin_action.html', {'form': form})


handle_alert_action.short_description = 'Alert action'


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'track_assets_mode', 'status')
    actions = [handle_alert_action]


@admin.register(AlertLog)
class AlertLogAdmin(admin.ModelAdmin):
    list_display = ('alert', 'sent_on', 'start', 'end')
    list_filter = ('alert__name',)


@admin.register(AlertLogDetail)
class AlertLogDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'alert_log', 'occupancy', 'occupancy_last_week', 'occupancy_last_4_weeks',
                    'concession_amount', 'concession_amount_last_week', 'concession_amount_last_4_weeks',
                    'concession_avg_rent_percent',  'property', 'concession_avg_rent_percent_last_week',
                    'concession_avg_rent_percent_last_4_weeks', 'is_offering_concession')
    list_filter = ('alert_log__alert__name',)


@admin.register(AlertUnitRentLog)
class AlertUnitRentLogAdmin(admin.ModelAdmin):
    list_display = ('alert_log_detail', 'unit_type', 'average_rent', 'average_rent_last_week',
                    'average_rent_last_4_weeks')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('property', 'date', 'available_units', 'total_units', 'occupancy', 'concession',
                    'concession_avg_rent_percent')
    list_filter = ('property__name', 'date')


@admin.register(UnitRentReport)
class UnitRentReportAdmin(admin.ModelAdmin):
    list_display = ('unit_type', 'property', 'report', 'min_rent', 'max_rent', 'avg_rent', 'rent_sum', 'units_count',
                    'blended_rent')
    list_filter = ('property__name', 'report__date', 'unit_type',)
    search_fields = ('report__date',)

    def avg_rent(self, instance):
        if not instance.rent_sum or not instance.units_count:
            return None
        return instance.rent_sum / instance.units_count


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ('user', 'subject_asset_type', 'compared_asset_type',)
    list_filter = ('user',)


@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    list_display = ('property', 'scrapping_date', 'is_valuable', 'apartment', 'item_id', 'beds', 'baths',
                    'available_date', 'sqft', 'rent', 'address', 'phone')
    list_filter = ('scrapping_date', 'property')
    search_fields = ('scrapping_date', 'item_id',)


class PullScrappingDataState(History):
    class Meta:
        proxy = True


class PullScrappingDataStateAdmin(admin.ModelAdmin):
    list_display = ('property', 'scrapping_date', 'csv', 'last_modified', 'units_count')
    list_filter = ('scrapping_date', 'property')
    search_fields = ('property', 'item_id',)

    def get_queryset(self, request):
        property_ids = Property.objects.exclude(s3_name=None).values_list('id', flat=True)
        qs = super(PullScrappingDataStateAdmin, self).get_queryset(request).filter(property__in=property_ids)
        ids = qs.distinct('scrapping_date', 'property').values_list('id', flat=True)
        return qs.filter(id__in=ids).order_by('-scrapping_date')

    def csv(self, instance):
        s3_name = instance.property.s3_name
        file_name = f'{instance.scrapping_date.strftime("%m-%d-%Y")}_{s3_name.replace(" ", "-")}.csv'
        return format_html(
            '<a id="caller_recording" href="{url}" target="_blank">{file_name}</a>',
            url=f'/api/v1/compete/history/{instance.id}/download_csv/',
            file_name=file_name
        )

    def last_modified(self, instance):
        if not instance.s3_last_modified:
            return None
        return str(instance.s3_last_modified.astimezone(tz=pytz.timezone('America/Phoenix')))

    def units_count(self, instance):
        pulled_count = instance.property.histories.filter(
            scrapping_date=instance.scrapping_date, is_valuable=True
        ).count()
        return pulled_count


admin.site.register(PullScrappingDataState, PullScrappingDataStateAdmin)
