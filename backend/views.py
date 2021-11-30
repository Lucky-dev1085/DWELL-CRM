import json
import pandas as pd
from pandas import ExcelWriter
from io import BytesIO
from datetime import timedelta
from pusher import Pusher
from django import forms
from django.db.models import Sum, Min, Max, Q
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from django.shortcuts import render

from backend.api.form import PropertyBasedActionForm, ILSTestEmailForm
from backend.compete.form import PropertyActionForm as CompetePropertyActionForm, AlertActionForm, \
    MarketAuditExportActionForm, SubMarketAuditExportActionForm
from backend.api.tasks.reports.get_reports_data import compute_all_reports
from backend.api.tasks.convert_ils_emails_to_leads import convert_ils_emails_to_leads
from backend.compete.tasks import check_benchmark_alert, check_threshold_alert, pull_scrapping_data, populate_data, \
    generate_report, generate_history_for_mt_properties
from .settings.read_environment import ACCESS_TOKEN_LIFETIME, GTM_ID, GA_ID

from backend.api.models import Property, User, Call, ILSEmail
from backend.compete.models import UnitType, UnitRentReport, Report


def index(request):
    sentry_dsn = ''
    if getattr(settings, 'FE_SENTRY_KEY', None) and getattr(settings, 'FE_SENTRY_PROJECT', None):
        sentry_dsn = 'https://{}@sentry.io/{}'.format(settings.FE_SENTRY_KEY, settings.FE_SENTRY_PROJECT)
    context = {
        'timeout': ACCESS_TOKEN_LIFETIME.total_seconds(),
        'sentry_dsn': sentry_dsn,
        'pusher_key': settings.PUSHER_KEY,
        'pusher_cluster': settings.PUSHER_CLUSTER,
        'crm_host': settings.CRM_HOST,
        'gtm_id': GTM_ID,
        'ga_id': GA_ID,
    }
    return render(request, 'index.html', context)


class PusherAuthForm(forms.Form):
    """
    Pusher auth form

    """
    socket_id = forms.CharField(required=True)
    channel_name = forms.CharField(required=True)


