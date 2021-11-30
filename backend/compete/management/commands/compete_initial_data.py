import pytz
import pandas as pd
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from backend.api.models import Property as DwellProperty, User
from backend.api.utils import hyphens
from backend.compete.models import Property, Market, Submarket, Alert, UnitType
from backend.compete.factories import AlertFactory, ReportFactory, UnitRentReportFactory, AlertLogFactory, \
    AlertLogDetailFactory, UnitFactory, HistoryFactory
from backend.compete.tasks import pull_scrapping_data, generate_report, populate_data  # NOQA
from backend.api.views.notification_creation import alert_notification

TZ = pytz.timezone('America/Phoenix')


def generate_alert_mock_data():
    user = User.objects.get(email='user1@gmail.com')
    alert = AlertFactory(track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS, user=user)
    alert.markets.set(random.choices(Market.objects.values_list('id', flat=True), k=2))

    alert = AlertFactory(track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, user=user)
    alert.submarkets.set(random.choices(Submarket.objects.values_list('id', flat=True), k=3))

    alert = AlertFactory(track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, user=user)
    alert.properties.set(random.choices(Property.objects.values_list('id', flat=True), k=5))

    alert = AlertFactory(
        track_assets_mode=Alert.TRACK_ASSETS_IN_MARKETS, type=Alert.THRESHOLD, baseline=Alert.PREVIOUS_DAY,
        condition_subject=Alert.OCCUPANCY, condition_type=Alert.INCREASES, condition_value=3, user=user
    )
    alert.markets.set(random.choices(Market.objects.values_list('id', flat=True), k=2))

    alert = AlertFactory(
        track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, type=Alert.THRESHOLD, baseline=Alert.LAST_WEEK,
        condition_subject=Alert.RENT, condition_type=Alert.DECREASES, condition_value=1, user=user,
        condition_unit_types=['STUDIO', 'ONE_BEDROOM']
    )
    alert.submarkets.set(random.choices(Submarket.objects.values_list('id', flat=True), k=3))

    alert = AlertFactory(
        track_assets_mode=Alert.TRACK_CUSTOM_ASSETS, type=Alert.THRESHOLD, baseline=Alert.LAST_4_WEEKS,
        condition_subject=Alert.CONCESSION, condition_type=Alert.INCREASES_OR_DECREASES, condition_value=5,
        user=user
    )
    alert.properties.set(random.choices(Property.objects.values_list('id', flat=True), k=5))

    for alert in Alert.objects.all():
        if alert.type == Alert.BENCHMARK:
            for i in range(5):
                today = timezone.now().astimezone(tz=TZ).replace(hour=6)
                sent_on_date = today - timedelta(days=today.weekday(), weeks=i)
                start = (sent_on_date - timedelta(days=7)).date()
                end = (sent_on_date - timedelta(days=1)).date()
                alert_log = AlertLogFactory(
                    alert=alert, sent_on=sent_on_date, start=start, end=end, baseline=alert.baseline,
                    condition_subject=alert.condition_subject, condition_unit_types=alert.condition_unit_types
                )
                alert_notification(alert_log)
                for property in alert.overall_properties:
                    AlertLogDetailFactory(alert_log=alert_log, property=property)
        else:
            for i in range(5):
                today = timezone.now().astimezone(tz=TZ).replace(hour=6)
                sent_on_date = today - timedelta(2 * i)
                alert_log = AlertLogFactory(
                    alert=alert, sent_on=sent_on_date, start=sent_on_date.date(), end=sent_on_date.date(),
                    baseline=alert.baseline, condition_subject=alert.condition_subject,
                    condition_unit_types=alert.condition_unit_types
                )
                alert_notification(alert_log)
                for property in alert.overall_properties:
                    AlertLogDetailFactory(
                        alert_log=alert_log, property=property
                    )


def generate_historical_report(days=30, today=timezone.now().astimezone(tz=TZ)):
    start = today - timedelta(days=days)
    while start < today:
        start += timedelta(days=1)
        for property in Property.objects.all():
            report = ReportFactory(property=property, date=start.date())
            for unit_type in property.unit_types.all():
                UnitRentReportFactory(property=property, report=report, unit_type=unit_type)


def generate_compete_mock():
    generate_compete_demo_data()
    generate_units_mock_data()
    generate_alert_mock_data()
    generate_historical_report()


