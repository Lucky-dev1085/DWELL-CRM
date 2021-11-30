from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from dateutil.relativedelta import relativedelta as rd, TH, MO

from backend.api.models import Holiday


class Command(BaseCommand):
    help = 'Add missing holidays into database'

    @transaction.atomic
    def handle(self, *args, **options):
        today = timezone.now()
        new_year = dict(date=date(today.year, 1, 1), name="New Year's Day")
        martin_luther = dict(date=date(today.year, 1, 1) + rd(weekday=MO(+3)), name='Martin Luther King Jr. Day')
        presidents_day = dict(date=date(today.year, 2, 1) + rd(weekday=MO(+3)), name="Presidents' Day")
        memorial_day = dict(date=date(today.year, 5, 31) + rd(weekday=MO(-1)), name='Memorial Day')
        independence_day = dict(date=date(today.year, 7, 4), name='Independence Day')
        independence_day_observed = dict(date=date(today.year, 7, 5), name='Independence Day observed')
        labor_day = dict(date=date(today.year, 9, 1) + rd(weekday=MO), name='Labor Day')
        veterans_day = dict(date=date(today.year, 11, 11), name='Veterans Day')
        thanksgiving = dict(date=date(today.year, 11, 1) + rd(weekday=TH(+4)), name='Thanksgiving Day')
        christmas_day_off = dict(date=date(today.year, 12, 24), name='Day off for Christmas Day')
        christmas_day = dict(date=date(today.year, 12, 25), name='Christmas Day')
        new_year_day_off = dict(date=date(today.year, 12, 31), name="Day off for New Year's Day")

        holidays = [new_year, martin_luther, presidents_day, memorial_day, independence_day, independence_day_observed,
                    labor_day, veterans_day, thanksgiving, christmas_day_off, christmas_day, new_year_day_off]

        existing_holidays = Holiday.objects.filter(country='US').values_list('name', flat=True)

        for holiday in holidays:
            if holiday['name'] in existing_holidays:
                continue
            Holiday.objects.create(date=holiday['date'], name=holiday['name'], country='US')
