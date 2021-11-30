from django.core.management.base import BaseCommand
from django.db import transaction

from backend.api.models import ResManEmployee, User


class Command(BaseCommand):
    help = 'Match resman employee with the user'

    @transaction.atomic
    def handle(self, *args, **options):
        for user in User.objects.filter(is_team_account=True):
            employee = ResManEmployee.objects.filter(email__iexact=user.email).first()
            if employee:
                employee.user = user
                employee.save()