@csrf_exempt
@require_POST
def pusher_auth(request):
    """
    Pusher auth - see http://pusher.com/docs/authenticating_users

    :param request:
    :raises backend.api.models.Property.DoesNotExist: Http404
    """
    form = PusherAuthForm(request.POST)

    if not form.is_valid():
        return HttpResponseBadRequest(form.errors.as_json())

    socket_id = form.cleaned_data['socket_id']
    channel_name = form.cleaned_data['channel_name']

    # remove private- from channel name to get id
    model = channel_name.split('-')[1]
    id = channel_name[(len(model) + 9):]

    try:
        if model == 'user':
            User.objects.get(id=id)
        if model == 'property':
            Property.objects.get(external_id=id)
    except (Property.DoesNotExist, User.DoesNotExist):
        raise Http404

    pusher = Pusher(app_id=settings.PUSHER_APP_ID, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

    ret = pusher.authenticate(channel=channel_name, socket_id=socket_id)

    return HttpResponse(json.dumps(ret), content_type='application/json')


class ManualTaskTrigger(FormView):
    template_name = 'property_based_admin_action.html'
    form_class = PropertyBasedActionForm
    success_url = reverse_lazy('admin:api_property_changelist')

    def form_valid(self, form):
        properties = form.cleaned_data['properties']
        start_date = form.cleaned_data['start_date']
        end_date = form.cleaned_data['end_date']
        type = form.cleaned_data['type']

        end_date = str(end_date) if end_date else None
        property_ids = [id[0] for id in list(properties.values_list('pk'))]

        if type == 'Report':
            compute_all_reports.delay(property_ids, str(start_date), end_date)

        if type == 'CallExport':
            calls = Call.objects.filter(date__gte=start_date, date__lte=end_date,
                                        property__in=properties).order_by('property', 'date')
            import djqscsv
            return djqscsv.render_to_csv_response(
                calls.all().defer().values('property__name', 'source', 'duration', 'recording_url', 'call_result',
                                           'call_category', 'tracking_number', 'date'))
        return super(ManualTaskTrigger, self).form_valid(form)


class CompeteAlertManualTaskTrigger(FormView):
    template_name = 'compete/alert_admin_action.html'
    form_class = AlertActionForm
    success_url = reverse_lazy('admin:compete_alert_changelist')

    def form_valid(self, form):
        alerts = form.cleaned_data['alerts']
        date = form.cleaned_data['date']

        benchmark_alert_ids = list(alerts.filter(type='BENCHMARK').values_list('pk', flat=True))
        threshold_alert_ids = list(alerts.filter(type='THRESHOLD').values_list('pk', flat=True))

        if len(benchmark_alert_ids):
            check_benchmark_alert.delay(str(date), benchmark_alert_ids)

        if len(threshold_alert_ids):
            check_threshold_alert.delay(str(date), threshold_alert_ids)

        return super(CompeteAlertManualTaskTrigger, self).form_valid(form)


class CompeteAuditExportMixin:
    def generate_row(self, filter_date, properties):
        rows = []
        for ind, unit_type in enumerate(UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),)):
            row = [filter_date] if ind == 0 else [None]

            unit_type_filter = Q()
            unit_type_name_filter = Q()
            if unit_type[0] != 'COMBINED':
                unit_type_filter = Q(unit_type=unit_type[0])
                unit_type_name_filter = Q(name=unit_type[0])

            unit_reports = UnitRentReport.objects.filter(unit_type_filter) \
                .filter(property__in=properties, report__date=filter_date)

            unit_report = unit_reports.aggregate(
                sum_units_count=Sum('units_count'),
                sum_rent_sum=Sum('rent_sum'),
                sum_sqft_sum=Sum('sqft_sum'),
                min_min_rent=Min('min_rent'),
                max_max_rent=Max('max_rent'),
                average_rent=Sum('rent_sum') / Sum('units_count'),
                average_sqft=Sum('sqft_sum') / Sum('units_count'),
            )

            # Unit Type
            row.append(unit_type[1])

            # Total Units Count
            total_units_count = UnitType.objects.filter(property__in=properties) \
                .filter(unit_type_name_filter).aggregate(
                sum_units_count=Sum('units_count')
            ).get('sum_units_count')
            row.append(total_units_count)

            # Available Units Count
            units_count = unit_report.get('sum_units_count')
            row.append(units_count)

            # Rent Sum
            row.append(unit_report.get('sum_rent_sum'))

            # Sqft Sum
            row.append(unit_report.get('sum_sqft_sum'))

            # Min Rent
            row.append(unit_report.get('min_min_rent'))

            # Max Rent
            row.append(unit_report.get('max_max_rent'))

            # Occupancy
            occupancy = None
            if total_units_count and units_count:
                occupancy = round(
                    (total_units_count - units_count) / total_units_count * 100, 2
                )
            row.append(occupancy)

            # Average Rent
            row.append(unit_report.get('average_rent'))

            # Average Sqft
            row.append(unit_report.get('average_sqft'))

            reports = Report.objects.filter(property__in=properties, date=filter_date)
            sum_concession = reports.aggregate(Sum('concession')).get('concession__sum')
            count = reports.exclude(Q(concession=None) | Q(concession=0)).count()
            concession = round(sum_concession / count, 2) if sum_concession and count else None

            sum_concession_avg_rent_percent = reports.aggregate(
                Sum('concession_avg_rent_percent')
            ).get('concession_avg_rent_percent__sum')
            count = reports.exclude(Q(concession_avg_rent_percent=None) | Q(concession_avg_rent_percent=0)).count()
            concession_avg_rent_percent = round(sum_concession_avg_rent_percent / count, 2) \
                if sum_concession_avg_rent_percent and count else None

            # Concession
            if unit_type[0] == 'COMBINED':
                row.append(concession)
                row.append(concession_avg_rent_percent)
            else:
                row.append(None)
                row.append(None)

            rows.append(row)
        return rows

    def get_xlsx_response(self, dfs, filename):
        sio = BytesIO()
        with ExcelWriter(sio, engine='xlsxwriter') as writer:
            for key in dfs.keys():
                dfs[key].to_excel(writer, key)
            writer.save()

        workbook = sio.getvalue()

        from django.http import HttpResponse

        response = HttpResponse(
            workbook, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=%s' % filename
        return response


class CompeteMarketAuditExport(FormView, CompeteAuditExportMixin):
    template_name = 'compete/market_audit_export.html'
    form_class = MarketAuditExportActionForm
    success_url = reverse_lazy('admin:compete_market_changelist')

    def form_valid(self, form):
        markets = form.cleaned_data['markets']
        start_date = form.cleaned_data['start_date']
        end_date = form.cleaned_data['end_date'] or start_date
        dfs = {}

        for market in markets:
            filter_date = end_date
            columns = ['Date', 'Type', 'Total Units Count', 'Available Units Count', 'Rent Sum', 'Sqft Sum',
                       'Min Rent', 'Max Rent', 'Occupancy', 'Average Rent', 'Average Sqft', 'Concession',
                       'Concession Avg Rent Percent']
            rows = [columns]
            while filter_date >= start_date:
                reports = Report.objects.filter(property__in=market.properties, date=filter_date)
                if not reports.exists():
                    filter_date = filter_date - timedelta(days=1)
                    continue

                rows += self.generate_row(filter_date, market.properties)
                rows.append([] * len(columns))
                filter_date = filter_date - timedelta(days=1)

            dfs[market.name] = pd.DataFrame(rows)

        return self.get_xlsx_response(dfs, 'export-market-audit.xlsx')


class CompeteSubMarketAuditExport(FormView, CompeteAuditExportMixin):
    template_name = 'compete/submarket_audit_export.html'
    form_class = SubMarketAuditExportActionForm
    success_url = reverse_lazy('admin:compete_submarket_changelist')

    def form_valid(self, form):
        submarkets = form.cleaned_data['submarkets']
        start_date = form.cleaned_data['start_date']
        end_date = form.cleaned_data['end_date'] or start_date
        dfs = {}

        for submarket in submarkets:
            filter_date = end_date
            columns = ['Date', 'Type', 'Total Units Count', 'Available Units Count', 'Rent Sum', 'Sqft Sum',
                       'Min Rent', 'Max Rent', 'Occupancy', 'Average Rent', 'Average Sqft', 'Concession',
                       'Concession Avg Rent Percent']
            rows = [columns]
            while filter_date >= start_date:
                reports = Report.objects.filter(property__in=submarket.properties.all(), date=filter_date)
                if not reports.exists():
                    filter_date = filter_date - timedelta(days=1)
                    continue

                rows += self.generate_row(filter_date, submarket.properties.all())
                rows.append([] * len(columns))
                filter_date = filter_date - timedelta(days=1)

            dfs[submarket.name] = pd.DataFrame(rows)

        return self.get_xlsx_response(dfs, 'export-submarket-audit.xlsx')


class CompetePropertyManualTaskTrigger(FormView, CompeteAuditExportMixin):
    template_name = 'compete/property_based_admin_action.html'
    form_class = CompetePropertyActionForm
    success_url = reverse_lazy('admin:compete_property_changelist')

    def form_valid(self, form):
        properties = form.cleaned_data['properties']
        start_date = form.cleaned_data['start_date']
        end_date = form.cleaned_data['end_date'] or start_date
        type = form.cleaned_data['type']
        property_ids = list(properties.values_list('pk', flat=True))
        if type == 'PULL_SCRAPPING_DATA':
            while start_date <= end_date:
                pull_scrapping_data.delay(str(start_date), False, property_ids)
                start_date = start_date + timedelta(days=1)

        if type == 'PULL_MT_DATA':
            while start_date <= end_date:
                generate_history_for_mt_properties.delay(str(start_date), False, property_ids)
                start_date = start_date + timedelta(days=1)

        if type == 'POPULATE_DATA':
            populate_data.delay(str(start_date), property_ids)

        if type == 'GENERATE_REPORT':
            while start_date <= end_date:
                generate_report.delay(str(start_date), property_ids)
                start_date = start_date + timedelta(days=1)

        if type == 'EXPORT_AUDIT':
            dfs = {}

            for property in properties:
                filter_date = end_date
                columns = ['Date', 'Type', 'Total Units Count', 'Available Units Count', 'Rent Sum', 'Sqft Sum',
                           'Min Rent', 'Max Rent', 'Occupancy', 'Average Rent', 'Average Sqft', 'Concession',
                           'Concession Avg Rent Percent']
                rows = [columns]
                while filter_date >= start_date:
                    reports = Report.objects.filter(property=property, date=filter_date)
                    if not reports.exists():
                        filter_date = filter_date - timedelta(days=1)
                        continue

                    rows += self.generate_row(filter_date, properties.filter(id=property.id))
                    rows.append([] * len(columns))
                    filter_date = filter_date - timedelta(days=1)

                dfs[property.name] = pd.DataFrame(rows)

            return self.get_xlsx_response(dfs, 'export-submarket-audit.xlsx')

        return super(CompetePropertyManualTaskTrigger, self).form_valid(form)


class SendILSTestEmail(FormView):
    template_name = 'dwell/property/send_test_ils_email_template.html'
    form_class = ILSTestEmailForm
    success_url = reverse_lazy('admin:api_property_changelist')

    def form_valid(self, form):
        first_name = form.cleaned_data['first_name']
        last_name = form.cleaned_data['last_name']
        email = form.cleaned_data['email']
        phone_number = form.cleaned_data['phone_number']
        source = form.cleaned_data['source']
        property = form.cleaned_data['property']
        beds = form.cleaned_data['beds']
        baths = form.cleaned_data['baths']
        pets = form.cleaned_data['pets']
        desired_rent = form.cleaned_data['desired_rent']
        desired_lease_term = form.cleaned_data['desired_lease_term']
        move_in_date = form.cleaned_data['move_in_date']
        comments = form.cleaned_data['comments']

        ils_email_address = f'{property.external_id}.{source}@ils.dwell.io'
        body = f'Return-Path: <bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net>\r\nLocation: Bellagio\r\n' \
               f'First Name: {first_name} \r\n' \
               f'Last Name: {last_name}\r\n' \
               f'Address: \r\nCity: \r\nState: \r\nZip: \r\nCountry: \r\n' \
               f'Phone: {phone_number}\r\n' \
               f'Email Address: {email}\r\n' \
               f'Desired Bedrooms: {beds}\r\n' \
               f'Desired Bathrooms: {baths}\r\n' \
               f'Pets: {pets}\r\n' \
               f'Budget: {desired_rent}\r\n' \
               f'Desired Lease Term: {desired_lease_term}\r\n' \
               f'Desired Move In: {move_in_date}\r\n' \
               f'Comments: {comments}\r\n'

        ILSEmail.objects.create(email=ils_email_address, body=body)
        convert_ils_emails_to_leads(1)

        return super(SendILSTestEmail, self).form_valid(form)
