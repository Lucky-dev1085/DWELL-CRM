import logging
import pytz
from word2number import w2n
from django.utils.dateparse import parse_date
from django.db.models import Avg

from backend.celery_app import app
from backend.compete.models import History, Property, UnitType, Unit, UnitSession
from backend.compete.utils import parse_concession, parse_various_format_date


TZ = pytz.timezone('America/Phoenix')


@app.task
def populate_data(date=None, property_ids=None):
    """
    Populate data from scrapping data
    :return:
    """
    if not date:
        scrapping_date = History.objects.order_by('-scrapping_date').first().scrapping_date
    else:
        scrapping_date = parse_date(date)
    histories = History.objects.filter(scrapping_date=scrapping_date)

    if property_ids:
        properties = Property.objects.filter(id__in=property_ids)
    else:
        properties = Property.objects.all()

    for property in properties:
        filtered_data = histories.filter(property=property)
        if filtered_data.count():
            history = filtered_data.first()

            property.address = history.address
            property.phone_number = history.phone
            property.website = (history.website or '').lower()
            property.amenities = history.amenities.split(';') if history.amenities else []
            property.communities = history.communities.split(';') if history.communities else []
            property.concession_description = history.specials
            property.save()

            property.units.all().update(on_market=False)

        # pull units
        for history in filtered_data.filter(is_valuable=True):
            unit_type = [choice[0] for choice in UnitType.UNIT_TYPE_CHOICES
                         if choice[1].lower() in (history.type or '').lower()]
            unit_type = unit_type[0] if len(unit_type) else None

            if not unit_type:
                beds = history.beds
                if history.type and 'bedroom' in history.type.lower():
                    try:
                        beds = w2n.word_to_num(history.type)
                    except ValueError:
                        pass
                unit_type = property.unit_types.filter(beds=beds).first()
                if not unit_type:
                    logging.error(f'The given unit type is invalid on {property.name}: {history.type}')
                    continue
                unit_type = unit_type.name

            unit_type, _ = UnitType.objects.update_or_create(
                name=unit_type,
                property=property,
                defaults=dict(
                    baths=history.baths,
                )
            )

            Unit.objects.update_or_create(
                number=history.apartment,
                property=property,
                defaults=dict(
                    unit_type=unit_type,
                    beds=history.beds,
                    baths=history.baths,
                    unit_size=history.sqft,
                    rent=history.rent,
                    floor_plan_name=history.floor_plan,
                    available_date=parse_various_format_date(history.available_date, scrapping_date),
                    on_market=True
                )
            )

        def _round_value(value):
            if not value:
                return None
            return round(value, 2)

        dwell_property = property.property
        if dwell_property:
            dwell_units = dwell_property.units.filter(not_used_for_marketing=False)
            units_count = dwell_units.count()
            for unit_type in property.unit_types.all():
                unit_type.units_count = dwell_units.filter(floor_plan__bedrooms=unit_type.beds).count()
                unit_type.save()
            property.units_count = units_count
            property.save()

        property.average_rent = _round_value(property.units.aggregate(average_rent=Avg('rent')).get('average_rent'))
        average_sqft = _round_value(property.units.aggregate(average_sqft=Avg('unit_size')).get('average_sqft'))

        property.average_rent_per_sqft = round(property.average_rent / average_sqft, 2) \
            if property.average_rent and average_sqft else None

        if property.is_lease_up:
            if property.completed_units_count and property.units_count:
                property.occupancy = round(
                    (property.completed_units_count - property.units.filter(on_market=True).count()) * 100
                    / property.units_count, 2
                )
            else:
                property.occupancy = None
        else:
            property.occupancy = round((property.units_count - property.units.filter(on_market=True).count()) * 100
                                       / property.units_count, 2)\
                if property.units_count else None

        average_rent = property.units.aggregate(Avg('rent')).get('rent__avg')
        property.concession_amount = parse_concession(property.concession_description, average_rent)

        property.save()

        for unit_type in property.unit_types.all():
            unit_type.average_rent = _round_value(
                unit_type.units.aggregate(average_rent=Avg('rent')).get('average_rent')
            )
            unit_type.average_size = _round_value(
                unit_type.units.aggregate(average_sqft=Avg('unit_size')).get('average_sqft')
            )
            unit_type.save()

        # Generate the unit session
        for unit in property.units.all():
            unit_session = property.unit_sessions.filter(unit=unit)
            current_session = unit_session.filter(end_listing_date=None).first()
            if unit.on_market and not current_session:
                UnitSession.objects.create(property=property, unit=unit, start_listing_date=scrapping_date)

            if not unit.on_market and current_session:
                current_session.end_listing_date = scrapping_date
                current_session.save()
