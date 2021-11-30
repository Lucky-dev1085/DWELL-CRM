from datetime import datetime
import json

import backoff
import requests
import logging
from xml.etree.ElementTree import fromstring, Element, SubElement
from xmljson import badgerfish as bf
from xml.etree.ElementTree import tostring
from django.conf import settings
from django.utils import timezone
from django.db import transaction

from backend.api.models import Unit, Lead, Roommate, ProspectLostReason, CurrentResident, PetType

headers = {'Content-Type': 'application/x-www-form-urlencoded'}
resman_config = dict(IntegrationPartnerID=settings.RESMAN_INTEGRATION_PARTNER_ID, ApiKey=settings.RESMAN_API_KEY)


def get_content(response):
    return bf.data(fromstring(response.content))['ResMan']


@backoff.on_predicate(backoff.fibo, lambda response: response.status_code != 200,
                      max_tries=settings.MAX_PMS_SYNC_RETRIES + 1)
def get_response(url, body):
    return requests.post(url, data=body, headers=headers)


@backoff.on_predicate(backoff.fibo,
                      lambda response: response.status_code == 200 and get_content(response)['Status']['$'] == 'Error',
                      max_tries=settings.MAX_PMS_SYNC_RETRIES + 1)
def get_response_with_content(url, body):
    return get_response(url, body)


def post_lead_to_resman(lead, lead_management):
    """
    post generic lead to resman to be synced
    :param lead: lead object
    :param lead_management: lead payloads
    :return:
    """
    body = dict(AccountID=lead.property.resman_account_id, PropertyID=lead.property.resman_property_id,
                Xml=tostring(lead_management).decode('utf-8'), **resman_config)

    response = get_response_with_content('https://api.myresman.com/MITS/PostLeadManagement4_0', body)
    if response.status_code != 200:
        logging.info(
            f'[ResMan Sync]: The sync of lead <{lead.name}> at {lead.property.name} failed:  {lead.id}'
        )
        resman_sync_failure_callback(lead)
        return

    content = get_content(response)
    if content['Status']['$'] == 'Error':
        error_description = content.get('ErrorDescription')
        resman_sync_failure_callback(lead)
        if 'Transaction Source could not be found' in str(error_description):
            logging.info(f'[ResMan Sync]: Transaction Source not found - lead: {lead.id} '
                         f'source: {lead.source.name} - {lead.source.external_id}')
        else:
            logging.info(f'[ResMan Sync]: The sync of lead <{lead.name}> at {lead.property.name} failed: {lead.id} , '
                         f'here are the payloads - {error_description}')
        return

    return content


def resman_sync_failure_callback(lead):
    """
    Update resman failed sync status
    :return:
    """
    lead = Lead.objects.select_for_update().filter(pk=lead.pk)
    with transaction.atomic():
        lead.update(pms_sync_status='FAILURE', pms_sync_date=timezone.localtime(timezone.now()))


def get_employees(property):
    """
    Pull resman agents for specific property
    :param property:
    :return:
    """
    body = dict(AccountID=property.resman_account_id, PropertyID=property.resman_property_id, **resman_config)
    response = requests.post('https://api.myresman.com/Leasing/GetEmployees', data=body, headers=headers)
    if response.status_code != 200:
        logging.error(
            f'Pulling employee of <{property.name}> was failed'
        )
        return None
    content = json.loads(response.content)
    if content.get('Status') == 'Failed':
        logging.error(
            f'Pulling employee of <{property.name}> was failed'
        )
        return None
    else:
        return content.get('Employees', [])


def get_employee(employees, id=None, email=None):
    """
    Find the email matching employee from resman agents by using id or email.
    :param employees: array of agent
    :param id: resman agent id
    :param email: resman agent email
    :return:
    """
    employee = []
    if id:
        employee = [item for item in employees if item.get('ID') == id]
    if email:
        employee = [item for item in employees if item.get('Email') == email]
    return employee[0] if len(employee) else None


