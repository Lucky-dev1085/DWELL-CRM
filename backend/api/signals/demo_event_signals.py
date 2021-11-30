from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver

from backend.api.models import DemoTour
from backend.api.tasks.nylas.send_demo_events import delete_demo_event, create_demo_event


@receiver(post_save, sender=DemoTour)
def demo_event_on_create(sender, instance, created, **kwargs):
    if created:
        create_demo_event.delay(instance.id)


@receiver(pre_save, sender=DemoTour)
def demo_event_on_update(sender, instance, **kwargs):
    demo = DemoTour.objects.filter(pk=instance.pk).first()
    if demo and hasattr(demo, 'event'):
        if not demo.is_cancelled and instance.is_cancelled:
            delete_demo_event.delay(demo.event.external_id)
        else:
            create_demo_event.delay(instance.id, is_updated=True)


@receiver(pre_delete, sender=DemoTour)
def demo_event_on_delete(sender, instance, **kwargs):
    demo = DemoTour.objects.filter(pk=instance.pk).first()
    if demo and hasattr(demo, 'event'):
        delete_demo_event.delay(demo.event.external_id)
