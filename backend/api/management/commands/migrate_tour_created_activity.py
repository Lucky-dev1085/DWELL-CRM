from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Activity, Task


class Command(BaseCommand):
    help = 'Migrate tour created activity'

    @transaction.atomic
    def handle(self, *args, **options):
        activities = Activity.objects.filter(type=Activity.TASK_CREATED)
        for activity in activities:
            if activity.object and activity.object.type in Task.TOUR_TYPES.keys():
                activity.type = Activity.TOUR_CREATED
                activity.save()
