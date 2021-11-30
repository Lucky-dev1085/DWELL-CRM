import requests
import logging
import boto3

from pytz import UTC
from urllib.parse import urlparse
from datetime import datetime, timedelta

from django.conf import settings
from django.db import connection, transaction
from django.db.models import Q, F
from django.db import IntegrityError
from django.db.models.signals import post_save, pre_save, post_delete, pre_delete
from django.dispatch import receiver
from django.utils import timezone
from nylas import APIClient

from backend.api.models import Lead, Task, Note, Property, User, Client, EmailMessage, Roommate, \
    EmailAttachment, Call, CallScoringQuestion, SMSContent, PetType, ReasonForMoving, RelationshipType
from backend.api.tasks import send_password_changed_task
from backend.api.utils import hyphens, format_transcription

logging.getLogger().setLevel(logging.INFO)


@receiver(pre_save, sender=User)
def send_password_changed_email(sender, instance, **kwargs):
    user = User.objects.filter(pk=instance.pk).first()
    if user and instance.password != user.password:
        user_data = {
            'email': instance.email,
            'name': instance.name,
        }
        send_password_changed_task.delay(user_data)


@receiver(post_save, sender=Property)
def add_property_to_user(sender, instance, created, **kwargs):
    if created:
        if instance.creator and instance.creator.role == User.C_ADMIN:
            instance.creator.properties.add(instance)
        for user in User.objects.filter(role=User.LL_ADMIN):
            user.properties.add(instance)


@receiver(post_save, sender=Property)
def create_email_template(sender, instance, created, **kwargs):
    if created:
        if instance.creator and instance.creator.role == User.C_ADMIN:
            instance.creator.properties.add(instance)
        for user in User.objects.filter(role=User.LL_ADMIN):
            user.properties.add(instance)


@receiver(post_save, sender=Client)
def add_client_to_user(sender, instance, created, **kwargs):
    if created:
        if instance.creator and instance.creator.role == User.C_ADMIN:
            instance.creator.clients.add(instance)
        for user in User.objects.filter(role=User.LL_ADMIN):
            if instance not in user.clients.all():
                user.clients.add(instance)


@receiver(pre_save, sender=Property)
def ping_google(sender, instance, **kwargs):
    property = Property.objects.filter(pk=instance.pk).first()
    if instance.status == 'ACTIVE' and (not property or property.status == 'INACTIVE'):
        URL = f'https://www.google.com/ping?sitemap=https://{instance.domain}/sitemap.xml'
        response = requests.get(URL)
        if response.status_code != 200:
            logging.error(
                f'Google sitemap ping for <{instance.domain}> failed with status {response.status_code}'
            )


@receiver(pre_save, sender=Property)
def update_property_external_id(sender, instance, **kwargs):
    property = Property.objects.filter(pk=instance.pk).first()
    if not property or property.name != instance.name:
        instance.external_id = hyphens(instance.name)


@receiver(pre_save, sender=EmailMessage)
def update_nylas_message_status(sender, instance, **kwargs):
    message = EmailMessage.objects.filter(pk=instance.pk).first()
    if message and message.is_unread != instance.is_unread:
        client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                           instance.property.nylas_access_token)
        nylas_message = client.messages.get(message.nylas_message_id)
        nylas_message.mark_as_read()


@receiver(pre_save, sender=EmailMessage)
def update_email_messages_lead(sender, instance, **kwargs):
    message = EmailMessage.objects.filter(pk=instance.pk).first()
    if message and message.lead != instance.lead:
        if instance.lead:
            message_filter = (Q(sender_email=instance.lead.email) | Q(receiver_email=instance.lead.email)) \
                             & Q(property=instance.property)
            EmailMessage.objects.filter(message_filter).update(lead=instance.lead.pk)
        else:
            message_filter = Q(sender_email=message.lead.email) | Q(receiver_email=message.lead.email) \
                             & Q(property=message.property)
            EmailMessage.objects.filter(message_filter).update(lead=None)


@receiver(pre_save, sender=Property)
def update_property_nylas_last_connected_date(sender, instance, **kwargs):
    property = Property.objects.filter(pk=instance.pk).first()
    if property and property.nylas_status != instance.nylas_status \
            and property.nylas_status == Property.NYLAS_STATUS_CONNECTED:
        instance.nylas_last_connected_date = datetime.today().date()


@receiver(pre_save, sender=Property)
def disable_email_blast(sender, instance, **kwargs):
    if instance.sent_email_count == settings.MAX_RECIPIENTS and not instance.is_email_blast_disabled:
        instance.is_email_blast_disabled = True
        instance.save()