def fill_lead_fields_using_resman_data(lead, prospect):
    """
    Fill out our lead record with provided prospect data of Resman
    :param lead: lead model record
    :param prospect: prospect json data
    :return:
    """
    old_lead = Lead.objects.get(pk=lead.pk)
    customers = convert_to_list(prospect['Customers']['Customer'])

    current_residents = []
    for item in customers:
        if item['@Type'].lower() in ['current_resident', 'applicant']:
            current_residents.append(item)

    pull_residents_and_applicants_from_customer(current_residents, lead)
    # if customer['@Type'] == 'lost':
    #     lead.status = Lead.LEAD_LOST
    #     lead.resman_prospect_lost = True
    # elif lead.status == Lead.LEAD_LOST:
    #     lead.status = Lead.LEAD_ACTIVE
    #     lead.resman_prospect_lost = False

    customer = customers.pop(0)
    name = customer.get('Name')
    if name:
        if name.get('FirstName'):
            lead.first_name = name['FirstName']['$']
        if name.get('LastName'):
            lead.last_name = name['LastName']['$']

    if customer.get('Phone'):
        lead.phone_number = convert_to_list(customer['Phone'])[0]['PhoneNumber']['$']
    else:
        lead.phone_number = None

    if customer.get('Email'):
        lead.email = customer['Email']['$']
    else:
        lead.email = None

    for item in customer.get('Identification', []):
        if item['@IDType'] == 'PersonID':
            lead.resman_person_id = item['@IDValue']

    preferences = prospect['CustomerPreferences']

    if preferences.get('TargetMoveInDate'):
        lead.move_in_date = datetime.strptime(preferences['TargetMoveInDate']['$'], '%Y-%m-%d').date()
    else:
        lead.move_in_date = None

    units = []
    desired_units = preferences.get('DesiredUnit')
    if desired_units:
        desired_units = desired_units if type(desired_units) is list else [desired_units]
        for unit in desired_units:
            unit_record = Unit.objects.filter(unit=unit['MarketingName']['$']).first()
            if unit_record:
                units.append(unit_record)

    if preferences.get('DesiredRent'):
        keys = preferences['DesiredRent'].keys()
        if '@Max' in keys:
            lead.desired_rent = int(preferences['DesiredRent']['@Max'])
        elif '@Exact' in keys:
            lead.desired_rent = int(preferences['DesiredRent']['@Exact'])
        else:
            lead.desired_rent = None
    else:
        lead.desired_rent = None

    if preferences.get('DesiredNumBedrooms'):
        keys = preferences['DesiredNumBedrooms'].keys()
        if '@Exact' in keys:
            lead.beds = int(preferences['DesiredNumBedrooms']['@Exact'])
        elif '@Max' in keys:
            lead.beds = int(preferences['DesiredNumBedrooms']['@Max'])
        else:
            lead.beds = None
    else:
        lead.beds = None

    if preferences.get('DesiredNumBathrooms'):
        keys = preferences['DesiredNumBathrooms'].keys()
        if '@Exact' in keys:
            lead.baths = int(preferences['DesiredNumBathrooms']['@Exact'])
        elif '@Max' in keys:
            lead.baths = int(preferences['DesiredNumBathrooms']['@Max'])
        else:
            lead.baths = None
    else:
        lead.baths = None

    pets = preferences.get('Pets')
    if pets:
        pets = pets if type(pets) is list else [pets]
        lead.pets = int(pets[0].get('@Count', 0))
        lead.pet_type = PetType.objects.filter(name__iexact=pets[0]['@PetType'].upper()).first()
    else:
        lead.pets = None
        lead.pet_type = None

    if prospect.get('Events'):
        events = convert_to_list(prospect['Events']['Event'])
        for event in events:
            if event['@EventType'].lower() == 'cancel' and lead.status == 'LOST' and not lead.lost_reason:
                reason_name = event['EventReasons']['$'][len('Prospect Lost: '):]
                lost_reason = ProspectLostReason.objects.filter(name__iexact=reason_name,
                                                                property=lead.property).first()
                if lost_reason:
                    lead.lost_reason = lost_reason
            if event['@EventType'] == 'LeaseSign':
                if lead.stage in [Lead.STAGE_TOUR_SET, Lead.STAGE_TOUR_COMPLETED, Lead.STAGE_APPLICATION_PENDING,
                                  Lead.STAGE_APPLICATION_COMPLETE] and lead.status == Lead.LEAD_ACTIVE:
                    lead.status = Lead.LEAD_CLOSED

    changeable_fields = ['first_name', 'last_name', 'phone_number', 'email', 'resman_person_id', 'move_in_date',
                         'desired_rent', 'beds', 'baths', 'pets', 'pet_type', 'status']

    changed_fields = []
    for field in changeable_fields:
        if getattr(old_lead, field, None) != getattr(lead, field, None):
            changed_fields.append(field)
    if len(changed_fields):
        lead.resman_changed_field = (lead.resman_changed_field or []) + changed_fields

    lead.pms_sync_date = timezone.now()
    lead.pms_sync_status = 'SUCCESS'
    logging.info(f'ResSan to Dwell sync debugging info: lead: {lead.name}-{lead.pk} stage: {lead.stage}')
    lead.save()
    lead.units.set(units)
    create_roommates_from_resman(customers, lead)
    return lead


