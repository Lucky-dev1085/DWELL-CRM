import logging

from datetime import datetime
from django.utils import timezone
from xml.etree.ElementTree import Element, SubElement

from backend.api.models import ProspectSource, RealPageEmployee, FloorPlan, Roommate, ReasonForMoving, PetWeight,\
    PriceRange, Lead
from backend.api.tasks.resman.utils import convert_to_list
from xmljson import badgerfish as bf
from .utils import invoke_real_page_api


def fill_lead_fields_using_real_page_data(lead, guest_card):
    """
    Fill out our lead record with provided prospect data of Real Page
    :param lead: lead model record
    :param guest_card: prospect json data
    :return:
    """
    source = ProspectSource.objects.filter(
        property=lead.property, external_id=guest_card['PrimaryLeadSource']['$']).first()
    if source:
        lead.source = source

    employee = RealPageEmployee.objects.filter(
        property=lead.property, external_id=guest_card.get('LeasingAgentID', {}).get('$')).exclude(user=None).first()
    if employee:
        lead.owner = employee.user

    if guest_card.get('MoveInReason'):
        moving_reason = ReasonForMoving.objects.filter(
            property=lead.property, external_id=guest_card['MoveInReason']['$']).first()
        if moving_reason:
            lead.moving_reason = moving_reason
    else:
        lead.moving_reason = None

    if guest_card.get('PetWeightRange'):
        pet_weight = PetWeight.objects.filter(
            property=lead.property, external_id=guest_card['PetWeightRange']['$']).first()
        if pet_weight:
            lead.real_page_pet_weight = pet_weight
    else:
        lead.real_page_pet_weight = None

    preferences = guest_card['Preferences']
    if preferences.get('Occupants'):
        lead.occupants = preferences['Occupants']['$']
    else:
        lead.occupants = 0

    if preferences.get('LeaseTermMonths'):
        lead.lease_term = preferences['LeaseTermMonths']['$']
    else:
        lead.lease_term = 0

    if preferences.get('PriceRangeID'):
        price_range = PriceRange.objects.filter(
            property=lead.property, external_id=preferences['PriceRangeID']['$']).first()
        if price_range:
            lead.price_range = price_range
    else:
        lead.price_range = None

    if preferences.get('FloorplanID'):
        floor_plan = FloorPlan.objects.filter(
            property=lead.property, external_id=preferences['FloorplanID']['$']).first()
        if floor_plan:
            lead.floor_plan.add(floor_plan)

    if preferences.get('DateNeeded'):
        lead.move_in_date = datetime.strptime(preferences['DateNeeded']['$'], '%Y-%m-%dT%H:%M:%S').date()
    else:
        lead.move_in_date = None

    customers = convert_to_list(guest_card['Prospects']['Prospect'])
    customer = customers.pop(0)

    if customer.get('FirstName'):
        lead.first_name = customer['FirstName']['$']

    if customer.get('LastName'):
        lead.last_name = customer['LastName']['$']

    if customer.get('Numbers'):
        lead.phone_number = convert_to_list(customer['Numbers']['PhoneNumber'])[0]['Number']['$']
    else:
        lead.phone_number = None

    if customer.get('Email'):
        lead.email = customer['Email']['$']
    else:
        lead.email = None

    if customer.get('PrefCommunicationType'):
        lead.best_contact_method = customer['PrefCommunicationType']['$']
    else:
        lead.best_contact_method = None

    lead.pms_sync_date = timezone.now()
    lead.pms_sync_status = 'SUCCESS'
    lead.save()
    create_roommates_from_real_page(customers, lead)
    return lead


def create_roommates_from_real_page(customers, lead):
    """
    Create room mates from Real Page.
    :param customers:
    :param lead:
    :return:
    """
    for customer in customers:
        customer_id = customer['CustomerID']['$']
        roommate = Roommate.objects.filter(real_page_customer_id=customer_id, lead=lead).first()
        if not roommate:
            roommate = Roommate(real_page_customer_id=customer_id, lead=lead, property=lead.property)

        if customer.get('FirstName'):
            roommate.first_name = customer['FirstName']['$']
        if customer.get('LastName'):
            roommate.last_name = customer['LastName']['$']

        if customer.get('Numbers'):
            roommate.phone_number = convert_to_list(customer['Numbers']['PhoneNumber'])[0]['Number']['$']
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


def sync_real_page_prospects_for_given_period(property, start_time, end_time):
    """
    This method will filter the prospects for given period and sync the prospects of Dwell
    :return: it will return True if it's successfully done.
    """
    search_criterion = Element('tem:prospectSearchCriterion')

    modified_date = SubElement(SubElement(search_criterion, 'tem:ProspectSearchCriterion'), 'tem:modifieddate')
    SubElement(modified_date, 'tem:datefrom').text = start_time.astimezone(tz=property.timezone).strftime(
        '%Y-%m-%d')
    SubElement(modified_date, 'tem:dateto').text = end_time.astimezone(tz=property.timezone).strftime(
        '%Y-%m-%d')

    content = invoke_real_page_api('prospectsearch', property, search_criterion)
    if not content.find('.//GuestCards'):
        return
    guest_cards = convert_to_list(bf.data(content.find('.//GuestCards'))['GuestCards']['GuestCard'])
    logging.info(f'pull started - {start_time} ~ {end_time} for {property.name}')

    for guest_card in guest_cards:
        guest_card_id = guest_card['GuestCardID']['$']
        customer = convert_to_list(guest_card['Prospects']['Prospect'])[0]
        customer_id = customer['CustomerID']['$']

        lead = Lead.objects.filter(real_page_guest_card_id=guest_card_id,
                                   real_page_customer_id=customer_id).first()
        if lead:
            fill_lead_fields_using_real_page_data(lead, guest_card)

    return True
