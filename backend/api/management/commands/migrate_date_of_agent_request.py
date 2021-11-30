from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import timedelta

from backend.api.models import AgentRequest


class Command(BaseCommand):
    help = 'Migrate date of agent request'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Migrate date of agent request

        """
        for request in AgentRequest.objects.all():
            request = AgentRequest.objects.get(pk=request.pk)
            if request.date:
                continue

            start = request.created - timedelta(seconds=30)
            end = request.created + timedelta(seconds=30)
            AgentRequest.objects.filter(
                property=request.property, prospect=request.prospect, created__gte=start, created__lte=end
            ).update(date=request.created)
