from django.contrib import admin
from django import forms
from .models import HumanFirstSyncState, Amenity, AmenityCategory, SynonymMapping, HobbesAutoTestQuestion, \
    HobbesAutoTestResult, ChatReport, ChatReportConversation, ChatReportMessage


@admin.register(HumanFirstSyncState)
class HumanFirstSyncStateAdmin(admin.ModelAdmin):
    list_display = ('date', 'is_succeed',)


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_in_hobbes', 'category', 'is_supported',)


@admin.register(AmenityCategory)
class AmenityCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'synonyms', 'is_supported',)


@admin.register(SynonymMapping)
class SynonymMappingAdmin(admin.ModelAdmin):
    list_display = ('name', 'synonyms',)


class HobbesAutoTestQuestionForm(forms.ModelForm):
    positive_answer = forms.CharField(widget=forms.Textarea, required=False)
    negative_answer = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = HobbesAutoTestQuestion
        fields = '__all__'


@admin.register(HobbesAutoTestQuestion)
class HobbesAutoTestQuestionAdmin(admin.ModelAdmin):
    list_display = ('question', 'intent', 'entities', 'positive_answer', 'negative_answer', 'is_active',)
    search_fields = ('question', 'intent', 'entities', 'positive_answer', 'negative_answer',)
    list_filter = ('intent',)
    form = HobbesAutoTestQuestionForm


@admin.register(HobbesAutoTestResult)
class HobbesAutoTestResultAdmin(admin.ModelAdmin):
    list_display = ('property', 'date', 'file')
    list_filter = ('property__name',)


@admin.register(ChatReport)
class ChatReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'created', 'session_date', 'status')
    list_filter = ('property__name',)


@admin.register(ChatReportConversation)
class ChatReportConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'reviewed', 'correct_messages_count', 'messages_count', 'session_date')
    list_filter = ('conversation__property__name', 'report__session_date')

    def correct_messages_count(self, obj):
        return obj.report_messages.filter(status=ChatReportMessage.STATUS_CORRECT).count()

    def messages_count(self, obj):
        return obj.report_messages.count()

    def session_date(self, obj):
        return obj.report.session_date
    session_date.admin_order_field = 'conversation__report__session_date'


@admin.register(ChatReportMessage)
class ChatReportMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'message_text', 'session_date')
    list_filter = ('message__property__name', 'conversation__report__session_date')

    def message_text(self, obj):
        return obj.message.message

    def session_date(self, obj):
        return obj.conversation.report.session_date
    session_date.admin_order_field = 'conversation__report__session_date'
