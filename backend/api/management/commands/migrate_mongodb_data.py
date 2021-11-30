import json
from django.core.management.base import BaseCommand
from django.db import transaction
from pymongo import MongoClient

from backend.site.models import PageData, Promotion
from backend.api.models import Property


def _generate_site_data(page_data, resources, promotions):
    print('======== Importing Page Data ========')
    for page_data in page_data:
        property = Property.objects.filter(domain=page_data.get('domain')).first()
        if not property:
            continue
        for data in page_data.get('data'):
            values = json.dumps(data['values']).replace('NaN', '0')
            PageData.objects.update_or_create(
                property=property,
                section=data['section'],
                defaults=dict(
                    values=json.loads(values),
                )
            )

    print('======== Importing Promotions ========')
    for promotions_data in resources:
        property = Property.objects.filter(domain=promotions_data.get('domain')).first()
        if not property:
            continue

        Promotion.objects.create(
            property=property,
            name=promotions_data.get('name'),
            promotion_text=promotions_data.get('promotionText'),
            promotion_html=promotions_data.get('promotionHTML'),
            is_active=promotions_data.get('isActive'),
            image=promotions_data.get('image'),
            button_label=promotions_data.get('buttonLabel', 'Select A Unit'),
            seo_title=promotions_data.get('seo', {}).get('title'),
            seo_description=promotions_data.get('seo', {}).get('description'),
            created=promotions_data.get('createdAt'),
            updated=promotions_data.get('updatedAt')
        )
        print('Saving promotion for property: {} '.format(property.name))

    # We don't use Resources feature any more
    # print('======== Importing Resources ========')
    # for resources_data in promotions:
    #     property = Property.objects.filter(domain=resources_data.get('domain')).first()
    #     if not property:
    #         continue
    #
    #     for data in resources_data.get('data'):
    #         Resource.objects.create(
    #             property=property,
    #             section=data['section'],
    #             values=data['values'],
    #             created=resources_data.get('createdAt'),
    #             updated=resources_data.get('updatedAt'),
    #         )


class Command(BaseCommand):
    help = 'Import data from MST database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--db_uri',
            help="""Mongodb connection url string."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Import properties, clients, users data from MST mongodb.

        """
        mongo_client = MongoClient(options['db_uri'])
        db = mongo_client.LiftLyticsPlatform
        m_page_data = db.pagedatas
        m_promotions = db.promotions
        m_resources = db.resources

        _generate_site_data(m_page_data.find(), m_promotions.find(), m_resources.find())
