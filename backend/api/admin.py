import pytz

from datetime import datetime, timedelta

from django.contrib import admin
from django.db import IntegrityError
from django.db.models import Count, Q
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.html import format_html
from import_export import resources
from import_export.admin import ExportActionMixin
from import_export.fields import Field
from import_export.formats import base_formats
from rangefilter.filter import DateRangeFilter

from backend.api.form import PropertyBasedActionForm, PhoneNumberForm, LeadForm, UserForm, EmailMessageForm, \
    NoteForm, PortfolioForm, PropertyAdminForm, TaskForm, ScoredCallAdminForm, DuplicateEmailTemplates, HolidayForm, \
    RealPageEmployeeForm, ResManEmployeeForm, DemoTourForm, ILSTestEmailForm
from backend.api.models import (
    Property, Client, Customer, FloorPlan, Unit, Lead, Task, LeadsFilter, LeadsFilterItem, Note, Activity, Conversion,
    EmailTemplate, ProspectSource, Notification, AssignLeadOwners, ProspectLostReason, EmailMessage, EmailLabel, Column,
    Roommate, Portfolio, Report, EmailAttachment, Competitor, Survey, Call, User, ILSEmail, ResManEmployee,
    BusinessHours, PhoneNumber, SMSContent, CallScoringQuestion, ScoredCall, SourceMatching, VendorAuth,
    CurrentResident, Calendar, Event, ChatProspect, ChatConversation, AgentRequest, Holiday, PetType, RealPageEmployee,
    ReasonForMoving, RelationshipType, PetWeight, PriceRange, PropertyPolicy, RentableItem, LeaseDefault,
    LeaseDefaultSetting, LeaseDocument, DemoTour, DemoEvent, ChatTemplate
)
from backend.api.tasks import reset_nylas_integration
from backend.api.tasks.calls.pull_calls_data import transcribe_recording
from backend.api.tasks.convert_ils_emails_to_leads import pull_lead_from_ils
from backend.api.utils import require_confirmation
from backend.hobbes.tasks import run_hobbes_auto_test


class BaseAdmin(admin.ModelAdmin):
    change_list_template = 'admin/backend/change_list.html'
    change_form_template = 'admin/backend/change_form.html'


@admin.register(Client, LeadsFilterItem, Column, EmailAttachment,
                Competitor, Survey)
class CustomAdmin(BaseAdmin):
    pass


@require_confirmation
def remove_nylas_integration(modeladmin, request, queryset):
    for property in queryset:
        reset_nylas_integration.delay(property.pk)


remove_nylas_integration.short_description = 'Remove nylas integration'


@require_confirmation
def handle_property_based_action(modeladmin, request, queryset):
    form = PropertyBasedActionForm(initial=dict(properties=queryset))
    return render(request, 'property_based_admin_action.html', {'form': form})


handle_property_based_action.short_description = 'Property based action'


@require_confirmation
def run_hobbes_check(modeladmin, request, queryset):
    run_hobbes_auto_test.delay(list(queryset.values_list('pk', flat=True)))


@require_confirmation
def send_test_ils_email(modeladmin, request, queryset):
    form = ILSTestEmailForm(initial=dict(property=queryset.first()))
    return render(request, 'dwell/property/send_test_ils_email_template.html', {'form': form})


handle_property_based_action.short_description = 'Property based action'

run_hobbes_check.short_description = 'Run hobbes check'


def duplicate_templates(modeladmin, request, queryset):
    form = None
    if 'apply' in request.POST:
        form = DuplicateEmailTemplates(request.POST)

        if form.is_valid():
            properties = form.cleaned_data['properties']
            for item in queryset:
                for property in properties:
                    if item.property != property:
                        item.id = None
                        item.property = property
                        try:
                            item.save()
                        except IntegrityError:
                            pass

            modeladmin.message_user(request,
                                    'Selected template has been duplicated')
            return HttpResponseRedirect(request.get_full_path())
    if not form:
        form = DuplicateEmailTemplates(initial={'_selected_action': queryset.values_list('id', flat=True)})
    return render(request,
                  'email/duplicate_email/duplicate_email.html',
                  context={'items': queryset, 'form': form, 'title': 'Duplicate selected email templates'})


