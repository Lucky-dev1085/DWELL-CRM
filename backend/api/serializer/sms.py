import phonenumbers

from rest_framework import serializers
from rest_framework.exceptions import APIException

from backend.api.twilio_utils import send_twilio_message
from backend.api.models import SMSContent, PhoneNumber
from backend.api.utils import get_image_url


class SMSContentSerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()
    lead_owner = serializers.SerializerMethodField()
    is_team_message = serializers.ReadOnlyField()
    unread_count = serializers.SerializerMethodField()
    agent_avatar = serializers.SerializerMethodField()

    class Meta:
        model = SMSContent
        fields = '__all__'

    def create(self, validated_data):
        try:
            request = self.context['request']
            lead = request.lead
            validated_data['property'] = request.property
            validated_data['lead'] = lead
            validated_data['agent'] = request.user
            validated_data['sender_number'] = PhoneNumber.objects.get(property=request.property,
                                                                      type='SMS').phone_number
            receiver_number = phonenumbers.parse(lead.phone_number, 'US')
            validated_data['receiver_number'] = '+{}{}'.format(receiver_number.country_code,
                                                               receiver_number.national_number)
            message = send_twilio_message(request.data['message'], validated_data['sender_number'],
                                          validated_data['receiver_number'])
            if message:
                validated_data['date'] = message.date_created
                validated_data['twilio_sid'] = message.sid
                validated_data['is_read'] = True
                sms = super(SMSContentSerializer, self).create(validated_data)
                lead.last_followup_date = message.date_created
                lead.save()
                return sms
            raise APIException('Failed to send message')
        except Exception as e:
            raise APIException(e)

    def get_lead_name(self, instance):
        return instance.lead.name if instance.lead else None

    def get_lead_owner(self, instance):
        return instance.lead.owner.email if instance.lead.owner else None

    def get_unread_count(self, instance):
        return SMSContent.objects.filter(lead__owner=instance.lead.owner, is_read=False).count()

    def get_agent_name(self, instance):
        return instance.agent.name if instance.agent else instance.property.name

    def get_agent_avatar(self, instance):
        if instance.agent and instance.agent.avatar and hasattr(instance.agent.avatar, 'url'):
            return get_image_url(instance.agent.avatar.url)


class SMSContentCommunicationSerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = SMSContent
        fields = ('id', 'lead_name', 'agent_name', 'message', 'date')

    def get_lead_name(self, instance):
        return instance.lead.name if instance.lead else None

    def get_agent_name(self, instance):
        return instance.agent.name if instance.agent else instance.property.name
