from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import Property
from backend.api.tasks import get_group_list


class Command(BaseCommand):
    help = 'Set SmartRent group ids to properties'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Set SmartRent group ids to properties

        """
        groups = get_group_list()
        for group in groups:
            property = Property.objects.filter(name=group.get('marketing_name')).first()
            if property:
                property.smart_rent_group_id = group.get('id')
                property.save()
