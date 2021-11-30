import pytz
from datetime import timedelta
from word2number import w2n
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.compete.models import Unit, UnitType, UnitSession, Property
from backend.compete.utils import parse_various_format_date

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Creates initial basic data for manual testing'

    @staticmethod
    def create_off_market_units():
        for property in Property.objects.all():
            # Create the off-market units which were available before
            existing_units = property.units.values_list('number', flat=True)
            off_market_units = property.histories.exclude(
                apartment__in=existing_units
            ).values_list('apartment', flat=True).distinct()
            for unit in off_market_units:
                history = property.histories.filter(apartment=unit).exclude(type=None)\
                    .order_by('-scrapping_date').first()

                if not history:
                    continue

                unit_type = [choice[0] for choice in UnitType.UNIT_TYPE_CHOICES
                             if choice[1].lower() in (history.type or '').lower()]
                unit_type = unit_type[0] if len(unit_type) else None

                if not unit_type:
                    beds = history.beds
                    if 'bedroom' in history.type.lower():
                        try:
                            beds = w2n.word_to_num(history.type)
                        except ValueError:
                            pass
                    unit_type = property.unit_types.filter(beds=beds).first()
                    if not unit_type:
                        print(f'The given unit type is invalid on {property.name}: {history.type}')
                        continue
                    unit_type = unit_type.name

                unit_type, _ = UnitType.objects.update_or_create(
                    name=unit_type,
                    property=property,
                    defaults=dict(
                        baths=history.baths,
                    )
                )

                Unit.objects.create(
                    number=history.apartment,
                    property=property,
                    unit_type=unit_type,
                    beds=history.beds,
                    baths=history.baths,
                    unit_size=history.sqft,
                    rent=history.rent,
                    floor_plan_name=history.floor_plan,
                    available_date=parse_various_format_date(history.available_date, history.scrapping_date),
                    on_market=False
                )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Creates initial basic data for manual testing

        """
        self.create_off_market_units()
        for property in Property.objects.all():
            for unit in property.units.all():
                dates = property.histories.filter(apartment=unit.number).order_by('scrapping_date')\
                    .values_list('scrapping_date', flat=True).distinct()

                session_group = []
                start_date = None
                for index, date in enumerate(dates):
                    if not start_date:
                        start_date = date

                    if index < len(dates) - 1 and date == dates[index + 1] - timedelta(days=1):
                        continue

                    session_group.append([start_date, date])
                    start_date = None

                for session_date in session_group:
                    UnitSession.objects.update_or_create(
                        property=property, unit=unit, start_listing_date=session_date[0],
                        end_listing_date=session_date[1]
                    )
