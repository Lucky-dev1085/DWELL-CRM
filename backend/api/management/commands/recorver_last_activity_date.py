from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.models import Lead, Task


class Command(BaseCommand):
    help = 'Recover invalid last activity date'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Recover invalid last activity date

        """
        for lead in Lead.objects.exclude(roommates=None):
            task_created = lead.tasks.all().order_by('-created').values_list('created', flat=True)[:1]
            note_created = lead.notes.all().order_by('-created').values_list('created', flat=True)[:1]
            roommate_created = lead.roommates.all().order_by('-created').values_list('created', flat=True)[:1]
            call_updated = lead.notes.filter(text__contains='Call Recording Transcription:').order_by(
                '-created').values_list('created', flat=True)[:1]
            task_completed = lead.tasks.filter(status=Task.TASK_COMPLETED).order_by(
                '-updated').values_list('updated', flat=True)[:1]

            dates = [task_created, note_created, roommate_created, call_updated, task_completed]
            dates = [list(date) for date in dates if len(date)]
            date = max(dates)
            if len(date):
                lead.last_activity_date = date[0]
                lead.save()
                print(f'{lead.name} is updated to {date[0]}')
