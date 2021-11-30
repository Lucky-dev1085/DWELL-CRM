from rest_framework import serializers

from backend.api.models import EmailMessage, EmailLabel, EmailAttachment


class EmailAttachmentSerializer(serializers.ModelSerializer):
    attachment = serializers.SerializerMethodField()

    def get_attachment(self, instance):
        return instance.attachment.url if instance.attachment else None

    class Meta:
        model = EmailAttachment
        exclude = ['external_id']


class EmailMessageSerializer(serializers.ModelSerializer):
    attachments = EmailAttachmentSerializer(many=True, required=False)
    is_property_communication = serializers.SerializerMethodField()
    formatted_sender_name = serializers.SerializerMethodField()
    formatted_receiver_name = serializers.SerializerMethodField()

    def get_is_property_communication(self, instance):
        return instance.sender_email == instance.property.shared_email

    def get_formatted_sender_name(self, instance):
        if instance.sender_email == instance.property.shared_email:
            return instance.property.name
        return instance.lead.name if instance.lead else instance.sender_name

    def get_formatted_receiver_name(self, instance):
        if instance.receiver_email == instance.property.shared_email:
            return instance.property.name
        return instance.lead.name if instance.lead else instance.receiver_name

    class Meta:
        model = EmailMessage
        exclude = ('nylas_message_id', 'property')


class EmailLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLabel
        exclude = ('external_id', 'property')


class EmailMessageCommunicationSerializer(EmailMessageSerializer):
    formatted_sender_name = serializers.SerializerMethodField()
    formatted_receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = EmailMessage
        fields = (
            'id', 'attachments', 'subject', 'sender_name', 'receiver_name', 'sender_email', 'receiver_email', 'body',
            'date', 'is_unread', 'formatted_sender_name', 'formatted_receiver_name')

    def get_formatted_sender_name(self, instance):
        if instance.sender_email == instance.property.shared_email:
            return instance.property.name
        return instance.lead.name if instance.lead else instance.sender_name

    def get_formatted_receiver_name(self, instance):
        if instance.receiver_email == instance.property.shared_email:
            return instance.property.name
        return instance.lead.name if instance.lead else instance.receiver_name