duplicate_templates.short_description = 'Duplicate selected email templates'


@require_confirmation
def export_leads(modeladmin, request, queryset):
    for property in queryset:
        import djqscsv
        return djqscsv.render_to_csv_response(
            property.leads.all().defer().values(
                'first_name', 'last_name', 'phone_number', 'source__name', 'stage', 'status', 'origin', 'move_in_date',
                'desired_rent', 'lease_term', 'moving_reason', 'best_contact_method', 'best_contact_time', 'occupants',
                'beds', 'baths', 'pets', 'pet_type', 'vehicles', 'washer_dryer_method', 'floor_plan__plan'))


export_leads.short_description = 'Export leads'


class PropertyAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'name', 'phone_number', 'domain', 'resman_property_id', 'resman_account_id',
                    'real_page_pmc_id', 'real_page_site_id', 'smart_rent_group_id', 'has_chat_setup', 'status',
                    'shared_email', 'has_contact_details', 'is_released', 'nylas_status', 'total_leads',
                    'sync_failed_leads', 'sync_condition_not_meet_leads', 'invalid_employee_leads',
                    'sync_failed_no_reason', 'duplicated_leads_by_emails', 'last_pms_sync_time',
                    'missing_email_templates')
    actions = [remove_nylas_integration, handle_property_based_action, export_leads, run_hobbes_check,
               send_test_ils_email]
    form = PropertyAdminForm

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def has_chat_setup(self, instance):
        if instance.platform != 'BOTH':
            return 'Not Dwell Property'
        misc = instance.page_data.filter(section='SEO').first()
        if not misc:
            return None
        script_snippet = f'api/v1/load_dwelljs/dwell.js?client_id={instance.client_external_id}'
        if script_snippet not in misc.values.get('aditionalScript'):
            return 'Chat script is not embed'

        if not instance.mark_taylor_base_url:
            return 'MT configuration is not setup'

        tour_types = ['IN_PERSON_TOUR_CONFIRMATION', 'GUIDED_VIRTUAL_TOUR_CONFIRMATION']
        if instance.email_templates.filter(type__in=tour_types).count() != 2:
            return 'Tour reminder template is not setup'

        return 'Ready for use'

    def missing_email_templates(self, instance):
        tour_types = ['TOUR_CONFIRMATION', 'IN_PERSON_TOUR_CONFIRMATION', 'GUIDED_VIRTUAL_TOUR_CONFIRMATION']
        templates = instance.email_templates.filter(type__in=tour_types).values_list('type', flat=True)
        missing_templates = [type for type in tour_types if type not in templates]
        if len(missing_templates):
            return ', '.join(missing_templates)

        return ''

    def sync_failed_leads(self, instance):
        return instance.leads.filter(
            pms_sync_status='FAILURE', acquisition_date__gte=datetime.now() - timedelta(days=30)
        ).count()

    def sync_condition_not_meet_leads(self, instance):
        return instance.leads.filter(
            pms_sync_status='NOT_STARTED', acquisition_date__gte=datetime.now() - timedelta(days=30)
        ).count()

    def sync_failed_no_reason(self, instance):
        """
        This value should be always empty. Just checking if we'd have edge case.
        """
        return instance.leads.filter(
            pms_sync_status='NOT_STARTED', pms_sync_condition_lack_reason=None,
            acquisition_date__gte=datetime.now() - timedelta(days=30)
        ).count()

    def duplicated_leads_by_emails(self, instance):
        duplicates = instance.leads.filter(acquisition_date__gte=datetime.now() - timedelta(days=30)).exclude(
            Q(email=None) | Q(email='')
        ).values('email').annotate(email_count=Count('email')).filter(email_count__gt=1)
        return duplicates.count()

    def invalid_employee_leads(self, instance):
        return instance.leads.filter(
            pms_sync_status='NOT_STARTED',
            pms_sync_condition_lack_reason__contains='invalid lead owner',
            acquisition_date__gte=datetime.now() - timedelta(days=30)
        ).count()

    def total_leads(self, instance):
        return instance.leads.filter(acquisition_date__gte=datetime.now() - timedelta(days=30)).count()


