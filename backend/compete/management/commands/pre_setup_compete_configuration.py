import pytz
import pandas as pd

from django.core.management.base import BaseCommand
from django.db import transaction

from backend.compete.models import WatchList, Comparison, Alert, UnitType
from backend.api.models import User

TZ = pytz.timezone('America/Phoenix')


class Command(BaseCommand):
    help = 'Creates initial basic data for manual testing'

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Creates initial basic data for manual testing

        """
        data = pd.read_csv('backend/compete/static/template/property_manager_list.csv')
        for index, email in enumerate(data['MCO Username']):
            property_name = data['Property Name'][index]
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                print(f'{email} {property_name} - User does not exist')
                continue

            dwell_property = user.properties.filter(name=property_name).first()
            if not dwell_property:
                print(f'{email} {property_name} - Property does not exist')
                continue

            property = getattr(dwell_property, 'compete_property', None)
            if not property:
                print(f'{email} {property_name} - Compete property does not exist')
                continue

            submarket = property.submarket
            mtr_group = submarket.mtr_group

            # save property, submarket, mtr group to watchlist
            WatchList.objects.update_or_create(property=property, user=user, defaults=dict(is_stored=True))
            WatchList.objects.update_or_create(submarket=submarket, user=user, defaults=dict(is_stored=True))
            if mtr_group:
                WatchList.objects.update_or_create(submarket=mtr_group, user=user, defaults=dict(is_stored=True))

            # create property <> submarket comparison
            comparison, _ = Comparison.objects.get_or_create(
                subject_asset_type='PROPERTY', compared_asset_type='SUB_MARKET',
                subject_property=property, compared_sub_market=submarket, user=user
            )
            WatchList.objects.update_or_create(comparison=comparison, user=user, defaults=dict(is_stored=True))

            # create benchmark alert
            alert_name = f'{property.name} - {property.submarket.name} - Benchmark'
            alert = Alert.objects.create(
                name=alert_name, type=Alert.BENCHMARK, track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, user=user
            )
            alert.submarkets.add(submarket)

            # create rent threshold alert
            alert_name = f'{property.name} - {property.submarket.name} - Rent'

            unit_types = [i[0] for i in UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'),)]

            alert = Alert.objects.create(
                name=alert_name, type=Alert.THRESHOLD, baseline=Alert.LAST_4_WEEKS, condition_subject=Alert.RENT,
                condition_type=Alert.INCREASES_OR_DECREASES, condition_value=1.5, condition_unit_types=unit_types,
                track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, user=user
            )
            alert.submarkets.add(submarket)

            # create rent threshold alert
            alert_name = f'{property.name} - {property.submarket.name} - Occupancy'
            alert = Alert.objects.create(
                name=alert_name, type=Alert.THRESHOLD, baseline=Alert.LAST_4_WEEKS, condition_subject=Alert.OCCUPANCY,
                condition_type=Alert.INCREASES_OR_DECREASES, condition_value=3,
                track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, user=user
            )
            alert.submarkets.add(submarket)

            # create rent threshold alert
            alert_name = f'{property.name} - {property.submarket.name} - Concession'
            alert = Alert.objects.create(
                name=alert_name, type=Alert.THRESHOLD, baseline=Alert.LAST_4_WEEKS, condition_subject=Alert.CONCESSION,
                condition_type=Alert.INCREASES_OR_DECREASES, condition_value=3,
                track_assets_mode=Alert.TRACK_ASSETS_IN_SUB_MARKETS, user=user
            )
            alert.submarkets.add(submarket)
