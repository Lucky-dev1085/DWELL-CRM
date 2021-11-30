from django.db.models import Q
from rest_framework import serializers

from backend.api.models import ChatConversation
from backend.hobbes.models import SynonymMapping, Amenity, AmenityCategory, HobbesAutoTestQuestion, ChatReport, \
    ChatReportConversation, ChatReportMessage


class SynonymMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SynonymMapping
        fields = ['name', 'synonyms']


class AmenitySerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = Amenity
        fields = ['name', 'category']

    def get_category(self, instance):
        return instance.category.name if instance.category else None


class AmenityCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AmenityCategory
        fields = ['name', 'synonyms']


class HobbesAutoTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HobbesAutoTestQuestion
        fields = ['question', 'intent', 'entities', 'is_active']


class ChatReportSerializer(serializers.ModelSerializer):
    conversations = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    responses = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        kwargs['partial'] = True
        super(ChatReportSerializer, self).__init__(*args, **kwargs)

    class Meta:
        model = ChatReport
        fields = '__all__'

    def get_conversations(self, report):
        conversation_count = report.get_stats_of_conversations()
        return conversation_count

    def get_questions(self, report):
        question_count = 0
        action_choices = [action[1].upper() for action in ChatConversation.ACTION_CHOICES]
        q_list = [~Q(message__message__iexact=action) for action in action_choices]
        for chat in report.chats.all():
            question_count += chat.report_messages.filter(
                ~Q(message__question_result=None),
                Q(message__action=None),
                *q_list
            ).count()
        return question_count

    def get_responses(self, obj):
        request = self.context['request']
        support_status = request.query_params.get('support_filter')
        additional_filter_params = dict()
        if support_status and support_status != 'All':
            additional_filter_params['support_status'] = support_status.upper()
        responses = dict(total=obj.get_count_of_messages_status(**additional_filter_params))
        for status, _ in ChatReportMessage.MESSAGES_STATUSES:
            responses[status] = obj.get_stats_of_messages_status(status=status, **additional_filter_params)
        return responses


class ChatReportConversationListSerializer(serializers.ListSerializer):
    def to_representation(self, data):
        return_data = super(ChatReportConversationListSerializer, self).to_representation(data)
        sorted_data = sorted(return_data, key=lambda x: x['date'])
        for index, item in enumerate(sorted_data):
            item['index'] = index + 1
        return sorted_data


class ChatReportConversationSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    has_errors = serializers.SerializerMethodField()
    some_not_associated = serializers.SerializerMethodField()

    class Meta:
        model = ChatReportConversation
        fields = '__all__'
        list_serializer_class = ChatReportConversationListSerializer

    def get_date(self, obj):
        return obj.report_messages.all().order_by('message__date').last().message.date

    def get_has_errors(self, obj):
        return obj.report_messages.filter(status=ChatReportMessage.STATUS_INCORRECT).exists()

    def get_some_not_associated(self, obj):
        return obj.report_messages.filter(Q(status=None) | Q(support_status=None)).exists()


class ChatReportMessageSerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = ChatReportMessage
        fields = '__all__'

    def get_message(self, obj):
        return obj.message.message

    def get_type(self, obj):
        return obj.message.type

    def get_date(self, obj):
        return obj.message.date