admin.site.register(Property, PropertyAdmin)


class ActivityAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'type', 'lead', 'property', 'type', 'content')
    list_filter = ('property__name',)


admin.site.register(Activity, ActivityAdmin)


@require_confirmation
def send_sms_test_message(modeladmin, request, queryset):
    lead = queryset.first()
    return render(request, 'send_sms_test_message.html', {'lead': lead.pk})


class LeadAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'move_in_date', 'owner', 'source',
                    'last_source', 'stage', 'status', 'property', 'pms_sync_condition_lack_reason', 'pms_sync_status',
                    'pms_sync_date', 'created', 'acquisition_date')
    list_filter = ('property__name',)
    search_fields = ('email', 'first_name', 'last_name', 'phone_number', 'id',)
    readonly_fields = ('acquisition_date',)
    actions = [send_sms_test_message]
    form = LeadForm


admin.site.register(Lead, LeadAdmin)


class TaskAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'type', 'status', 'due_date', 'lead', 'old_title')
    list_filter = ('property__name',)
    search_fields = ('id', 'type',)
    form = TaskForm


admin.site.register(Task, TaskAdmin)


class ProspectSourceAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('external_id', 'name', 'property', 'is_paid')
    list_filter = ('property__name', 'name')


admin.site.register(ProspectSource, ProspectSourceAdmin)


class LostProspectReasonAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('external_id', 'name', 'property')
    list_filter = ('name',)


admin.site.register(ProspectLostReason, LostProspectReasonAdmin)


class FloorPlanAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('plan', 'property', 'available', 'bedrooms', 'bathrooms', 'square_footage', 'min_rent', 'max_rent',
                    'group_id')
    list_filter = ('property__name',)


admin.site.register(FloorPlan, FloorPlanAdmin)


class UnitsAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('unit', 'floor_plan', 'property', 'status', 'smart_rent_unit_id', 'can_be_toured')
    list_filter = ('property__name', 'floor_plan')


admin.site.register(Unit, UnitsAdmin)


class EmailLabelAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('name', 'external_id', 'property')
    list_filter = ('property__name',)


admin.site.register(EmailLabel, EmailLabelAdmin)


class EmailMessageAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('sender_email', 'receiver_email', 'lead', 'nylas_message_id', 'property', 'email_labels', 'subject',
                    'is_archived', 'is_guest_card_email', 'date')
    list_filter = ('property__name',)
    search_fields = ('sender_email', 'receiver_email', 'subject',)
    form = EmailMessageForm

    def email_labels(self, obj):
        return '\n'.join([p.name for p in obj.labels.all()])


admin.site.register(EmailMessage, EmailMessageAdmin)


class ConversionAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'type', 'property')
    list_filter = ('property__name',)
    search_fields = ('email', 'first_name', 'last_name', 'phone_number',)


admin.site.register(Conversion, ConversionAdmin)


class RoommateAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'relationship', 'property')
    list_filter = ('property__name',)
    search_fields = ('email', 'first_name', 'last_name', 'phone_number',)


admin.site.register(Roommate, RoommateAdmin)


