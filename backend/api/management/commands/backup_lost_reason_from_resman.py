import requests

from xml.etree.ElementTree import fromstring
from xmljson import badgerfish as bf

from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings

from backend.api.models import Lead, ProspectLostReason
from backend.api.tasks.resman.utils import convert_to_list


class Command(BaseCommand):
    help = 'Backup lost reason from resman'

    @transaction.atomic
    def handle(self, *args, **options):
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        for lead in Lead.objects.filter(lost_reason=None, status='LOST').exclude(resman_prospect_id=None):
            property = lead.property

            body = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY,
                        AccountID=property.resman_account_id, PropertyID=property.resman_property_id,
                        ProspectID=lead.resman_prospect_id)
            response = requests.post('https://api.myresman.com/MITS/SearchProspects', data=body, headers=headers)
            if response.status_code != 200:
                print(
                    f'Pulling prospect of <{lead.first_name} {lead.last_name}> with <{lead.resman_prospect_id}> was failed'
                )
                return

            content = bf.data(fromstring(response.content))['ResMan']

            if content['Status']['$'] == 'Error':
                error_description = content.get('ErrorDescription')
                print(
                    f'Pulling prospect of <{lead.first_name} {lead.last_name}>'
                    f' with <{lead.resman_prospect_id}> was failed - {error_description}'
                )
                return

            prospect = content['Response']['LeadManagement']['Prospects']['Prospect']
            backup_lost_reason(lead, prospect)


def backup_lost_reason(lead, prospect):
    customers = convert_to_list(prospect['Customers']['Customer'])
    customer = customers.pop(0)
    if customer['@Type'] == 'lost' and lead.status == 'LOST':
        if prospect.get('Events'):
            events = convert_to_list(prospect['Events']['Event'])
            for event in events:
                if event['@EventType'].lower() == 'cancel' and lead.status == 'LOST' and not lead.lost_reason:
                    reason_name = event['EventReasons']['$'][len('Prospect Lost: '):]
                    lost_reason = ProspectLostReason.objects.filter(name__iexact=reason_name,
                                                                    prperty=lead.property).first()
                    if lost_reason:
                        lead.lost_reason = lost_reason
                        print(lost_reason)
                        lead.save()
                        return