@receiver(pre_save, sender=Lead)
def change_closed_status_date(sender, instance, **kwargs):
    lead = Lead.objects.filter(pk=instance.pk).first()
    if lead:
        if instance.status != lead.status and instance.status == Lead.LEAD_CLOSED:
            instance.closed_status_date = datetime.now(UTC)
    elif instance.status == Lead.LEAD_CLOSED:
        instance.closed_status_date = datetime.now(UTC)


@receiver(pre_save, sender=Lead)
def change_lost_status_date(sender, instance, **kwargs):
    lead = Lead.objects.filter(pk=instance.pk).first()
    if lead:
        if instance.status != lead.status and instance.status == Lead.LEAD_LOST:
            instance.lost_status_date = datetime.now(UTC)
    elif instance.status == Lead.LEAD_LOST:
        instance.lost_status_date = datetime.now(UTC)


@receiver(pre_save, sender=Lead)
def save_last_stage(sender, instance, **kwargs):
    lead = Lead.objects.filter(pk=instance.pk).first()
    if lead:
        if instance.stage != lead.stage:
            instance.last_stage = lead.stage


@receiver(post_save, sender=Note)
def sync_activity_from_note(sender, instance, created, **kwargs):
    """
    Sync comm log from note
    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    if created and instance.lead:
        method = instance.lead.sync_activity(instance.pk, 'Note')
        if method:
            connection.on_commit(method)


@receiver(post_save, sender=Call)
def sync_activity_from_call(sender, instance, created, **kwargs):
    """
    Sync comm log from note
    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    if created and instance.lead:
        method = instance.lead.sync_activity(instance.pk, 'Call')
        if method:
            connection.on_commit(method)


