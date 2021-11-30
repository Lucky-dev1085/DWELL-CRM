import logging
from xml.etree.ElementTree import Element, SubElement
from django.utils import timezone
from django.db import transaction

from backend.api.models import Lead, Roommate, ResManEmployee
from backend.celery_app import app
from .utils import post_lead_to_resman, check_prospect_existence, check_sync_condition


@app.task
def resman_sync(lead_id, owner_updated=None):
    """
    Sync individual lead with resman
    :param lead_id:
    :param owner_updated:
    :return:
    """
    try:
        lead = Lead.objects.get(pk=lead_id)
    except Lead.DoesNotExist:
        return

    try:
        employee = ResManEmployee.objects.filter(property=lead.property, user=lead.owner).first()
        if check_sync_condition(lead, employee):
            # Not started because of lack condition
            return

        # We should check the if existing record exists in Resman
        if not lead.resman_prospect_id or not lead.resman_person_id:
            result = check_prospect_existence(lead, employee_id=employee.external_id)
            if result:
                lead = result

        lead_management = Element('LeadManagement')
        prospects = SubElement(lead_management, 'Prospects')
        prospect = SubElement(prospects, 'Prospect')

        # Customers
        customers = SubElement(prospect, 'Customers')
        customer = SubElement(customers, 'Customer', dict(Type='lost' if lead.status == Lead.LEAD_LOST else 'prospect'))
        if lead.resman_prospect_id:
            SubElement(customer, 'Identification', dict(IDType='ProspectID', IDValue=lead.resman_prospect_id,
                                                        OrganizationName='ResMan'))
        if lead.resman_person_id:
            SubElement(customer, 'Identification', dict(IDType='PersonID', IDValue=lead.resman_person_id,
                                                        OrganizationName='ResMan'))
        name = SubElement(customer, 'Name')

        first_name = SubElement(name, 'FirstName')
        first_name.text = lead.first_name

        last_name = SubElement(name, 'LastName')
        last_name.text = lead.last_name

        if lead.email:
            email = SubElement(customer, 'Email')
            email.text = lead.email

        if lead.phone_number:
            phone = SubElement(customer, 'Phone', dict(PhoneType='cell'))
            phone_number = SubElement(phone, 'PhoneNumber')
            phone_number.text = lead.phone_number

        # CustomerPreferences
        preferences = SubElement(prospect, 'CustomerPreferences')

        if lead.move_in_date:
            move_in_date = SubElement(preferences, 'TargetMoveInDate')
            move_in_date.text = lead.move_in_date.strftime('%Y-%m-%d')

        if lead.floor_plan.count():
            floor_plan = SubElement(preferences, 'DesiredFloorplan')
            floor_plan.text = lead.floor_plan.first().plan

        for item in lead.units.all():
            unit = SubElement(preferences, 'DesiredUnit')
            marketing_name = SubElement(unit, 'MarketingName')
            marketing_name.text = item.unit

        if lead.desired_rent:
            SubElement(preferences, 'DesiredRent', dict(Exact=str(lead.desired_rent)))
        if lead.beds:
            SubElement(preferences, 'DesiredNumBedrooms', dict(Exact=str(int(lead.beds))))
        if lead.baths:
            SubElement(preferences, 'DesiredNumBathrooms', dict(Exact=str(int(lead.baths))))
        if lead.lease_term:
            lease_term = SubElement(preferences, 'DesiredLeaseTerms')
            lease_term.text = str(lead.lease_term)

        if lead.pets and lead.pet_type:
            pet_type = lead.pet_type.name if lead.pet_type else None
            SubElement(preferences, 'Pets', dict(PetType=pet_type, Count=str(lead.pets)))

        if lead.occupants:
            occupants = SubElement(preferences, 'NumberOfOccupants')
            occupants.text = str(lead.occupants)

        events = SubElement(prospect, 'Events')
        if not lead.resman_prospect_id or (lead.resman_prospect_id and owner_updated):
            event = SubElement(events, 'Event', dict(EventType='other', EventDate=timezone.now().strftime('%Y-%m-%dT%H:%M:%S.%f')))
            agent = SubElement(event, 'Agent')
            SubElement(agent, 'AgentID', dict(IDValue=employee.external_id))
            first_contact = SubElement(event, 'FirstContact')
            first_contact.text = 'True'
            source = SubElement(event, 'TransactionSource')
            source.text = lead.source.external_id

        resman_prospect_lost = lead.resman_prospect_lost

        if lead.status == Lead.LEAD_LOST and lead.lost_reason and not lead.resman_prospect_lost:
            event = SubElement(events, 'Event', dict(EventType='Cancel', EventDate=timezone.now().strftime('%Y-%m-%dT%H:%M:%S.%f')))
            agent = SubElement(event, 'Agent')
            SubElement(agent, 'AgentID', dict(IDValue=employee.external_id))
            first_contact = SubElement(event, 'FirstContact')
            first_contact.text = 'False'
            source = SubElement(event, 'TransactionSource')
            source.text = lead.lost_reason.external_id
            resman_prospect_lost = True

        if lead.status != Lead.LEAD_LOST and lead.resman_prospect_lost:
            event = SubElement(events, 'Event', dict(EventType='ReActivate', EventDate=timezone.now().strftime('%Y-%m-%dT%H:%M:%S.%f')))
            agent = SubElement(event, 'Agent')
            SubElement(agent, 'AgentID', dict(IDValue=employee.external_id))
            first_contact = SubElement(event, 'FirstContact')
            first_contact.text = 'False'
            resman_prospect_lost = False

        content = post_lead_to_resman(lead, lead_management)
        if not content:
            return

        identification = content['Response']['LeadManagement']['Prospects']['Prospect']['Customers']['Customer'][
            'Identification']

        lead = Lead.objects.select_for_update().filter(pk=lead_id)
        with transaction.atomic():
            # to avoid concurrency commit

            resman_person_id = resman_prospect_id = None
            for item in identification:
                if item['@IDType'] == 'PersonID':
                    resman_person_id = item['@IDValue']
                if item['@IDType'] == 'ProspectID':
                    resman_prospect_id = item['@IDValue']

            lead.update(
                pms_sync_status='SUCCESS',
                resman_prospect_lost=resman_prospect_lost,
                pms_sync_date=timezone.localtime(timezone.now()),
                resman_person_id=resman_person_id,
                resman_prospect_id=resman_prospect_id
            )

    except Exception as error:
        logging.error(error)
        lead = Lead.objects.select_for_update().filter(pk=lead_id)
        with transaction.atomic():
            lead.update(pms_sync_status='FAILURE', pms_sync_date=timezone.localtime(timezone.now()))
        pass


