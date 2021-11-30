import pytz
import requests

from datetime import datetime, timedelta

from xml.etree.ElementTree import fromstring
from xmljson import badgerfish as bf

from django.utils.dateparse import parse_datetime
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.db import transaction
from django.conf import settings

from backend.api.models import Property, Lead, ProspectSource, User, Activity
from backend.api.tasks.resman.utils import fill_lead_fields_using_resman_data, convert_to_list, \
    get_employees


class Command(BaseCommand):
    help = 'Populate leads from resman'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domains',
            help="""Please specify property domains separate using comma."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Populate leads from resman

        """
        domains = options.get('domains', '')
        for property in Property.objects.filter(domain__in=domains.split(',')):
            employees = get_employees(property)
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            start_date = datetime(2020, 1, 1)
            while start_date < datetime.today() + timedelta(days=30):
                end_date = start_date + timedelta(days=30)
                body = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY,
                            AccountID=property.resman_account_id, PropertyID=property.resman_property_id,
                            ModifiedStartDateTime=start_date.strftime('%Y-%m-%d'), ModifiedEndDateTime=end_date)
                response = requests.post('https://api.myresman.com/MITS/SearchProspects', data=body, headers=headers)
                if response.status_code != 200:
                    print(f'Something wrong happened! for {property.name}')
                    break

                content = bf.data(fromstring(response.content))['ResMan']
                process_pulling_leads(property, content, employees)
                start_date = end_date
            detect_duplicated_leads(property)


def process_pulling_leads(property, content, employees):
    if content.get('Status') == 'Failed':
        error_desc = content.get('ErrorDescription')
        print(f'Resman pulling floor plans of <{property.domain}> failed : {error_desc}')
    else:
        prospects = content['Response']['LeadManagement']['Prospects']
        if not prospects:
            return
        prospects = prospects['Prospect']
        for prospect in prospects:
            customer = convert_to_list(prospect['Customers']['Customer'])[0]
            if customer['@Type'] != 'prospect':
                continue
            identification = customer['Identification']
            resman_prospect_id = resman_person_id = None
            for item in identification:
                if item['@IDType'] == 'PersonID':
                    resman_person_id = item['@IDValue']
                if item['@IDType'] == 'ProspectID':
                    resman_prospect_id = item['@IDValue']

            try:
                lead = Lead.objects.get(resman_prospect_id=resman_prospect_id, property=property)
            except Lead.DoesNotExist:
                lead = Lead(property=property, resman_prospect_id=resman_prospect_id)
            lead.resman_person_id = resman_person_id

            created = None
            if prospect.get('Events'):
                events = convert_to_list(prospect['Events']['Event'])
                event = [item for item in events if item['FirstContact']['$']][0]

                # Update owner
                agent_id = event['Agent']['AgentID']['@IDValue']
                created = event['@EventDate']
                employee = [item for item in employees if item.get('ID') == agent_id]
                employee = employee[0] if len(employee) else None
                if employee:
                    lead.owner = User.objects.filter(email=employee.get('Email')).first()

                # Update source
                transaction_source = event['TransactionSource']['$']
                lead.source = ProspectSource.objects.filter(external_id=transaction_source).first()

            if parse_datetime(created).replace(tzinfo=pytz.UTC) < datetime(2020, 1, 1).replace(tzinfo=pytz.UTC):
                continue

            lead = fill_lead_fields_using_resman_data(lead, prospect)
            if created:
                act = Activity.objects.filter(type=Activity.LEAD_CREATED, property=property, lead=lead).first()
                act.created = created
                act.save()
                lead.created = created
                lead.save()

            print(f'<{lead.first_name}> <{lead.last_name}> are successfully created!')


def detect_duplicated_leads(property):
    duplicated_leads_group = []
    for lead in Lead.objects.filter(property=property):
        condition = Q(first_name=lead.first_name, last_name=lead.last_name)
        if lead.email:
            condition = condition & Q(email=lead.email)
        if lead.phone_number:
            condition |= condition & Q(phone_number=lead.phone_number)
        leads = Lead.objects.filter(property=property).filter(condition)
        if leads.count() > 1 and not len([leads for leads in duplicated_leads_group if lead in leads]):
            duplicated_leads_group.append(leads)
    for leads in duplicated_leads_group:
        print(leads.values('id', 'first_name', 'last_name'))