class ReportResource(resources.ModelResource):
    property = Field(attribute='property__name', column_name='Property')
    date = Field(attribute='date', column_name='Date')
    chat_conversations = Field(attribute='chat_conversations', column_name='Total chat conversations')
    agent_chat_conversations = Field(attribute='agent_chat_conversations',
                                     column_name='Conversations transferred to live agent')
    agent_chat_conversations_percent = Field(column_name='Percent of chat conversations transferred to live agent')
    repeat_chat_conversations = Field(attribute='repeat_chat_conversations',
                                      column_name='Repeat chat conversation engagements')

    total_actions_count = Field(attribute='total_actions_count',
                                column_name='Starter prompt actions initiated')
    view_photos_count = Field(attribute='view_photos_count', column_name='"View Photos" actions initiated')
    schedule_tour_count = Field(attribute='schedule_tour_count',
                                column_name='"Schedule a Tour" actions initiated')
    reschedule_tour_count = Field(attribute='reschedule_tour_count',
                                  column_name='"Reschedule/Edit Tour" actions initiated')
    cancel_tour_count = Field(attribute='cancel_tour_count', column_name='"Cancel Tour" actions initiated')
    check_prices_count = Field(attribute='check_prices_count',
                               column_name='"Check Prices/Availability" actions initiated')

    visitor_chat_engagement = Field(attribute='visitor_chat_engagement', column_name='Visitor chat engagement')
    tours_scheduled = Field(attribute='tours_scheduled', column_name='Tours scheduled')
    guests_created = Field(attribute='guests_created', column_name='Guest creation ')

    hobbes_chat_conversations = Field(attribute='hobbes_chat_conversations', column_name='Hobbes total questions asked')
    hobbes_answered_questions = Field(attribute='hobbes_answered_questions',
                                      column_name='Hobbes questions successfully answered')
    hobbes_answered_questions_percent = Field(column_name='Hobbes success rate')
    question_count = Field(attribute='question_count', column_name='"I have a question" actions initiated')

    class Meta:
        model = Report
        fields = ('property', 'date', 'chat_conversations', 'agent_chat_conversations',
                  'agent_chat_conversations_percent', 'repeat_chat_conversations', 'total_actions_count',
                  'view_photos_count', 'schedule_tour_count', 'reschedule_tour_count', 'cancel_tour_count',
                  'check_prices_count', 'visitor_chat_engagement', 'tours_scheduled', 'guests_created',
                  'hobbes_chat_conversations', 'hobbes_answered_questions', 'hobbes_answered_questions_percent',
                  'question_count',)
        export_order = ('property', 'date', 'chat_conversations', 'agent_chat_conversations',
                        'agent_chat_conversations_percent', 'repeat_chat_conversations', 'total_actions_count',
                        'view_photos_count', 'schedule_tour_count', 'reschedule_tour_count', 'cancel_tour_count',
                        'check_prices_count', 'visitor_chat_engagement', 'tours_scheduled', 'guests_created',
                        'hobbes_chat_conversations', 'hobbes_answered_questions', 'hobbes_answered_questions_percent',
                        'question_count',)

    def dehydrate_agent_chat_conversations_percent(self, instance):
        return round((instance.agent_chat_conversations * 100) / instance.chat_conversations, 1) \
            if instance.chat_conversations != 0 else 0

    def dehydrate_total_actions_count(self, instance):
        return instance.view_photos_count + instance.schedule_tour_count + instance.reschedule_tour_count + \
               instance.cancel_tour_count + instance.check_prices_count

    def dehydrate_hobbes_answered_questions_percent(self, instance):
        return round((instance.hobbes_answered_questions * 100) / instance.hobbes_chat_conversations, 1) \
            if instance.hobbes_chat_conversations != 0 else 0


class ReportAdmin(ExportActionMixin, BaseAdmin):
    resource_class = ReportResource
    list_per_page = 100
    list_display = [field.name for field in Report._meta.get_fields()]
    list_filter = (
        ('date', DateRangeFilter), 'property__name',
    )

    def get_export_formats(self):
        """
        Returns available export formats.
        """
        formats = (
            base_formats.XLS,
            base_formats.XLSX,
        )
        return [f for f in formats if f().can_export()]


admin.site.register(Report, ReportAdmin)


class AssignLeadOwnersAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property',)


admin.site.register(AssignLeadOwners, AssignLeadOwnersAdmin)


class EmailTemplateAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'type', 'name')
    list_filter = ('property__name',)
    actions = [duplicate_templates, ]


admin.site.register(EmailTemplate, EmailTemplateAdmin)


@require_confirmation
def transcribe_call(modeladmin, request, queryset):
    for call in queryset:
        transcribe_recording(call.pk)


transcribe_call.short_description = 'Transcribe call recording'


class CallAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'property', 'source', 'prospect_phone_number', 'call_id', 'lead', 'call_category', 'date',
                    'duration', 'call_result', 'is_removed')
    list_filter = ('property__name',)
    search_fields = ('id', 'prospect_phone_number', 'call_id', 'source')
    actions = [transcribe_call, ]


admin.site.register(Call, CallAdmin)


class LeadsFilterAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'property', 'filter_type', 'name')
    list_filter = ('property__name',)


admin.site.register(LeadsFilter, LeadsFilterAdmin)


class NotificationAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'content', 'type', 'object_content_type')
    list_filter = ('property__name',)
    search_fields = ('content',)


admin.site.register(Notification, NotificationAdmin)


class PortfolioAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('name', 'type')
    list_filter = ('properties__name',)
    form = PortfolioForm


admin.site.register(Portfolio, PortfolioAdmin)


class UserAdmin(BaseAdmin):
    form = UserForm
    list_per_page = 100
    list_display = ('id', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'is_team_account')
    list_filter = ('properties__name',)
    search_fields = ('id', 'first_name', 'last_name', 'email', 'phone_number')


admin.site.register(User, UserAdmin)


@require_confirmation
def generate_lead_from_email(modeladmin, request, queryset):
    for ils_email in queryset.filter(lead=None):
        source = external_id = None
        if 'apartmentlist@dwell.io' in ils_email.email:
            source = 'ApartmentList.com'
            external_id = ils_email.email[0:-len('.apartmentlist@dwell.io')]
        if 'yelp@dwell.io' in ils_email.email:
            external_id = ils_email.email[0:-len('.yelp@dwell.io')]
            source = 'Yelp.com'
        if 'mt@dwell.io' in ils_email.email:
            external_id = ils_email.email[0:-len('.mt@dwell.io')]
            source = 'Mark-Taylor.com'
        if 'apartmentlist@ils.dwell.io' in ils_email.email:
            source = 'ApartmentList.com'
            external_id = ils_email.email[0:-len('.apartmentlist@ils.dwell.io')]
        if 'yelp@ils.dwell.io' in ils_email.email:
            external_id = ils_email.email[0:-len('.yelp@ils.dwell.io')]
            source = 'Yelp.com'
        if 'mt@ils.dwell.io' in ils_email.email:
            external_id = ils_email.email[0:-len('.mt@ils.dwell.io')]
            source = 'Mark-Taylor.com'
        if source:
            lead = pull_lead_from_ils(ils_email.body, external_id, source)
            lead.created = ils_email.created
            lead.save()
            ils_email.lead = lead
            ils_email.save()


generate_lead_from_email.short_description = 'Generate lead from email'


class ILSEmailAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'email', 'created', 'lead_page_url',)
    list_filter = ('email',)
    search_fields = ('id', 'body',)
    actions = [generate_lead_from_email, ]

    def lead_page_url(self, instance):
        return format_html('<a href="{url}">{url}</a>', url=instance.lead.page_url) if instance.lead else None


admin.site.register(ILSEmail, ILSEmailAdmin)


class ResManEmployeeAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('email', 'external_id', 'name', 'property', 'user',)
    list_filter = ('property',)
    search_fields = ('email',)
    form = ResManEmployeeForm


admin.site.register(ResManEmployee, ResManEmployeeAdmin)


class CallScoringQuestionAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('category', 'question', 'status', 'weight', 'order', 'average_score', 'created',)
    readonly_fields = ('created',)
    id_for_formfield = None

    def get_readonly_fields(self, request, obj=None):
        return ('created',) if obj else ()

    def average_score(self, instance):
        scored_calls = ScoredCall.objects.all()
        affirmative_scored_calls = scored_calls.filter(questions__in=[instance])
        result = round(affirmative_scored_calls.count() * 100 / scored_calls.count(), 1) \
            if scored_calls.count() != 0 else 0.0
        return '{}%'.format(result)

    def get_form(self, request, obj=None, **kwargs):
        self.id_for_formfield = obj.id if obj else None
        return super(CallScoringQuestionAdmin, self).get_form(request, obj, **kwargs)

    def formfield_for_choice_field(self, db_field, request=None, **kwargs):
        if db_field.name == 'order':
            questions_count = CallScoringQuestion.objects.count()
            kwargs['choices'] = ((x, x) for x in
                                 range(1, questions_count + 1 if self.id_for_formfield else questions_count + 2))
        return db_field.formfield(**kwargs)


admin.site.register(CallScoringQuestion, CallScoringQuestionAdmin)