@app.task
def sync_res_man_room_mates(roommate_id):
    """
    Sync individual room mate with ResMan
    :param roommate_id:
    :return:
    """
    try:
        roommate = Roommate.objects.get(pk=roommate_id)
    except Roommate.DoesNotExist:
        return

    lead = roommate.lead
    employee = ResManEmployee.objects.filter(property=lead.property, user=lead.owner).first()
    if check_sync_condition(lead, employee):
        return

    lead_management = Element('LeadManagement')
    prospects = SubElement(lead_management, 'Prospects')
    prospect = SubElement(prospects, 'Prospect')

    # Customers
    customers = SubElement(prospect, 'Customers')
    customer = SubElement(customers, 'Customer', dict(Type='prospect'))
    if lead.resman_prospect_id:
        SubElement(customer, 'Identification', dict(IDType='ProspectID', IDValue=lead.resman_prospect_id,
                                                    OrganizationName='ResMan'))
    if roommate.resman_person_id:
        SubElement(customer, 'Identification', dict(IDType='PersonID', IDValue=roommate.resman_person_id,
                                                    OrganizationName='ResMan'))
    name = SubElement(customer, 'Name')

    first_name = SubElement(name, 'FirstName')
    first_name.text = roommate.first_name

    last_name = SubElement(name, 'LastName')
    last_name.text = roommate.last_name

    if roommate.email:
        email = SubElement(customer, 'Email')
        email.text = roommate.email

    if roommate.phone_number:
        phone = SubElement(customer, 'Phone', dict(PhoneType='cell'))
        phone_number = SubElement(phone, 'PhoneNumber')
        phone_number.text = roommate.phone_number

    content = post_lead_to_resman(lead, lead_management)
    if not content:
        return

    with transaction.atomic():
        # to avoid concurrency commit
        lead = Lead.objects.select_for_update().filter(pk=lead.pk).first()
        roommate = Roommate.objects.select_for_update().filter(pk=roommate.pk).first()
        identification = content['Response']['LeadManagement']['Prospects']['Prospect']['Customers']['Customer'][
            'Identification']
        for item in identification:
            if item['@IDType'] == 'PersonID':
                roommate.resman_person_id = item['@IDValue']
        roommate.save()
        lead.pms_sync_status = 'SUCCESS'
        lead.pms_sync_date = timezone.localtime(timezone.now())
        lead.save()


