from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Lead, Activity


class Command(BaseCommand):
    help = 'Migrates closed status, lost status, tour completed dates to leads'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Migrates closed status, lost status, tour completed dates to leads

        """
        for lead in Lead.objects.all():
            tour_completed_activity = Activity.objects.filter(content='Stage updated to Tour completed',
                                                              lead=lead.id).order_by('-created').first()
            if tour_completed_activity:
                lead.tour_completed_date = tour_completed_activity.created
                lead.save()
            closed_status_activity = Activity.objects.filter(content='Status updated to Closed',
                                                             lead=lead.id).order_by('-created').first()
            if closed_status_activity:
                lead.closed_status_date = closed_status_activity.created
                lead.save()
            lost_status_activity = Activity.objects.filter(content='Status updated to Lost',
                                                           lead=lead.id).order_by('-created').first()
            if lost_status_activity:
                lead.lost_status_date = lost_status_activity.created
                lead.save()