@receiver(post_save, sender=SMSContent)
def sync_activity_from_sms(sender, instance, created, **kwargs):
    """
    Sync comm log from note
    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    if created and instance.lead:
        method = instance.lead.sync_activity(instance.pk, 'Chat')
        if method:
            connection.on_commit(method)


@receiver(post_delete, sender=EmailAttachment)
def auto_delete_attachment(sender, instance, **kwargs):
    """
    Deletes file when corresponding `EmailAttachment` object is deleted.
    """
    instance.attachment.delete(save=False)


@receiver(pre_save, sender=Call)
def generate_call_transcription_note(sender, instance, **kwargs):
    """
    Auto generates note for lead call with transcription.
    """
    call = Call.objects.filter(pk=instance.pk).first()
    if instance.is_transcribed and instance.lead and (not call or instance.lead != call.lead):
        if not getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME', None):
            return

        path = urlparse(instance.transcription).path[1:]

        s3 = boto3.client(
            's3',
            aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
        )
        transcription_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME', None), 'Key': path},
            ExpiresIn=100
        )
        response = requests.get(transcription_url)
        if response.status_code != 200:
            logging.error(f'Getting call transcription for {instance.call_id} was failed with {response.status_code}'
                          f' status code')
        else:
            transcription_data = response.json()
            formatted_result = format_transcription(transcription_data['results'])
            Note.objects.create(property=instance.property, lead=instance.lead,
                                text='<strong>Call Recording Transcription:</strong><br /><br class="small-space" />{}'
                                .format(formatted_result), is_auto_generated=True)


@receiver(post_save, sender=Note)
def note_followup(sender, instance, created, **kwargs):
    """
    Track the least followup date from Note
    """
    if instance.is_follow_up:
        instance.lead.last_followup_date = instance.created
        instance.lead.save()


@receiver(pre_save, sender=Lead)
def auto_lead_link_with_calls(sender, instance, **kwargs):
    """
    it finds the matching call recording and link with lead
    """
    with transaction.atomic():
        lead = Lead.objects.select_for_update().filter(pk=instance.pk).first()
        if lead and lead.phone_number != instance.phone_number and instance.phone_number and not lead.calls.count():
            call = Call.objects.select_for_update().filter(
                property=instance.property,
                prospect_phone_number=instance.phone_number,
                lead=None
            ).first()
            if call:
                call.lead = lead
                if lead.stage == Lead.STAGE_APPLICATION_COMPLETE or lead.status == Lead.LEAD_CLOSED:
                    call.call_category = Call.CALL_CATEGORY_NON_PROSPECT
                elif lead.last_followup_date and lead.last_followup_date < timezone.now() - timedelta(days=14):
                    lead.acquisition_date = timezone.now()
                    lead.save()
                call.save()
                instance._last_activity_date = call.lead.last_activity_date


@receiver(post_save, sender=Lead)
def update_lead_last_activity_date(sender, instance, **kwargs):
    """
    it finds if last activity date was updated by pre_save signals and update accordingly
    """
    last_activity_date = getattr(instance, '_last_activity_date', None)
    if last_activity_date:
        instance.last_activity_date = last_activity_date
        instance._last_activity_date = None
        instance.save()


@receiver(pre_save, sender=Lead)
def lost_reason_validity(sender, instance, **kwargs):
    """
    Raise exception if lost reason is not set when lead is in LOST status.
    """
    old_lead = Lead.objects.filter(pk=instance.pk).first()
    if old_lead and old_lead.lost_reason != instance.lost_reason and instance.status == 'LOST' \
            and instance.lost_reason is None:
        raise IntegrityError('Lost reason should be set.')


@receiver(pre_delete, sender=Lead)
def update_calls_removed_status(sender, instance, **kwargs):
    """
    Updates calls is_removed status to True when related `Lead` object is deleted.
    """
    instance.calls.update(is_removed=True)


# todo we will temporarily disable release phone number feature
# @receiver(pre_delete, sender=PhoneNumber)
# def release_phone_number(sender, instance, **kwargs):
#     if instance.twilio_sid:
#         twilio_release_number(instance.twilio_sid)


@receiver(pre_save, sender=CallScoringQuestion)
def update_questions_order(sender, instance, **kwargs):
    question_same_order = CallScoringQuestion.objects.filter(order=instance.order).first()
    if question_same_order:
        current_question = CallScoringQuestion.objects.filter(pk=instance.pk).first()
        if current_question:
            if instance.order > current_question.order:
                CallScoringQuestion.objects.filter(order__gt=current_question.order, order__lte=instance.order).update(
                    order=F('order') - 1)
            else:
                CallScoringQuestion.objects.filter(order__gte=instance.order, order__lt=current_question.order).update(
                    order=F('order') + 1)
        else:
            CallScoringQuestion.objects.filter(order__gte=instance.order).update(order=F('order') + 1)


@receiver(post_save, sender=EmailMessage)
def update_last_followup_date_and_sync_activity(sender, instance, created, **kwargs):
    """
    Update the last followup date by sent email.
    Edge case: when lead is not assigned to given email, we should find the lad that has most recent activity with
    Also, we sync the comm log
    this email address.
    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    logging.info(f'[Last followup date {instance.pk}]: Start to add last follow up date')
    if created and not instance.is_guest_card_email and instance.property \
            and instance.sender_email == instance.property.shared_email:
        lead = instance.lead
        if not lead:
            lead = Lead.objects.filter(property=instance.property, email=instance.receiver_email) \
                .order_by('-created').first()
            if not lead:
                logging.info(f'[Last followup date {instance.pk}]: Unable to find the lead')
                return
        logging.info(f'[Last followup date {instance.pk}]: First condition is met lead - {lead.pk}')
        is_last_followup = instance.date > lead.last_followup_date if lead.last_followup_date \
            else instance.date > lead.created
        logging.info(f'[Last followup date {instance.pk}]: Is last followup - {is_last_followup}')
        if is_last_followup:
            lead.last_followup_date = instance.date
            lead.save()
            logging.info(f'[Last followup date {instance.pk}]: saving last followup date {lead.last_followup_date}')
        logging.info(f'[Last followup date {instance.pk}]: Ending')

    if created and instance.lead:
        method = instance.lead.sync_activity(instance.pk, 'Email')
        if method:
            connection.on_commit(method)


@receiver(pre_save, sender=Task)
def set_last_followup_date_on_task_complete(sender, instance, **kwargs):
    task = Task.objects.filter(id=instance.id).first()
    lead = instance.lead
    if task and task.status == Task.TASK_OPEN and instance.status == Task.TASK_COMPLETED and lead:
        if instance.type in [Task.TYPE_FOLLOW_FIRST, Task.TYPE_FOLLOW_SECOND, Task.TYPE_FOLLOW_THIRD,
                             Task.TYPE_FINAL_FOLLOWUP, Task.TYPE_FUTURE_DATE_FOLLOWUP]:
            lead.last_followup_date = timezone.now()
            lead.save()


@receiver(pre_save, sender=Property)
def add_res_man_default_configuration(sender, instance, **kwargs):
    """
    For the ResMan property, we should generate the default choices for Pet Type, Moving Reason, RelationshipType
    """
    property = Property.objects.filter(id=instance.id).first()
    if property and not property.resman_property_id and instance.resman_property_id:
        for pet_type in Lead.PET_TYPE_CHOICES:
            PetType.objects.get_or_create(property=instance, name=pet_type[1])
        for reason in Lead.MOVING_REASON_CHOICES:
            ReasonForMoving.objects.get_or_create(property=instance, reason=reason[1])
        for roommate in Roommate.RELATIONSHIP_CHOICES:
            RelationshipType.objects.get_or_create(property=instance, name=roommate[1])
