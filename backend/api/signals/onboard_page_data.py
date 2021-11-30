import json
import logging

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from backend.api.models import Property

logging.getLogger().setLevel(logging.INFO)


@receiver(post_save, sender=Property)
def onboard_page_data(sender, instance, created, **kwargs):
    if created:
        url = 'backend/api/static/site_data/page_data.json'
        with open(url, 'r') as file:
            content = file.read()
        page_data = json.loads(content)
        page_data['domain'] = instance.domain

        from backend.api.management.commands.migrate_mongodb_data import _generate_site_data
        _generate_site_data([page_data], [], [])


@receiver(pre_delete, sender=Property)
def remove_page_data(sender, instance, **kwargs):
    instance.page_data.all().delete()
