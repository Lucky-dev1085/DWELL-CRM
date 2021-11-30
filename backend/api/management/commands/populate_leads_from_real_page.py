import logging

from datetime import datetime, timedelta
from django.utils.dateparse import parse_datetime

from xml.etree.ElementTree import Element, SubElement
from xmljson import badgerfish as bf

from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.tasks.realpage.utils import invoke_real_page_api
from backend.api.models import Property, Lead
from backend.api.tasks.resman.utils import convert_to_list
from backend.api.tasks.realpage.pull_resman_prospect_and_sync import fill_lead_fields_using_real_page_data


class Command(BaseCommand):
    help = 'Populate leads from RealPage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domains',
            help="""Please specify property domains separate using comma."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Populate leads from RealPage

        """
        domains = options.get('domains', '')
        for property in Property.objects.filter(domain__in=domains.split(',')):
            start_date = datetime(2020, 8, 11)
            while start_date < datetime.today() + timedelta(days=10):
                end_date = start_date + timedelta(days=10)
                search_criterion = Element('tem:prospectSearchCriterion')

                modified_date = SubElement(SubElement(search_criterion, 'tem:ProspectSearchCriterion'), 'tem:createdate')
                SubElement(modified_date, 'tem:datefrom').text = start_date.astimezone(
                    tz=property.timezone).strftime(
                    '%Y-%m-%d')
                SubElement(modified_date, 'tem:dateto').text = end_date.astimezone(
                    tz=property.timezone).strftime(
                    '%Y-%m-%d')

                content = invoke_real_page_api('prospectsearch', property, search_criterion)
                if not content.find('.//GuestCards'):
                    return
                guest_cards = convert_to_list(bf.data(content.find('.//GuestCards'))['GuestCards']['GuestCard'])
                logging.info(f'pull started - {start_date} ~ {end_date} for {property.name}')

                for guest_card in guest_cards:
                    guest_card_id = guest_card['GuestCardID']['$']
                    customer = convert_to_list(guest_card['Prospects']['Prospect'])[0]
                    customer_id = customer['CustomerID']['$']

                    created_date = None
                    try:
                        created_date = guest_card['CreateDate']['$']
                        created_date = parse_datetime(created_date).replace(tzinfo=property.timezone)
                    except Exception as e:
                        logging.info(e)
                        pass
                    lead = Lead.objects.filter(real_page_guest_card_id=guest_card_id,
                                               real_page_customer_id=customer_id).first()
                    if not lead:
                        lead = Lead.objects.create(property=property, real_page_guest_card_id=guest_card_id,
                                                   real_page_customer_id=customer_id)
                        lead.created = created_date
                        lead.acquisition_date = created_date
                        lead.save()
                        lead.activities.all().update(created=created_date)
                    fill_lead_fields_using_real_page_data(lead, guest_card)

                start_date = end_date

            return True