def create_roommates_from_resman(customers, lead):
    """
    Create room mates from Resman.
    :param customers:
    :param lead:
    :return:
    """
    for customer in customers:
        resman_person_id = None
        for item in customer.get('Identification', []):
            if item['@IDType'] == 'PersonID':
                resman_person_id = item['@IDValue']
        roommate = Roommate.objects.filter(resman_person_id=resman_person_id, lead=lead).first()
        if not roommate:
            roommate = Roommate(resman_person_id=resman_person_id, lead=lead, property=lead.property)
        name = customer['Name']
        if name.get('FirstName'):
            roommate.first_name = name['FirstName']['$']
        if name.get('LastName'):
            roommate.last_name = name['LastName']['$']

        if customer.get('Phone'):
            roommate.phone_number = convert_to_list(customer['Phone'])[0]['PhoneNumber']['$']
        else:
            roommate.phone_number = None

        if customer.get('Email'):
            roommate.email = customer['Email']['$']
        else:
            roommate.email = None

        changed = False
        if roommate.pk:
            changeable_fields = ['first_name', 'last_name', 'phone_number', 'email']
            original_roommate = Roommate.objects.get(pk=roommate.pk)
            for field in changeable_fields:
                if getattr(original_roommate, field, None) != getattr(roommate, field, None):
                    changed = True
        else:
            changed = True

        if changed:
            roommate.save()
    return


def pull_residents_and_applicants_from_customer(customers, lead):
    """
    Pull the current residents and applicants
    :param customers:
    :param lead:
    :return:
    """
    for customer in customers:
        resman_person_id = None
        for item in customer.get('Identification', []):
            if item['@IDType'] == 'PersonID':
                resman_person_id = item['@IDValue']
        resident, created = CurrentResident.objects.get_or_create(property=lead.property, person_id=resman_person_id)

        if not created:
            continue

        name = customer.get('Name')
        if name:
            if name.get('FirstName'):
                resident.first_name = name['FirstName']['$']
            if name.get('LastName'):
                resident.last_name = name['LastName']['$']

        if customer.get('Phone'):
            phone_fields = ['mobile_phone', 'home_phone', 'work_phone']
            for index, phone in enumerate(convert_to_list(customer['Phone'])):
                setattr(resident, phone_fields[index], phone['PhoneNumber']['$'])

        resident.save()


def pull_applications(property):
    """
    Pull applications
    :return:
    """
    if not property.resman_account_id and not property.resman_property_id:
        return False
    body = dict(AccountID=property.resman_account_id, PropertyID=property.resman_property_id, **resman_config)
    response = requests.post('https://api.myresman.com/Leasing/GetApplicantsAndCurrentResidents', data=body,
                             headers=headers)
    if response.status_code != 200:
        logging.error(
            f'Pulling application status of <{property.name}> was failed with status code ${response.status_code}'
        )
        return False
    content = json.loads(response.content)
    if content.get('Status') == 'Failed':
        logging.error(
            f'Pulling application status of <{property.name}> was failed'
        )
        return False
    else:
        return content.get('People', [])


