import pytz
import boto3
import io
import pandas as pd
import logging
from re import sub
from bs4 import BeautifulSoup
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.conf import settings

from backend.celery_app import app
from backend.compete.models import History, Property
from backend.compete.utils import parse_float
from .populate_data import populate_data
from .generate_report import generate_report

TZ = pytz.timezone('America/Phoenix')


@app.task
def pull_scrapping_data(date=None, should_populate_data=True, property_ids=None):
    """
    Pull data from S3 scrapped data
    :return:
    """
    if not date:
        scrapping_date = timezone.now().astimezone(tz=TZ).date()
    else:
        scrapping_date = parse_date(date)
    bucket_name = 'dwell-scrapping'

    if property_ids:
        properties = Property.objects.filter(id__in=property_ids)
    else:
        properties = Property.objects.exclude(s3_name=None)

    for property in properties:
        object_key = f'Mark Taylor/{scrapping_date.strftime("%m-%d-%Y")}_{property.s3_name.replace(" ", "-")}.csv'
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
                aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
            )
            obj = s3.get_object(Bucket=bucket_name, Key=object_key)
            data = pd.read_csv(io.BytesIO(obj['Body'].read()), encoding='utf-8')
            date, name = object_key.split('_')
        except Exception as e:
            logging.error(f'The scrapping data of {property.name} on {date} does not exist.', e)
            continue

        total_records_count = 0
        item_ids = []
        rent_columns = ['Rent', 'RentMin', 'RentRange', 'Rent Range', 'Rent Min']
        columns = data.keys()
        for index, item in enumerate(data['ItemID']):
            def get_value(key, unparsed=False):
                try:
                    for column in columns:
                        if key.lower() == column.lower():
                            value = data[column][index]
                            if unparsed:
                                return value

                            if str(value) == 'nan':
                                return None
                            if key in rent_columns + ['SQFT', 'Bed', 'Bath']:
                                split_value = value
                                if type(value) == str:
                                    if '-' in value:
                                        split_value = value.split('-')[0]
                                    if 'to' in value:
                                        from_value = value.split('to')[0]
                                        to_value = value.split('to')[1]
                                        if sub(r'[^\d.]', '', str(from_value)):
                                            split_value = from_value
                                        else:
                                            split_value = to_value
                                try:
                                    return float(sub(r'[^\d.]', '', str(split_value)))
                                except ValueError as e:
                                    logging.error(f'Parsing {key} of {value} has error:{e}')
                                    return None
                            return value
                except Exception as e:
                    print(e)
                    pass

            # parse beds
            if type(data['Bed'][index]) == str and data['Bed'][index].lower() in ['studio', 'penthouse']:
                if data['Bed'][index].lower() == 'penthouse':
                    logging.info(f'Property {property.name} contains penthouse: {object_key}')
                beds = 0
            else:
                beds = get_value('Bed')

            # parse rent
            rent_columns = ['Rent', 'RentMin', 'RentRange', 'Rent Range', 'Rent Min']
            rent_key = next((i for i in ['Rent', 'RentMin', 'RentRange', 'Rent Range', 'Rent Min'] if i in data.keys()), None)
            rent = get_value(rent_key) if rent_key else None

            # parse apartment
            apartment = get_value('Apartment')
            if type(apartment) != str:
                apartment = parse_float(apartment) or None

            # parse unit type
            unit_type = get_value('Type')
            if unit_type:
                if str(unit_type).lower() == 'bedroom':
                    unit_type = f'{int(beds)} Bedroom'

                if str(unit_type).lower() == '0 bedroom':
                    unit_type = 'studio'

            is_valuable = True
            if not apartment or not rent:
                is_valuable = False

            total_records_count += 1

            try:
                item_ids.append(item)
                History.objects.update_or_create(
                    item_id=item,
                    property=property,
                    scrapping_date=scrapping_date,
                    defaults=dict(
                        type=unit_type,
                        specials=get_value('Specials'),
                        floor_plan=get_value('FloorPlan'),
                        beds=beds,
                        baths=get_value('Bath'),
                        sqft=get_value('SQFT'),
                        floor_plan_url=get_value('FloorPlanURL'),
                        available_date=get_value('AvailableDate'),
                        rent=rent,
                        communities=(get_value('CommunityAmenities') or '').strip(),
                        amenities=(get_value('ApartmentAmenities') or '').strip(),
                        address=get_value('PropertyAddress'),
                        website=get_value('Website'),
                        phone=get_value('PropertyPhone'),
                        apartment=apartment,
                        is_valuable=is_valuable,

                        unparsed_unit_type=get_value('Type', True),
                        unparsed_rent=get_value(rent_key, True),
                        unparsed_beds=get_value('Bed', True),
                        unparsed_baths=get_value('Bath', True),
                        unparsed_sqft=get_value('SQFT', True),
                        s3_last_modified=obj['LastModified']
                    )
                )
            except Exception as e:
                logging.error(f'Creating history of {property.name} is failed at {scrapping_date}: {e}')
                pass

        property.histories.filter(scrapping_date=scrapping_date).update(s3_rows_count=total_records_count)
        property.histories.filter(scrapping_date=scrapping_date).exclude(item_id__in=item_ids).delete()

    if should_populate_data:
        populate_data(str(scrapping_date), property_ids)
        generate_report(str(scrapping_date), property_ids)