class ScoredCallAdmin(BaseAdmin):
    list_per_page = 100
    list_filter = ('property__name',)
    search_fields = ('call__prospect_phone_number', 'property__name', 'call_scorer__email',)
    list_display = ('caller', 'call_datetime', 'property', 'score', 'call_scorer', 'call_length', 'scored_at',
                    'rescore_status', 'prev_score')
    readonly_fields = ('caller_recording', 'call_datetime',)
    form = ScoredCallAdminForm

    def get_fields(self, request, obj=None):
        if obj:
            fields = (
                'caller_recording', 'property', 'call_datetime', 'questions', 'call_scorer', 'omitted_questions',
                'agent'
            )
        else:
            fields = ('property', 'call_date', 'call', 'questions', 'call_scorer', 'omitted_questions', 'agent')
        return fields

    def call_datetime(self, instance):
        return instance.call.date.astimezone(tz=instance.property.timezone).strftime('%B %-d, %Y, %-I:%M %p')

    call_datetime.short_description = 'Call date'
    call_datetime.admin_order_field = 'call__date'

    def caller(self, instance):
        return instance.call.prospect_phone_number

    def caller_recording(self, instance):
        return format_html(
            '<a id="caller_recording" href="{url}" target="_blank">{phone}</a>',
            url=instance.call.recording.url,
            phone=instance.call.prospect_phone_number
        )

    caller_recording.short_description = 'Сaller'

    def call_length(self, instance):
        return str(timedelta(seconds=instance.call.duration))

    def score(self, instance):
        questions = CallScoringQuestion.objects.all()
        overall_weights = sum(
            [question.weight for question in questions.exclude(pk__in=instance.omitted_questions.all())]
        )
        call_weights = sum([question.weight for question in instance.questions.all()])
        return '{}%'.format(round(call_weights * 100 / overall_weights, 1) if overall_weights != 0 else 0.0)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'call_scorer':
            kwargs['queryset'] = User.objects.filter(is_call_scorer=True).order_by('email')
        elif db_field.name == 'agent':
            scored_call_id = request.resolver_match.kwargs['object_id']
            scored_call = ScoredCall.objects.get(pk=scored_call_id)
            kwargs['queryset'] = User.objects.filter(properties__name=scored_call.property.name).order_by('email')

        return super(ScoredCallAdmin, self).formfield_for_foreignkey(db_field, request, **kwargs)

    class Media:
        js = ('js/scored_call_fields_filtering.js',)


admin.site.register(ScoredCall, ScoredCallAdmin)


class BusinessHoursAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'weekday', 'start_time', 'end_time', 'is_workday',)
    list_filter = ('property__name',)


admin.site.register(BusinessHours, BusinessHoursAdmin)


@require_confirmation
def send_sms_message_from_phone_number(modeladmin, request, queryset):
    phone_number = queryset.first()
    return render(request, 'send_sms_message_from_phone_number.html',
                  {'phone_number_pk': phone_number.pk, 'phone_number': phone_number.phone_number})


class PhoneNumberAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'type', 'source', 'property', 'twilio_sid')
    list_filter = ('property__name', 'source',)
    search_fields = ('phone_number',)
    form = PhoneNumberForm
    actions = [send_sms_message_from_phone_number]
    change_form_template = 'add_phone_number.html'


admin.site.register(PhoneNumber, PhoneNumberAdmin)


class SMSContentAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('sender_number', 'receiver_number', 'message', 'created')


admin.site.register(SMSContent, SMSContentAdmin)


class NoteAdmin(BaseAdmin):
    list_display = ('lead', 'text', 'actor', 'property', 'created')
    search_fields = ('text', 'actor__email')
    list_filter = ('property__name',)
    form = NoteForm


admin.site.register(Note, NoteAdmin)


class SourceMatchingAdmin(BaseAdmin):
    list_display = ('id', 'LH_source', 'ResMan_source')


admin.site.register(SourceMatching, SourceMatchingAdmin)


class CustomerAdmin(BaseAdmin):
    list_display = ('id', 'customer_name',)

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions


admin.site.register(Customer, CustomerAdmin)


class VendorAuthAdmin(BaseAdmin):
    list_display = ('id', 'client_id', 'secret_key', 'partner', 'source')


admin.site.register(VendorAuth, VendorAuthAdmin)


