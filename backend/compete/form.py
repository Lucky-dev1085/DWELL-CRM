from django import forms

from backend.compete.models import Property, Alert, Market, Submarket
from django.contrib.admin.widgets import AdminDateWidget


class PropertyActionForm(forms.Form):
    TYPE_CHOICES = (
        (None, 'Select Type'),
        ('PULL_SCRAPPING_DATA', 'Pull Scrapping Data'),
        ('PULL_MT_DATA', 'Pull MT Properties Data'),
        ('POPULATE_DATA', 'Populate Data'),
        ('GENERATE_REPORT', 'Generate Report'),
        ('EXPORT_AUDIT', 'Export Audit'),
    )
    start_date = forms.DateField(widget=AdminDateWidget())
    end_date = forms.DateField(widget=AdminDateWidget(), required=False)
    type = forms.ChoiceField(choices=TYPE_CHOICES)
    properties = forms.ModelMultipleChoiceField(queryset=Property.objects.all(), widget=forms.SelectMultiple())


class AlertActionForm(forms.Form):
    date = forms.DateField(widget=AdminDateWidget())
    alerts = forms.ModelMultipleChoiceField(queryset=Alert.objects.all(), widget=forms.SelectMultiple())


class MarketAuditExportActionForm(forms.Form):
    start_date = forms.DateField(widget=AdminDateWidget())
    end_date = forms.DateField(widget=AdminDateWidget())
    markets = forms.ModelMultipleChoiceField(queryset=Market.objects.all(), widget=forms.SelectMultiple())


class SubMarketAuditExportActionForm(forms.Form):
    start_date = forms.DateField(widget=AdminDateWidget())
    end_date = forms.DateField(widget=AdminDateWidget())
    submarkets = forms.ModelMultipleChoiceField(queryset=Submarket.objects.all(), widget=forms.SelectMultiple())