def search_prospect_by_attribute(lead, attribute_type='name'):
    """
    Search prospect from ResMan using first & last name or email or phone number
    :param lead:
    :param attribute_type:
    :return:
    """
    property = lead.property
    body = dict(AccountID=property.resman_account_id, PropertyID=property.resman_property_id, **resman_config)
    if attribute_type == 'name':
        body = dict(FirstName=lead.first_name, LastName=lead.last_name, **body)
    if attribute_type == 'email':
        body = dict(Email=lead.email, **body)
    if attribute_type == 'phone':
        body = dict(Phone=lead.phone_number, **body)

    response = get_response_with_content('https://api.myresman.com/MITS/SearchProspects', body)
    if response.status_code != 200:
        logging.error(
            f'Pulling prospect of <{lead.first_name} {lead.last_name}> for checking existence was failed'
        )
        return

    content = get_content(response)
    if content['Status']['$'] == 'Error':
        return

    if not len(content['Response']['LeadManagement']['Prospects']):
        return

    return content


def check_prospect_existence(lead, employee_id=None):
    """
    Check the given lead exists on Resman so that we can not make duplicated prospects.
    :param lead:
    :param employee_id:
    :return:
    """
    content = search_prospect_by_attribute(lead, 'name')
    if not content:
        content = search_prospect_by_attribute(lead, 'email')

    if not content:
        content = search_prospect_by_attribute(lead, 'phone')

    if not content:
        return

    prospects = convert_to_list(content['Response']['LeadManagement']['Prospects'])
    lost_reason = ProspectLostReason.objects.filter(property=lead.property,
                                                    name='Inactive (Lack of Response)').first()
    if not len(prospects):
        return
    else:
        customer_type = 'prospect'
        if lead.status == Lead.LEAD_LOST:
            customer_type = 'lost'
        if lead.status == Lead.LEAD_CLOSED:
            customer_type = 'current_resident'
        prospect_list = convert_to_list(prospects[0]['Prospect'])
        for prospect in prospect_list:
            customers = convert_to_list(prospect['Customers']['Customer'])
            for customer in customers:
                name = customer['Name']
                first_name = name.get('FirstName', {}).get('$')
                last_name = name.get('LastName', {}).get('$')
                email = customer.get('Email', {}).get('$')
                phone_number = customer.get('Phone', {}).get('PhoneNumber', {}).get('$')

                is_met_condition = False

                if first_name and last_name and lead.first_name and lead.last_name:
                    is_met_condition = first_name.lower() == lead.first_name.lower() and \
                                       last_name.lower() == lead.last_name.lower()

                if not is_met_condition and email and lead.email:
                    is_met_condition = email == lead.email

                if not is_met_condition and phone_number and lead.phone_number:
                    is_met_condition = phone_number == lead.phone_number

                if customer['@Type'] != customer_type or not is_met_condition:
                    continue

                identification = customer['Identification']
                resman_person_id = None
                resman_prospect_id = None
                for item in identification:
                    if item['@IDType'] == 'PersonID':
                        resman_person_id = item['@IDValue']
                    if item['@IDType'] == 'ProspectID':
                        resman_prospect_id = item['@IDValue']

                duplicated_lead = Lead.objects.filter(
                    property=lead.property, resman_person_id=resman_person_id, resman_prospect_id=resman_prospect_id
                ).first()
                if duplicated_lead:
                    # If there's existing lead which has synced with this prospect, then we give up sync of current lead
                    # to avoid multiple leads sync in one prospect
                    # add logging and stop
                    logging.info(f'[ResMan sync]: Syncing lead <{lead.name}> faces the duplicated lead '
                                 f'<{duplicated_lead.name}>: {lead.id} {duplicated_lead.id}')
                    return

                if not lead.resman_person_id and not lead.resman_prospect_id:
                    lead.resman_person_id = resman_person_id
                    lead.resman_prospect_id = resman_prospect_id
                else:
                    if lost_reason:
                        remove_duplicated_lead(lead, resman_prospect_id, resman_person_id, employee_id,
                                               lost_reason.external_id)
        return lead


