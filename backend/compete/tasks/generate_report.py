import pytz
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
from django.db.models import Sum, Min, Max, Avg, Q

from backend.celery_app import app
from backend.compete.models import History, Property, UnitType, Report, UnitRentReport
from backend.compete.utils import parse_concession


TZ = pytz.timezone('America/Phoenix')


@app.task
def generate_report(date=None, property_ids=None):
    """
    Generate Report
    :return:
    """
    if not date:
        scrapping_date = History.objects.order_by('-scrapping_date').first().scrapping_date
    else:
        scrapping_date = parse_date(date)

    if property_ids:
        properties = Property.objects.filter(id__in=property_ids)
    else:
        properties = Property.objects.all()

    beds_by_type = dict(STUDIO=0, ONE_BEDROOM=1, TWO_BEDROOM=2, THREE_BEDROOM=3, FOUR_BEDROOM=4, FIVE_BEDROOM=5)

    for property in properties:
        histories = property.histories.filter(scrapping_date=scrapping_date)

        report, _ = Report.objects.update_or_create(property=property, date=scrapping_date)
        previous_report = Report.objects.filter(property=property, date=scrapping_date - timedelta(days=1)).first()

        combined_average_rent = None
        for unit_type_name in UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'), ):
            if unit_type_name[0] == 'COMBINED':
                units = histories.filter(is_valuable=True)
            else:
                beds_query = Q(beds=beds_by_type[unit_type_name[0]])
                units = histories.filter(Q(type__icontains=unit_type_name[1]) | beds_query, is_valuable=True)

            rent_sum = units.aggregate(Sum('rent')).get('rent__sum')
            units_count = units.count()

            if unit_type_name[0] == 'COMBINED':
                blended_rent = report.unit_rent_reports.exclude(blended_rent=None)\
                    .aggregate(avg_blended_rent=Avg('blended_rent')).get('avg_blended_rent')
                combined_average_rent = blended_rent
            else:
                blended_rent = None
                if rent_sum and units_count:
                    blended_rent = rent_sum / units_count
                else:
                    unit_rent_report = UnitRentReport.objects.filter(
                        report=previous_report, unit_type=unit_type_name[0]
                    ).first()
                    if unit_rent_report:
                        blended_rent = unit_rent_report.blended_rent

            UnitRentReport.objects.update_or_create(
                property=property, report=report, unit_type=unit_type_name[0],
                defaults=dict(
                    units_count=units_count,
                    min_rent=units.aggregate(Min('rent')).get('rent__min'),
                    max_rent=units.aggregate(Max('rent')).get('rent__max'),
                    rent_sum=rent_sum,
                    sqft_sum=units.aggregate(Sum('sqft')).get('sqft__sum'),
                    blended_rent=blended_rent
                )
            )

        available_units = report.unit_rent_reports.filter(unit_type='COMBINED').first().units_count
        if property.is_lease_up:
            occupancy = (property.completed_units_count - available_units) * 100 / property.units_count \
                if property.completed_units_count and property.units_count and available_units else None
        else:
            occupancy = (property.units_count - available_units) * 100 / property.units_count \
                if property.units_count and available_units else None

        concession = None
        if histories.first():
            concession = parse_concession(histories.first().specials, combined_average_rent)
        Report.objects.filter(property=property, date=scrapping_date).update(
            available_units=available_units,
            occupancy=occupancy,
            total_units=property.units_count,
            concession=concession,
            concession_avg_rent_percent=round(concession / (combined_average_rent * 12) * 100, 2)
            if combined_average_rent and concession else 0
        )


@app.task
def generate_report_in_range(days_back=150):
    """
    Generate Report in range
    :return:
    """
    start_date = datetime.now().date() - timedelta(days=days_back)
    while start_date < datetime.now().date():
        start_date += timedelta(days=1)
        print(start_date)
        generate_report(date=str(start_date))
