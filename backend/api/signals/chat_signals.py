import logging

from datetime import timedelta
from django.utils import timezone

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from backend.api.models import User, ChatProspect, Notification, ChatConversation, AgentRequest
from backend.api.tasks.chat.set_prospect_as_not_waiting import set_prospect_as_not_waiting
from backend.api.tasks.chat.dismiss_agent_requests import dismiss_agent_request
from backend.api.tasks.push_object_task import push_available_agents_number
from backend.api.tasks import push_object_saved, send_agents_available_number

logging.getLogger().setLevel(logging.INFO)


@receiver(post_save, sender=ChatConversation)
def handle_agent_request(sender, instance, created, **kwargs):
    if created and instance.type == ChatConversation.TYPE_AGENT_REQUEST:
        prospect = instance.prospect
        prospect.is_waiting_agent = True
        prospect.save()
        set_prospect_as_not_waiting.apply_async((prospect.pk,), eta=timezone.now() + timedelta(minutes=1))

        team_accounts = User.objects.filter(properties__in=[instance.property], is_team_account=True)

        now = timezone.now()
        for agent in team_accounts.filter(is_available=True):
            request = AgentRequest.objects.create(
                property=instance.property, prospect=prospect, user=agent, date=now
            )
            dismiss_agent_request.apply_async([request.id], eta=timezone.now() + timedelta(minutes=1))
            push_object_saved.delay(request.id, request.__class__.__name__, True, is_user_channel=True)

        for agent in team_accounts.filter(is_available=False):
            content = '{} requested a live agent'.format(instance.prospect.name_label)
            notification = Notification.objects.create(property=instance.property,
                                                       type=Notification.TYPE_NEW_AGENT_REQUEST,
                                                       content=content, user=agent)
            push_object_saved.delay(notification.id, notification.__class__.__name__, True, is_user_channel=True)


@receiver(pre_save, sender=User)
def send_agents_available_number_pre_save(sender, instance, **kwargs):
    user = User.objects.filter(id=instance.id).first()
    instance.is_available_changed = False
    instance.last_property_changed = False
    if user and user.is_available != instance.is_available:
        instance.is_available_changed = True
    if user and user.last_property != instance.last_property:
        instance.last_property_changed = True


@receiver(post_save, sender=User)
def send_agents_available_number_post_save(sender, instance, **kwargs):
    if instance.is_team_account and (instance.is_available_changed or instance.last_property_changed):
        send_agents_available_number.delay(instance.pk)


@receiver(pre_save, sender=ChatProspect)
def update_agent_requests_as_inactive(sender, instance, **kwargs):
    prospect = ChatProspect.objects.filter(id=instance.id).first()
    if prospect and not instance.is_waiting_agent and instance.is_waiting_agent != prospect.is_waiting_agent:
        requests = AgentRequest.objects.filter(prospect_id=instance.id, is_active=True)
        for request in requests:
            request.is_active = False
            request.save()
            push_object_saved.delay(request.id, request.__class__.__name__, False, is_user_channel=True)


@receiver(pre_save, sender=AgentRequest)
def check_available_agents(sender, instance, **kwargs):
    request = AgentRequest.objects.filter(id=instance.id).first()
    if request and instance.is_declined and instance.is_declined != request.is_declined:
        instance.is_active = False
        requests = AgentRequest.objects.exclude(id=request.id).filter(is_declined=False,
                                                                      prospect=request.prospect,
                                                                      property=request.property,
                                                                      is_active=True)
        if not requests.count():
            push_available_agents_number.delay(0, [request.prospect.external_id])
