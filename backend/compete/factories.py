import random
import pytz
import factory
from django.template import defaultfilters
from faker import Faker
from backend.compete.models import Property, Market, Submarket, Unit, AlertLog, Alert, Report,\
    UnitRentReport, AlertUnitRentLog, AlertLogDetail, UnitType, History

faker = Faker()

amenity_choices = ['9 ft ceilings', 'Ceiling Fans', 'Fireplace', 'Private Patio/Balcony', 'Spacious Closets',
                   'Dishwasher', 'Frost Free Refrigerator', 'Microwave', 'Fully-equipped Kitchen',
                   'Washer/Dryer in Unit', 'Individual Heat/AC Controls']

community_choices = ['Patio/Balcony with Storage', 'Covered Parking', 'Close to schools', 'Fitness Center',
                     'Gated Entrance/Gated', 'Community', 'Heated Outdoor Swimming Pool',
                     'Package Service On-site management']

beds_choices = dict(COMBINED=[0, 0], STUDIO=[0, 0], ONE_BEDROOM=[1, 1], TWO_BEDROOM=[2, 2], THREE_BEDROOM=[3, 3],
                    FOUR_BEDROOM=[4, 4], FIVE_BEDROOM=[5, 5])


def get_choice_value(choices):
    return [choice[0] for choice in choices]


class PropertyFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('company')
    website = factory.LazyAttribute(lambda f: '{}.com'.format(defaultfilters.slugify(f.name)))
    phone_number = factory.Faker('phone_number')
    address = factory.Faker('address')
    amenities = factory.LazyAttribute(lambda f: random.choices(amenity_choices, k=5))
    communities = factory.LazyAttribute(lambda f: random.choices(community_choices, k=5))
    units_count = factory.Faker('random_number', digits=3)
    concession_amount = factory.LazyAttribute(lambda f: faker.random_number(3))
    concession_description = factory.LazyAttribute(
        lambda f: f'Receive up to ${f.concession_amount} off select units!'
    )

    class Meta:
        model = Property
        django_get_or_create = ('name', 'website',)


class HistoryFactory(factory.django.DjangoModelFactory):
    type = factory.Iterator([i[0] for i in UnitType.UNIT_TYPE_CHOICES])
    beds = factory.LazyAttribute(lambda f: beds_choices[f.type][0])
    baths = factory.LazyAttribute(lambda f: beds_choices[f.type][1])
    rent = factory.Faker('random_number', digits=3)
    sqft = factory.Faker('random_number', digits=3)
    apartment = factory.Faker('random_number', digits=3)
    scrapping_date = factory.Faker('past_date', start_date='-20d')

    class Meta:
        model = History
        django_get_or_create = ('property', 'apartment', 'scrapping_date',)


class MarketFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('city')

    class Meta:
        model = Market


class SubMarketFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('city')

    class Meta:
        model = Submarket


class UnitTypeFactory(factory.django.DjangoModelFactory):
    name = factory.Iterator([i[0] for i in UnitType.UNIT_TYPE_CHOICES])
    beds = factory.LazyAttribute(lambda f: beds_choices[f.name][0])
    baths = factory.LazyAttribute(lambda f: beds_choices[f.name][1])
    average_rent = factory.Faker('random_number', digits=3)
    average_size = factory.Faker('random_number', digits=3)
    units_count = factory.Faker('random_number', digits=2)

    class Meta:
        model = UnitType
        django_get_or_create = ('name', 'property')


class UnitFactory(factory.django.DjangoModelFactory):
    number = factory.Faker('random_int', min=4)
    beds = factory.LazyAttribute(lambda f: faker.random_number(1) % 4)
    baths = factory.LazyAttribute(lambda f: faker.random_number(1) % 4)
    unit_size = factory.Faker('random_number', digits=3)
    rent = factory.Faker('random_number', digits=3)
    available_date = factory.Faker('future_datetime', end_date='+30d', tzinfo=pytz.UTC)

    class Meta:
        model = Unit
        django_get_or_create = ('property', 'number')


class AlertFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda f: f'{faker.city()} Summary')

    class Meta:
        model = Alert


class AlertLogFactory(factory.django.DjangoModelFactory):
    sent_on = factory.Faker('past_datetime', start_date='-30d', tzinfo=pytz.UTC)

    class Meta:
        model = AlertLog


class AlertLogDetailFactory(factory.django.DjangoModelFactory):
    occupancy = factory.Faker('random_number', digits=2)
    occupancy_last_day = factory.Faker('random_number', digits=2)
    occupancy_last_week = factory.Faker('random_number', digits=2)
    occupancy_last_4_weeks = factory.Faker('random_number', digits=2)

    concession_amount = factory.Faker('random_number', digits=3)
    concession_amount_last_day = factory.Faker('random_number', digits=3)
    concession_amount_last_week = factory.Faker('random_number', digits=3)
    concession_amount_last_4_weeks = factory.Faker('random_number', digits=3)

    concession_avg_rent_percent = factory.Faker('random_number', digits=2)
    concession_avg_rent_percent_last_day = factory.Faker('random_number', digits=2)
    concession_avg_rent_percent_last_week = factory.Faker('random_number', digits=2)
    concession_avg_rent_percent_last_4_weeks = factory.Faker('random_number', digits=2)

    class Meta:
        model = AlertLogDetail

    @factory.post_generation
    def on_created(self, create, extracted, **kwargs):
        for i in range(5):
            AlertUnitRentLogFactory(alert_log_detail=self)


class AlertUnitRentLogFactory(factory.django.DjangoModelFactory):
    unit_type = factory.Iterator(get_choice_value(UnitType.UNIT_TYPE_CHOICES + (('COMBINED', 'Combined'), )))
    average_rent = factory.Faker('random_number', digits=2)
    average_rent_last_day = factory.Faker('random_number', digits=2)
    average_rent_last_week = factory.Faker('random_number', digits=2)
    average_rent_last_4_weeks = factory.Faker('random_number', digits=3)

    average_rent_per_sqft = factory.Faker('random_number', digits=2)
    average_rent_per_sqft_last_day = factory.Faker('random_number', digits=2)
    average_rent_per_sqft_last_week = factory.Faker('random_number', digits=2)
    average_rent_per_sqft_last_4_weeks = factory.Faker('random_number', digits=3)

    class Meta:
        model = AlertUnitRentLog
        django_get_or_create = ('unit_type', 'alert_log_detail')


class UnitRentReportFactory(factory.django.DjangoModelFactory):
    min_rent = factory.Faker('random_number', digits=2)
    max_rent = factory.Faker('random_number', digits=4)
    sqft_sum = factory.Faker('random_number', digits=3)
    rent_sum = factory.Faker('random_number', digits=5)
    units_count = 10

    class Meta:
        model = UnitRentReport
        django_get_or_create = ('unit_type', 'report')


class ReportFactory(factory.django.DjangoModelFactory):
    occupancy = factory.Faker('random_number', digits=2)
    available_units = factory.Faker('random_number', digits=2)
    total_units = factory.Faker('random_number', digits=3)
    concession = factory.Faker('random_number', digits=3)
    concession_avg_rent_percent = factory.Faker('random_number', digits=2)

    class Meta:
        model = Report