@app.task
def sync_res_man_activity(object_id, event_type='Note'):
    """
    Sync communication log with Resman (emails and notes)
    :param object_id: object id of Note/Email Message/SMSContent/Call/Chat Conversations
    :param event_type:
    :return:
    """

    activity_object = None
    comments = ''
    description = ''
    event_type_label = 'Other'
    from backend.api.models import Note, EmailMessage, Call, SMSContent
    if event_type == 'Note':
        activity_object = Note.objects.get(pk=object_id)
        comments = activity_object.text
    if event_type == 'Email':
        activity_object = EmailMessage.objects.get(pk=object_id)
        comments = activity_object.body
        description = activity_object.subject
        event_type_label = 'EmailFromProspect' \
            if activity_object.sender_email == activity_object.lead.email else 'EmailToProspect'
    if event_type == 'Call':
        activity_object = Call.objects.get(pk=object_id)
        prefix = 'There was the prospect call from ' \
            if activity_object.call_category == 'PROSPECT' else 'There was the non-prospect call from '
        comments = f'{prefix} {activity_object.prospect_phone_number} for around {activity_object.duration} seconds.'
        event_type_label = 'CallFromProspect'
    if event_type == 'Chat':
        activity_object = SMSContent.objects.get(pk=object_id)

    lead = activity_object.lead

    if not lead.resman_prospect_id:
        # It will be case if note and lead is created at the same time. ex: create new lead from call
        resman_sync(lead.pk)

        # If it's not synced, then should not continue sync comm log
        lead = Lead.objects.get(pk=lead.pk)
        if not lead.resman_prospect_id:
            return

    employee = ResManEmployee.objects.filter(property=lead.property, user=lead.owner).first()
    if check_sync_condition(lead, employee):
        return

    lead_management = Element('LeadManagement')
    prospects = SubElement(lead_management, 'Prospects')
    prospect = SubElement(prospects, 'Prospect')

    customers = SubElement(prospect, 'Customers')
    customer = SubElement(customers, 'Customer', dict(Type='prospect'))
    if lead.resman_prospect_id:
        SubElement(customer, 'Identification', dict(IDType='ProspectID', IDValue=lead.resman_prospect_id,
                                                    OrganizationName='ResMan'))
    if lead.resman_person_id:
        SubElement(customer, 'Identification', dict(IDType='PersonID', IDValue=lead.resman_person_id,
                                                    OrganizationName='ResMan'))

    name = SubElement(customer, 'Name')

    first_name = SubElement(name, 'FirstName')
    first_name.text = lead.first_name

    last_name = SubElement(name, 'LastName')
    last_name.text = lead.last_name

    events = SubElement(prospect, 'Events')

    event = SubElement(events, 'Event', dict(EventType=event_type_label, EventDate=timezone.now().strftime('%Y-%m-%dT%H:%M:%S.%f')))
    agent = SubElement(event, 'Agent')
    SubElement(agent, 'AgentID', dict(IDValue=employee.external_id))
    first_contact = SubElement(event, 'FirstContact')
    first_contact.text = 'False'
    source = SubElement(event, 'TransactionSource')
    source.text = lead.source.external_id
    source = SubElement(event, 'Comments')
    source.text = comments
    source = SubElement(event, 'EventReasons')
    source.text = description

    content = post_lead_to_resman(lead, lead_management)

    if not content:
        return

    with transaction.atomic():
        # to avoid concurrency commit
        lead = Lead.objects.select_for_update().filter(pk=lead.pk).first()
        lead.pms_sync_status = 'SUCCESS'
        lead.pms_sync_date = timezone.localtime(timezone.now())
        lead.save()
