import pytz
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from django.conf import settings

from rest_framework import serializers

from backend.api.models import ChatProspect, ChatConversation, User, AgentRequest
from backend.api.utils import get_image_url


class BasicChatConversationSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()
    agent_avatar = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    class Meta:
        model = ChatConversation

    def get_agent_name(self, instance):
        return instance.agent.first_name if instance.agent else None

    def get_agent_avatar(self, instance):
        if instance.agent and instance.agent.avatar and hasattr(instance.agent.avatar, 'url'):
            return get_image_url(instance.agent.avatar.url)

    def get_source(self, instance):
        if instance.prospect.source == 'SITE':
            return instance.prospect.property.domain
        else:
            return 'mark-taylor.com'


class ChatConversationSerializer(BasicChatConversationSerializer):
    available_agents_count = serializers.SerializerMethodField()

    class Meta(BasicChatConversationSerializer.Meta):
        fields = '__all__'

    def get_available_agents_count(self, instance):
        available_agents = User.objects.filter(
            properties__in=[instance.property], is_available=True, is_team_account=True
        )
        return available_agents.count()


class ChatPublicConversationSerializer(BasicChatConversationSerializer):
    class Meta(BasicChatConversationSerializer.Meta):
        exclude = ('property', 'id', 'created', 'updated', 'prospect')


class ChatProspectSerializer(serializers.ModelSerializer):
    active_agent = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_date = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    has_guest_card = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    joined_agents = serializers.SerializerMethodField()
    last_prospect_message_date = serializers.SerializerMethodField()
    last_prospect_message = serializers.SerializerMethodField()
    last_prospect_formatted_message = serializers.SerializerMethodField()
    last_greeting_date = serializers.SerializerMethodField()
    has_not_seen_new_message = serializers.SerializerMethodField()
    last_visit_page_name = serializers.SerializerMethodField()
    has_active_tour = serializers.SerializerMethodField()
    should_display_in_chat = serializers.SerializerMethodField()
    tour_date = serializers.SerializerMethodField()

    class Meta:
        model = ChatProspect
        fields = '__all__'

    def get_should_display_in_chat(self, instance):
        filtered_conversations = instance.conversations.filter(
            Q(type=ChatConversation.TYPE_JOINED) |
            Q(type=ChatConversation.TYPE_AGENT_REQUEST) |
            Q(action=ChatConversation.ACTION_SCHEDULE_TOUR))
        if instance.lead or instance.guest_card or filtered_conversations.count():
            return True
        return False

    def get_unread_count(self, instance):
        return instance.conversations.filter(is_read=False).count()

    def get_has_not_seen_new_message(self, instance):
        return bool(instance.conversations.filter(is_shown_in_modal=False).count())

    def get_last_message(self, instance):
        return instance.last_conversation.message if instance.last_conversation else None

    def get_last_message_date(self, instance):
        return instance.last_conversation.date.isoformat() if instance.last_conversation else None

    def get_last_prospect_message(self, instance):
        return instance.last_prospect_conversation.message if instance.last_prospect_conversation else None

    def get_last_prospect_formatted_message(self, instance):
        conversation = instance.last_prospect_conversation
        if not conversation:
            return None
        if conversation.is_form_message:
            if '<div class="schedule-form" id="tour-card">' in conversation.message or \
                    '<div class="calendar-links">' in conversation.message:
                return 'Tour card completed'
            if '<div class="schedule-form">' in conversation.message:
                return 'Guest card completed'
            return None
        return conversation.message

    def get_last_prospect_message_date(self, instance):
        return instance.last_prospect_conversation.date.isoformat() if instance.last_prospect_conversation else None

    def get_name(self, instance):
        return instance.name_label

    def get_has_guest_card(self, instance):
        lead = None
        if instance.lead:
            lead = instance.lead
        elif instance.task and instance.task.lead:
            lead = instance.task.lead
        elif instance.guest_card:
            lead = instance.guest_card
        if lead and (lead.email or lead.phone_number):
            return True
        return False

    def get_has_active_tour(self, instance):
        tour = None
        if instance.task:
            tour = instance.task
        if tour and tour.tour_date and tour.tour_date > timezone.now().astimezone(tz=pytz.UTC):
            return True
        return False

    def get_active_agent(self, instance):
        return instance.active_agent.pk if instance.active_agent else None

    def get_is_online(self, instance):
        last_prospect_fired_message = instance.last_prospect_conversation
        if instance.last_conversation and instance.last_conversation.type == ChatConversation.TYPE_GREETING:
            # The first greeting will be shown when user open the chat box, which meant user is using with chat.
            last_prospect_fired_message = instance.last_conversation
        if not last_prospect_fired_message:
            return False
        is_online = last_prospect_fired_message.date >= timezone.now().astimezone(tz=pytz.UTC) - timedelta(minutes=5) \
                     and instance.is_active
        return is_online

    def get_joined_agents(self, instance):
        joined_agents = instance.conversations.filter(type=ChatConversation.TYPE_JOINED).values_list('agent_id', flat=True)
        return list(dict.fromkeys(joined_agents))

    def get_last_greeting_date(self, instance):
        last_greeting = instance.conversations.filter(type=ChatConversation.TYPE_GREETING).order_by('-date').first()
        return last_greeting.date.isoformat() if last_greeting else None

    def get_last_visit_page_name(self, instance):
        page_url = instance.last_visit_page or ''
        parsed_url = ''
        if instance.source == 'MT':
            if instance.property.mark_taylor_base_url:
                from urllib.parse import urlsplit
                path = urlsplit(instance.property.mark_taylor_base_url).path
                if path in page_url:
                    parsed_url = page_url[len(path):]
        else:
            parsed_url = page_url.replace('/', '')

        page_name = ''
        if parsed_url:
            page_name = ' '.join([word.capitalize() for word in parsed_url.replace('/', '').split('-')])
        return f'{page_name if page_name else "Home"} Page'

    def get_tour_date(self, instance):
        return instance.task.tour_date.astimezone(tz=instance.property.timezone).strftime(
            f'%A, %m/%d/%Y at %I:%M %p ({instance.property.timezone})') \
            if instance.task and instance.task.tour_date else None

    def update(self, instance, validated_data):
        if 'is_active' in validated_data.keys():
            if instance.is_active and not validated_data.get('is_active'):
                from backend.api.tasks import update_prospect_availability
                update_prospect_availability.apply_async([instance.pk],
                                                         countdown=settings.PROSPECT_CHAT_AVAILABILITY_OFFSET)
                validated_data['unloaded_time'] = timezone.now()
                validated_data['is_active'] = True

            if validated_data.get('is_active') and instance.unloaded_time:
                validated_data['unloaded_time'] = None
        instance = super(ChatProspectSerializer, self).update(instance, validated_data)
        return instance


class AgentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentRequest
        fields = '__all__'


class ChatConversationCommunicationSerializer(BasicChatConversationSerializer):
    class Meta:
        model = ChatConversation
        fields = ('id', 'agent_name', 'date', 'type', 'message', 'agent_avatar', 'source')