def remove_duplicated_lead(lead, prospect_id, person_id, employee_id, lost_reason):
    """
    Remove duplicated lead from Resman
    :return:
    """
    lead_management = Element('LeadManagement')
    prospects = SubElement(lead_management, 'Prospects')
    prospect = SubElement(prospects, 'Prospect')

    # Customers
    customers = SubElement(prospect, 'Customers')
    customer = SubElement(customers, 'Customer', dict(Type='lost'))
    SubElement(customer, 'Identification', dict(IDType='ProspectID', IDValue=prospect_id, OrganizationName='ResMan'))
    SubElement(customer, 'Identification', dict(IDType='PersonID', IDValue=person_id, OrganizationName='ResMan'))
    name = SubElement(customer, 'Name')

    first_name = SubElement(name, 'FirstName')
    first_name.text = lead.first_name

    last_name = SubElement(name, 'LastName')
    last_name.text = lead.last_name

    events = SubElement(prospect, 'Events')
    event = SubElement(events, 'Event',
                       dict(EventType='Cancel', EventDate=timezone.now().strftime('%Y-%m-%dT%H:%M:%S.%f')))
    agent = SubElement(event, 'Agent')
    SubElement(agent, 'AgentID', dict(IDValue=employee_id))
    first_contact = SubElement(event, 'FirstContact')
    first_contact.text = 'False'
    source = SubElement(event, 'TransactionSource')
    source.text = lost_reason

    body = dict(AccountID=lead.property.resman_account_id, PropertyID=lead.property.resman_property_id,
                Xml=tostring(lead_management).decode('utf-8'), **resman_config)
    requests.post('https://api.myresman.com/MITS/PostLeadManagement4_0', data=body, headers=headers)


def get_expected_move_in(start_date, end_date, property):
    """
    Get expected move in count from Resman
    :param start_date:
    :param end_date:
    :param property:
    :return:
    """
    body = dict(AccountID=property.resman_account_id, PropertyID=property.resman_property_id,
                ModifiedStartDateTime=start_date, ModifiedEndDateTime=end_date, **resman_config)

    response = get_response_with_content('https://api.myresman.com/MITS/SearchProspects', body)
    if response.status_code != 200:
        return

    content = get_content(response)
    if content['Status']['$'] == 'Error':
        return

    if not len(content['Response']['LeadManagement']['Prospects']):
        return
    prospects = convert_to_list(content['Response']['LeadManagement']['Prospects'])
    if not len(prospects):
        return
    else:
        prospect_list = convert_to_list(prospects[0]['Prospect'])
        count = 0
        for prospect in prospect_list:
            has_approved_event = False
            is_applicant = len([customer for customer in convert_to_list(prospect['Customers']['Customer']) if
                                customer['@Type'].lower() == 'applicant'])
            if prospect.get('Events'):
                has_approved_event = len([customer for customer in convert_to_list(prospect['Events']['Event']) if
                                          customer['@EventType'] in ['Approved', 'LeaseSign']])
            if is_applicant and has_approved_event:
                count += 1
    return count


def get_notice_to_vacate(start_date, end_date, property):
    """
    Get notice to vacate count from Resman
    :param start_date:
    :param end_date:
    :param property:
    :return:
    """
    body = dict(AccountID=property.resman_account_id, PropertyID=property.resman_property_id, StartDate=start_date,
                EndDate=end_date, **resman_config)

    response = get_response('https://api.myresman.com/Events/GetOnNotice', body)
    if response.status_code != 200:
        return

    content = response.json()
    return len(content.get('OnNotices', []))


def check_application_status(lead, people):
    """
    Check application submitting status using Resman API. Return true if application is submitted.
    :return:
    """
    if type(people) is not list:
        return people
    person = [person for person in people if person.get('PersonID') == lead.resman_person_id]
    if len(person):
        return person[0].get('Status') == 'Pending'
    return False


def convert_to_list(data):
    """
    cast dict/list to list
    :param data:
    :return:
    """
    return data if type(data) is list else [data]


def check_sync_condition(lead, employee, should_save=True):
    """
    check condition of individual lead sync
    :return:
    """
    lack_reason = None
    if not lead.owner and not lead.source:
        lack_reason = 'Not synced (set lead owner and lead source)'
    else:
        if not lead.owner:
            lack_reason = 'Not synced (set lead owner)'
        if not lead.source:
            lack_reason = 'Not synced (set lead source)'
    if not employee and lead.owner:
        lack_reason = 'Not synced (invalid lead owner)'

    if should_save and lack_reason:
        lead.pms_sync_condition_lack_reason = lack_reason
        lead.pms_sync_status = 'NOT_STARTED'
        lead.save()
    return lack_reason