class CurrentResidentAdmin(BaseAdmin):
    list_display = ('id', 'person_id', 'home_phone', 'work_phone', 'mobile_phone')
    list_filter = ('property__name',)


admin.site.register(CurrentResident, CurrentResidentAdmin)


class CalendarAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('name', 'external_id', 'property')
    list_filter = ('property__name',)


admin.site.register(Calendar, CalendarAdmin)


class EventAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('title', 'external_id', 'time', 'owner', 'status', 'property', 'calendar')
    list_filter = ('property__name',)


admin.site.register(Event, EventAdmin)


class ChatProspectAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('number', 'external_id', 'last_visit_page', 'lead', 'guest_card', 'is_archived', 'active_agent',
                    'is_active', 'unloaded_time')
    list_filter = ('property__name',)


admin.site.register(ChatProspect, ChatProspectAdmin)


class ChatConversationAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('prospect', 'date', 'type', 'agent', 'message', 'action', 'to_agent')
    list_filter = ('property__name',)
    search_fields = ('prospect__pk',)


admin.site.register(ChatConversation, ChatConversationAdmin)


class AgentRequestAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'prospect', 'property', 'conversation', 'user', 'is_declined', 'is_active', 'date',
                    'created', 'updated')
    list_filter = ('property__name',)

    def conversation(self, instance):
        if not instance.prospect:
            return None
        return format_html(
            f'<a href="/admin/api/chatconversation/?q={instance.prospect.id}">Conversations of {instance.prospect}</a>'
        )


admin.site.register(AgentRequest, AgentRequestAdmin)


class LiveAgentRequestState(AgentRequest):
    class Meta:
        proxy = True


class LiveAgentRequestStateAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('prospect', 'property', 'joined_agent', 'has_agents_not_available_message', 'date')
    list_filter = ('property__name',)

    def get_queryset(self, request):
        qs = super(LiveAgentRequestStateAdmin, self).get_queryset(request)
        ids = qs.distinct('prospect', 'date').values_list('pk', flat=True)
        return qs.filter(id__in=ids).order_by('-date')

    def joined_agent(self, instance):
        prospect = instance.prospect
        if not prospect:
            return None
        conversation = prospect.conversations.filter(
            type='JOINED', date__gte=instance.date, date__lte=instance.date + timedelta(seconds=30)
        ).first()
        if not conversation:
            return None
        return conversation.agent.email

    def has_agents_not_available_message(self, instance):
        prospect = instance.prospect
        if not prospect:
            return None
        conversation = prospect.conversations.filter(
            message__icontains='there are no agents available at this time',
            date__gte=instance.date, date__lte=instance.date + timedelta(seconds=60)
        ).first()
        if not conversation:
            return False
        return True


admin.site.register(LiveAgentRequestState, LiveAgentRequestStateAdmin)


class HolidayAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('name', 'holiday_date', 'country')
    form = HolidayForm

    def holiday_date(self, instance):
        return instance.date.strftime('%m/%d') if instance.date else None

    holiday_date.short_description = 'Date'


admin.site.register(Holiday, HolidayAdmin)


class PetTypeAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'external_id', 'name', 'is_allowed',)
    list_filter = ('property__name',)


admin.site.register(PetType, PetTypeAdmin)


class RealPageEmployeeAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'external_id', 'name', 'user')
    list_filter = ('property__name',)
    form = RealPageEmployeeForm


admin.site.register(RealPageEmployee, RealPageEmployeeAdmin)


class ReasonForMovingAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'external_id', 'reason',)
    list_filter = ('property__name',)


admin.site.register(ReasonForMoving, ReasonForMovingAdmin)


class RelationshipTypeAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'name', 'value',)
    list_filter = ('property__name',)


admin.site.register(RelationshipType, RelationshipTypeAdmin)


class PetWeightAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'name', 'external_id',)
    list_filter = ('property__name',)


admin.site.register(PetWeight, PetWeightAdmin)


class PriceRangeAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'name', 'external_id',)
    list_filter = ('property__name',)


admin.site.register(PriceRange, PriceRangeAdmin)


class PropertyPolicyAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property',)
    list_filter = ('property__name',)


admin.site.register(PropertyPolicy, PropertyPolicyAdmin)


class LeaseDefaultAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'lease_document',)
    list_filter = ('property__name',)
    change_form_template = 'lease_default_form.html'

    def get_queryset(self, request):
        qs = super(LeaseDefaultAdmin, self).get_queryset(request)
        return qs.filter(is_default_setting=False)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        self.exclude = ('is_default_setting',)
        return super(LeaseDefaultAdmin, self).change_view(request, object_id, form_url='', extra_context=None)

    def add_view(self, request, form_url='', extra_context=None):
        self.exclude = ('is_default_setting',)
        return super(LeaseDefaultAdmin, self).add_view(request, form_url='', extra_context=None)


admin.site.register(LeaseDefault, LeaseDefaultAdmin)


class LeaseDefaultSettingAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property',)
    list_filter = ('property__name',)

    def get_queryset(self, request):
        qs = super(LeaseDefaultSettingAdmin, self).get_queryset(request)
        return qs.filter(is_default_setting=True)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        self.exclude = ('lease_document', 'customer',)
        return super(LeaseDefaultSettingAdmin, self).change_view(request, object_id, form_url='', extra_context=None)

    def add_view(self, request, form_url='', extra_context=None):
        self.exclude = ('lease_document', 'customer',)
        return super(LeaseDefaultSettingAdmin, self).add_view(request, form_url='', extra_context=None)


admin.site.register(LeaseDefaultSetting, LeaseDefaultSettingAdmin)


class LeaseDocumentAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property',)
    list_filter = ('property__name',)


admin.site.register(LeaseDocument, LeaseDocumentAdmin)


class RentableItemAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property',)
    list_filter = ('property__name',)
    fields = ('property', 'lease_document')


admin.site.register(RentableItem, RentableItemAdmin)


class HobbesConversations(ChatConversation):
    class Meta:
        proxy = True
        ordering = ['-date']


class HobbesConversationsStateAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'date', 'message', 'question_result', 'hobbes_answer',)
    list_filter = ('property__name',)
    search_fields = ('prospect__pk',)

    def get_queryset(self, request):
        qs = super(HobbesConversationsStateAdmin, self).get_queryset(request)
        return qs.exclude(question_result=None).order_by('date')


admin.site.register(HobbesConversations, HobbesConversationsStateAdmin)


class DemoTourAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'demo_datetime', 'company',
                    'is_cancelled', 'create_date')
    form = DemoTourForm

    def demo_datetime(self, instance):
        return instance.date.astimezone(tz=pytz.timezone('US/Central')).strftime('%B %-d, %Y, %-I:%M %p')

    demo_datetime.short_description = 'Demo Date'
    demo_datetime.admin_order_field = 'date'

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['local'] = True
        return super(DemoTourAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)

    def create_date(self, instance):
        return instance.created.astimezone(tz=pytz.timezone('US/Central')).strftime('%B %-d, %Y, %-I:%M %p')

    create_date.short_description = 'Create Date'
    create_date.admin_order_field = 'created'


admin.site.register(DemoTour, DemoTourAdmin)


class DemoEventAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('title', 'demo_datetime')

    def demo_datetime(self, instance):
        return instance.time.astimezone(tz=pytz.timezone('US/Central')).strftime('%B %-d, %Y, %-I:%M %p')

    demo_datetime.short_description = 'Demo Date'
    demo_datetime.admin_order_field = 'time'


admin.site.register(DemoEvent, DemoEventAdmin)


class ChatTemplateAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('property', 'name')
    list_filter = ('property__name',)


admin.site.register(ChatTemplate, ChatTemplateAdmin)


class ILSEmailAddress(Property):
    class Meta:
        proxy = True


class ILSEmailAddressAdmin(BaseAdmin):
    list_per_page = 100
    list_display = ('name', 'mt', 'yelp', 'apartment_list')

    def mt(self, instance):
        return f'{instance.external_id}.mt@ils.dwell.io'

    def yelp(self, instance):
        return f'{instance.external_id}.yelp@ils.dwell.io'

    def apartment_list(self, instance):
        return f'{instance.external_id}.apartmentlist@ils.dwell.io'


admin.site.register(ILSEmailAddress, ILSEmailAddressAdmin)