@app.task
def generate_history_for_mt_properties(date=None, should_populate_data=True, property_ids=None):
    """
    Generate history data for MT properties
    :return:
    """
    if not date:
        date = timezone.now().astimezone(tz=TZ).date()
    else:
        date = parse_date(date)

    properties = Property.objects.exclude(property=None)
    if property_ids:
        properties = properties.filter(id__in=property_ids)

    for property in properties:
        dwell_property = property.property
        available_units = dwell_property.units.filter(status='AVAILABLE', not_used_for_marketing=False)
        promotion = dwell_property.promotion.filter(is_active=True).first()

        amenities = []
        communities = []

        amenities_data = dwell_property.page_data.filter(section='AMENITIES').first()
        amenities_list = amenities_data.values['amenitiesList']

        for amenity in amenities_list:
            amenity_items = []
            for column in amenity.get('amenitiesDetails'):
                amenity_items += [item['description'] for item in column]

            if amenity['name'] == 'Amenities':
                amenities = amenity_items

            if amenity['name'] == 'Community':
                communities = amenity_items

        specials = None
        if promotion:
            specials = BeautifulSoup(promotion.promotion_html).get_text()

        for unit in available_units:
            unit_type = 'Studio' if unit.floor_plan.bedrooms == 0 else f'{int(unit.floor_plan.bedrooms)} bedroom'
            History.objects.update_or_create(
                apartment=unit.unit,
                property=property,
                scrapping_date=date,
                defaults=dict(
                    type=unit_type,
                    specials=specials,
                    floor_plan=unit.floor_plan.plan,
                    beds=unit.floor_plan.bedrooms,
                    baths=unit.floor_plan.bathrooms,
                    sqft=unit.floor_plan.square_footage,
                    available_date='Now',
                    rent=unit.floor_plan.min_rent or unit.floor_plan.max_rent,
                    communities=';'.join(communities),
                    amenities=';'.join(amenities),
                    address=f'{dwell_property.city}, {dwell_property.town}',
                    website=f'https://{dwell_property.domain}',
                    phone=dwell_property.phone_number
                )
            )
        property.histories.filter(property=property, scrapping_date=date) \
            .exclude(apartment__in=[str(i) for i in available_units.values_list('unit', flat=True)]).delete()

        if not len(available_units):
            History.objects.create(
                property=property,
                scrapping_date=date,
                specials=specials,
                communities=';'.join(communities),
                amenities=';'.join(amenities),
                address=f'{dwell_property.city}, {dwell_property.town}',
                website=f'https://{dwell_property.domain}',
                phone=dwell_property.phone_number,
                is_valuable=False
            )

    if should_populate_data:
        populate_data(str(date), property_ids)
        generate_report.delay(str(date), property_ids)


@app.task
def check_scrapping_state():
    """
    Check scrapping state every minutes
    :return:
    """
    now = timezone.now().astimezone(tz=TZ)
    scrapping_date = now.date()

    # we run this method from 7 am ~ 1 pm MST only
    if now.hour < 7 or now.hour > 13:
        return False

    bucket_name = 'dwell-scrapping'
    properties = Property.objects.exclude(s3_name=None)

    property_ids = []
    for property in properties:
        histories = property.histories.filter(scrapping_date=scrapping_date)

        object_key = f'Mark Taylor/{scrapping_date.strftime("%m-%d-%Y")}_{property.s3_name.replace(" ", "-")}.csv'
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=getattr(settings, 'AWS_S3_ACCESS_KEY_ID', None),
                aws_secret_access_key=getattr(settings, 'AWS_S3_SECRET_ACCESS_KEY', None)
            )
            obj = s3.get_object(Bucket=bucket_name, Key=object_key)
            last_modified = obj['LastModified']

            if not histories.filter(s3_last_modified=last_modified).count():
                property_ids.append(property.id)

        except Exception as e:
            logging.error(f'The scrapping data of {property.name} on {scrapping_date} does not exist.', e)
            continue

    if len(property_ids):
        pull_scrapping_data.delay(property_ids=property_ids)
