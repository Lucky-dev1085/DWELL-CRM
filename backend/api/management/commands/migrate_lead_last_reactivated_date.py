from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q, OuterRef, Subquery

from backend.api.models import Lead, Activity


class Command(BaseCommand):
    help = 'Migrate leads last reactivated date'

    @transaction.atomic
    def handle(self, *args, **options):
        leads = Lead.objects.annotate(
            active_status_update_date=Subquery(
                Activity.objects.filter(
                    lead=OuterRef('pk'),
                    content='Status updated to Active',
                ).order_by('lead', 'created').distinct('lead').values('created')),
        ).exclude(Q(active_status_update_date=None) | (Q(lost_status_date=None) & Q(closed_status_date=None)))

        for lead in leads:
            lead.last_reactivated_date = lead.active_status_update_date
            lead.save()
