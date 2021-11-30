from django.core.management.base import BaseCommand

from backend.api.tasks.clear_older_notifications import clear_older_notifications


class Command(BaseCommand):
    def handle(self, *args, **options):
        clear_older_notifications()
