from django.contrib import admin
from django.contrib.postgres import fields
from django_json_widget.widgets import JSONEditorWidget

from .models import PageData, Promotion, Resource


@admin.register(PageData)
class PageDataAdmin(admin.ModelAdmin):
    formfield_overrides = {
        fields.JSONField: {'widget': JSONEditorWidget},
    }
    list_display = ('section', 'property',)
    list_filter = ('property__name',)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    formfield_overrides = {
        fields.JSONField: {'widget': JSONEditorWidget},
    }
    list_display = ('promotion_html', 'property', 'is_active',)
    list_filter = ('property__name',)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    formfield_overrides = {
        fields.JSONField: {'widget': JSONEditorWidget},
    }
    list_display = ('property', 'section',)
    list_filter = ('property__name',)
