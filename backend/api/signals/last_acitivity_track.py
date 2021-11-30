from django.utils import timezone
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from backend.api.models import Task, Note, ChatConversation


@receiver(post_save, sender=Task)
def task_create_activity(sender, instance, created, **kwargs):
    if created:
        if instance.lead:
            instance.lead.last_activity_date = timezone.now()
            instance.lead.save()


@receiver(pre_save, sender=Task)
def task_complete_activity(sender, instance, **kwargs):
    task = instance
    if instance.pk:
        old_task = Task.objects.filter(pk=task.pk).first()
        if old_task.status != task.status and task.status == Task.TASK_COMPLETED and instance.lead:
            instance.lead.last_activity_date = timezone.now()
            instance.lead.save()


@receiver(post_save, sender=Note)
def note_create_activity(sender, instance, created, **kwargs):
    if created:
        if instance.lead:
            instance.lead.last_activity_date = timezone.now()
            instance.lead.save()


@receiver(post_save, sender=ChatConversation)
def chat_create_activity(sender, instance, created, **kwargs):
    prospect = instance.prospect
    if created and instance.type == ChatConversation.TYPE_GREETING:
        if prospect.lead:
            prospect.lead.last_activity_date = timezone.now()
            prospect.lead.save()