def generate_compete_demo_data(use_mock_data=True, properties_limit=None):
    if use_mock_data:
        data = pd.read_csv('backend/compete/static/template/mock_non_MT_template.csv')
    else:
        data = pd.read_csv('backend/compete/static/template/initial_release_non_MT_template.csv')

    for index, item in enumerate(data['Property name']):
        if properties_limit and index > properties_limit:
            break

        market, _ = Market.objects.get_or_create(name=data['Market'][index])
        submarket, _ = Submarket.objects.get_or_create(name=data['Submarket'][index], market=market)
        property, _ = Property.objects.update_or_create(
            name=data['Property name'][index], defaults=dict(
                units_count=data['Total Number of units'][index], s3_name=data['s3 name'][index], submarket=submarket
            )
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.STUDIO, beds=0,
            defaults=dict(units_count=data['Studio number of units'][index])
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.ONE_BEDROOM, beds=1,
            defaults=dict(units_count=data['1 bed number of units'][index])
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.TWO_BEDROOM, beds=2,
            defaults=dict(units_count=data['2 bed number of units'][index])
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.THREE_BEDROOM, beds=3,
            defaults=dict(units_count=data['3 bed number of units'][index])
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.FOUR_BEDROOM, beds=4,
            defaults=dict(units_count=data['4 bed number of units'][index])
        )
        UnitType.objects.update_or_create(
            property=property, name=UnitType.FIVE_BEDROOM, beds=5,
            defaults=dict(
                units_count=data['5 bed number of units'][index] if '5 bed number of units' in data.keys() else 0
            )
        )

    if use_mock_data:
        data = pd.read_csv('backend/compete/static/template/mock_MT_template.csv')
    else:
        data = pd.read_csv('backend/compete/static/template/initial_release_MT_template.csv')

    for index, item in enumerate(data['Property']):
        if properties_limit and index > properties_limit:
            break

        market, _ = Market.objects.get_or_create(name=data['Market'][index])
        submarket, _ = Submarket.objects.get_or_create(name=data['Submarket'][index], market=market)
        if use_mock_data:
            name = data['Property'][index]
            dwell_property, _ = DwellProperty.objects.get_or_create(name=name, domain=f'{hyphens(name)}.com')
        else:
            dwell_property = DwellProperty.objects.filter(name=data['Property'][index]).first()

        property, _ = Property.objects.update_or_create(
            name=data['Property'][index],
            defaults=dict(submarket=submarket, property=dwell_property)
        )

        beds_by_type = dict(STUDIO=0, ONE_BEDROOM=1, TWO_BEDROOM=2, THREE_BEDROOM=3, FOUR_BEDROOM=4, FIVE_BEDROOM=5)
        for choice in UnitType.UNIT_TYPE_CHOICES:
            UnitType.objects.update_or_create(
                property=property, name=choice[0], beds=beds_by_type[choice[0]]
            )

    for property in Property.objects.all():
        property.competitors.set(property.submarket.properties.exclude(pk=property.pk))

    if use_mock_data:
        data = pd.read_csv('backend/compete/static/template/mock_MTR_group_template.csv')
    else:
        # todo update
        data = pd.read_csv('backend/compete/static/template/mock_MTR_group_template.csv')

    for index, item in enumerate(data['MTR Group Name']):
        submarket = Submarket.objects.filter(name=data['Linked Submarkets'][index]).first()

        if not submarket:
            continue

        market = Market.objects.get(name='Phoenix')
        mtr_group, _ = Submarket.objects.update_or_create(
            name=data['MTR Group Name'][index], market=market, defaults=dict(is_mtr_group=True)
        )
        submarket.mtr_group = mtr_group
        submarket.save()

    # Create MT submarket group
    data = pd.read_csv('backend/compete/static/template/MT_specific_submarket_group.csv')
    for index, item in enumerate(data['MT Submarket group name']):
        mt_submarket, _ = Submarket.objects.update_or_create(
            name=item, defaults=dict(is_mt_exclusive_group=True)
        )
        property = Property.objects.filter(name=data['Property'][index]).first()
        if not property:
            continue
        property.mt_submarket = mt_submarket
        property.save()


def generate_units_mock_data():
    for property in Property.objects.all():
        for unit_type_name in [item[0] for item in UnitType.UNIT_TYPE_CHOICES]:
            unit_type = UnitType.objects.filter(property=property, name=unit_type_name).first()
            if not unit_type or not unit_type.units_count:
                continue

            floor_plan_name = f'F-{random.randint(0, 100)}'
            for i in range(int(unit_type.units_count / 2)):
                if i % 3 == 0:
                    floor_plan_name = f'F-{random.randint(0, 100)}'
                UnitFactory(floor_plan_name=floor_plan_name, property=property, unit_type=unit_type)


def generate_mock_data_using_history(days_back=10):
    generate_compete_demo_data()

    for property in Property.objects.all():
        start_date = datetime.now().date() - timedelta(days=days_back)

        for i in range(10):
            HistoryFactory(property=property, scrapping_date=start_date)

        unit_numbers = list(property.histories.values_list('apartment', flat=True))
        while start_date < datetime.now().date():
            start_date += timedelta(days=1)
            for unit_number in random.sample(unit_numbers, k=8):
                HistoryFactory(property=property, scrapping_date=start_date, apartment=unit_number)

    populate_data()

    start_date = datetime.now().date() - timedelta(days=days_back)
    while start_date < datetime.now().date():
        start_date += timedelta(days=1)
        generate_report(date=str(start_date))


def generate_property_type():
    data = pd.read_csv('backend/compete/static/template/property_type.csv')
    for index, item in enumerate(data['Property name']):
        property = Property.objects.filter(name__iexact=item).first()
        if not property:
            continue
        type = next((choice[0] for choice in Property.TYPE_CHOICES if choice[1] == data['Type'][index]), None)
        property.type = type
        property.save()


class Command(BaseCommand):
    help = 'Creates initial basic data for manual testing'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Creates initial basic data for manual testing

        """
        # generate_compete_mock()
        generate_mock_data_using_history()
