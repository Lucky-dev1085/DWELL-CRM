import logging
from xml.etree.ElementTree import Element, SubElement
from django.utils import timezone
from django.db import transaction
from xmljson import badgerfish as bf

from backend.api.models import Lead, RealPageEmployee, Roommate
from backend.celery_app import app
from .utils import invoke_real_page_api
from backend.api.tasks.resman.utils import check_sync_condition, convert_to_list

activity_type_choices = dict(email='S000000010', note='S000000015', call='S000000001', chat='S000000101',
                             event='S000000100')


@app.task
def real_page_sync(lead_id):
    """
    Sync individual lead with Real page
    :param lead_id:
    :return:
    """
    try:
        lead = Lead.objects.get(pk=lead_id)
    except Lead.DoesNotExist:
        return

    try:
        employee = RealPageEmployee.objects.filter(property=lead.property, user=lead.owner).first()
        if check_sync_condition(lead, employee):
            # Not started because of lack condition
            return

        guest_card = Element('tem:guestcard')

        SubElement(guest_card, 'tem:pmcid').text = lead.property.real_page_pmc_id
        SubElement(guest_card, 'tem:siteid').text = lead.property.real_page_site_id
        SubElement(guest_card, 'tem:created').text = lead.created.strftime('%Y-%m-%d')
        SubElement(guest_card, 'tem:primaryleadsource').text = lead.source.external_id
        SubElement(guest_card, 'tem:leasingagentid').text = employee.external_id

        if lead.real_page_guest_card_id:
            SubElement(guest_card, 'tem:guestcardid').text = lead.real_page_guest_card_id

        if lead.moving_reason:
            SubElement(guest_card, 'tem:moveinreason').text = lead.moving_reason.external_id

        if lead.units.count():
            SubElement(guest_card, 'tem:prospectcomment').text = \
                'Prospect is interested in Unit ' + ', Unit '.join(list(lead.units.values_list('unit', flat=True)))

        if lead.real_page_pet_weight:
            SubElement(guest_card, 'tem:petweightrange').text = lead.real_page_pet_weight.external_id

        prospect = SubElement(SubElement(guest_card, 'tem:prospects'), 'tem:Prospect')
        SubElement(prospect, 'tem:pmcid').text = lead.property.real_page_pmc_id
        SubElement(prospect, 'tem:siteid').text = lead.property.real_page_site_id
        SubElement(prospect, 'tem:firstname').text = lead.first_name
        SubElement(prospect, 'tem:lastname').text = lead.last_name
        SubElement(prospect, 'tem:email').text = lead.email
        SubElement(prospect, 'tem:relationshipid').text = 'H'

        if lead.real_page_customer_id:
            SubElement(prospect, 'tem:customerid').text = lead.real_page_customer_id

        number = SubElement(SubElement(SubElement(prospect, 'tem:numbers'), 'tem:phonenumbers'), 'tem:PhoneNumber')
        SubElement(number, 'tem:type').text = 'Home'
        SubElement(number, 'tem:number').text = lead.phone_number

        SubElement(prospect, 'tem:prefcommunicationtype').text = lead.best_contact_method

        preferences = SubElement(guest_card, 'tem:preferences')
        if lead.move_in_date:
            SubElement(preferences, 'tem:dateneeded').text = lead.move_in_date.strftime('%Y-%m-%d')
        if lead.lease_term:
            SubElement(preferences, 'tem:leasetermmonths').text = str(lead.lease_term)
        if lead.floor_plan.first():
            SubElement(preferences, 'tem:floorplanid').text = lead.floor_plan.first().external_id
            SubElement(preferences, 'tem:floorplangroupid').text = lead.floor_plan.first().group_id
        if lead.desired_rent:
            SubElement(preferences, 'tem:desiredrent').text = str(int(lead.desired_rent))
        if lead.occupants:
            SubElement(preferences, 'tem:occupants').text = str(lead.occupants)
        if lead.price_range:
            SubElement(preferences, 'tem:pricerangeid').text = lead.price_range.external_id

        if lead.status != Lead.LEAD_LOST:
            status_choices = {
                'active': 'S000000002', 'closed': 'S000000005', 'lost': 'S000000004', 'deleted': 'S000000003'
            }
            SubElement(guest_card, 'tem:propertystatus').text = status_choices.get(lead.status.lower())

        if not lead.real_page_customer_id:
            content = invoke_real_page_api('insertprospect', lead.property, guest_card)
            response = bf.data(content.find('.//InsertProspectResponse'))['InsertProspectResponse']
        else:
            content = invoke_real_page_api('updateprospect', lead.property, guest_card)
            response = bf.data(content.find('.//UpdateProspect'))['UpdateProspect']

        if response.get('message')['$'] == 'SUCCESS':
            args = dict()
            real_page_guest_card_id = lead.real_page_guest_card_id
            if not real_page_guest_card_id:
                real_page_guest_card_id = response['Guestcard']['ID']['$']
                real_page_customer_id = None
                customers = convert_to_list(response['Customers'])
                if len(customers):
                    real_page_customer_id = customers[0]['CustomerID']['$']
                args = dict(real_page_guest_card_id=real_page_guest_card_id,
                            real_page_customer_id=real_page_customer_id)

            if lead.status == Lead.LEAD_LOST and lead.lost_reason and not lead.resman_prospect_lost:
                activity = Element('tem:activity')
                SubElement(activity, 'tem:guestcardid').text = real_page_guest_card_id
                SubElement(activity, 'tem:actiondate').text = lead.updated.strftime('%Y-%m-%dT%H:%M:%S.%f')
                SubElement(activity, 'tem:comments').text = 'Status updated to LOST'
                SubElement(activity, 'tem:creatorid').text = employee.external_id
                SubElement(activity, 'tem:typeid').text = activity_type_choices['event']
                SubElement(activity, 'tem:statid').text = 'S000000004'
                SubElement(activity, 'tem:losttrafficreasonid').text = lead.lost_reason.external_id
                SubElement(activity, 'tem:statuschangedbit').text = '1'
                invoke_real_page_api('insertactivity', lead.property, activity)
                args['resman_prospect_lost'] = True

            if lead.status != Lead.LEAD_LOST and lead.resman_prospect_lost:
                args['resman_prospect_lost'] = False

            lead = Lead.objects.select_for_update().filter(pk=lead_id)
            with transaction.atomic():
                lead.update(
                    pms_sync_status='SUCCESS',
                    pms_sync_date=timezone.localtime(timezone.now()),
                    **args
                )
        else:
            raise Exception('error')
    except Exception as error:
        logging.error(error)
        lead = Lead.objects.select_for_update().filter(pk=lead_id)
        with transaction.atomic():
            lead.update(pms_sync_status='FAILURE', pms_sync_date=timezone.localtime(timezone.now()))


@app.task
def sync_real_page_room_mates(roommate_id):
    """
    Sync individual room mate with Real Page
    :param roommate_id:
    :return:
    """
    try:
        roommate = Roommate.objects.get(pk=roommate_id)
    except Roommate.DoesNotExist:
        return

    lead = roommate.lead

    if not lead.real_page_guest_card_id:
        return

    employee = RealPageEmployee.objects.filter(property=lead.property, user=lead.owner).first()
    if check_sync_condition(lead, employee):
        return

    customer = Element('tem:addnewcustomertoguestcard')
    guest_card = Element('tem:guestcard')

    if roommate.real_page_customer_id:
        SubElement(guest_card, 'tem:pmcid').text = lead.property.real_page_pmc_id
        SubElement(guest_card, 'tem:siteid').text = lead.property.real_page_site_id
        SubElement(guest_card, 'tem:guestcardid').text = lead.real_page_guest_card_id
        prospect = SubElement(SubElement(guest_card, 'tem:prospects'), 'tem:Prospect')
    else:
        SubElement(customer, 'tem:guestcardid').text = lead.real_page_guest_card_id
        prospect = SubElement(SubElement(customer, 'tem:prospects'), 'tem:Prospect')

    SubElement(prospect, 'tem:pmcid').text = lead.property.real_page_pmc_id
    SubElement(prospect, 'tem:siteid').text = lead.property.real_page_site_id
    SubElement(prospect, 'tem:firstname').text = roommate.first_name
    SubElement(prospect, 'tem:lastname').text = roommate.last_name
    SubElement(prospect, 'tem:relationshipid').text = roommate.relationship.value

    if roommate.real_page_customer_id:
        SubElement(prospect, 'tem:customerid').text = roommate.real_page_customer_id
    if roommate.email:
        SubElement(prospect, 'tem:email').text = roommate.email
    if roommate.phone_number:
        number = SubElement(SubElement(SubElement(prospect, 'tem:numbers'), 'tem:phonenumbers'), 'tem:PhoneNumber')
        SubElement(number, 'tem:type').text = 'Home'
        SubElement(number, 'tem:number').text = roommate.phone_number

    if roommate.real_page_customer_id:
        content = invoke_real_page_api('updateprospect', lead.property, guest_card)
        response = bf.data(content.find('.//UpdateProspect'))['UpdateProspect']
        if response.get('message')['$'] == 'SUCCESS':
            with transaction.atomic():
                Lead.objects.select_for_update().filter(pk=lead.pk).update(
                    pms_sync_status='SUCCESS',
                    pms_sync_date=timezone.localtime(timezone.now()),
                )
    else:
        content = invoke_real_page_api('addnewcustomertoguestcard', lead.property, customer)
        response = bf.data(content.find('.//newcustomers'))
        if response.get('newcustomers'):
            with transaction.atomic():
                customers = convert_to_list(response['newcustomers'])
                if len(customers):
                    real_page_customer_id = customers[0]['NewCustomer']['NewCustomerID']['$']
                Roommate.objects.select_for_update().filter(pk=roommate.pk).update(
                    real_page_customer_id = real_page_customer_id,
                )
                Lead.objects.select_for_update().filter(pk=lead.pk).update(
                    pms_sync_status='SUCCESS',
                    pms_sync_date=timezone.localtime(timezone.now()),
                )


@app.task
def sync_real_page_activity(object_id, event_type='Note'):
    """
    Sync communication log with Real Page
    :param object_id: object id of Note/Email Message/SMSContent/Call/Chat Conversations
    :param event_type
    :return:
    """
    activity_object = None
    comments = ''
    from backend.api.models import Note, EmailMessage, Call, SMSContent
    if event_type == 'Note':
        activity_object = Note.objects.get(pk=object_id)
        comments = activity_object.text
    if event_type == 'Email':
        activity_object = EmailMessage.objects.get(pk=object_id)
        comments = activity_object.body
    if event_type == 'Call':
        activity_object = Call.objects.get(pk=object_id)
        prefix = 'There was the prospect call from '\
            if activity_object.call_category == 'PROSPECT' else 'There was the non-prospect call from '
        comments = f'{prefix} {activity_object.prospect_phone_number} for around {activity_object.duration} seconds.'
    if event_type == 'Chat':
        activity_object = SMSContent.objects.get(pk=object_id)

    lead = activity_object.lead

    employee = RealPageEmployee.objects.filter(property=lead.property, user=lead.owner).first()
    if check_sync_condition(lead, employee):
        return

    if not lead.real_page_guest_card_id:
        # It will be case if note and lead is created at the same time. ex: create new lead from call
        real_page_sync(lead.pk)

        # If it's not synced, then should not continue sync comm log
        lead = Lead.objects.get(pk=lead.pk)
        if not lead.real_page_guest_card_id:
            return

    activity = Element('tem:activity')

    SubElement(activity, 'tem:guestcardid').text = lead.real_page_guest_card_id
    SubElement(activity, 'tem:actiondate').text = activity_object.created.strftime('%Y-%m-%dT%H:%M:%S.%f')
    SubElement(activity, 'tem:comments').text = comments
    SubElement(activity, 'tem:creatorid').text = employee.external_id
    SubElement(activity, 'tem:typeid').text = activity_type_choices.get(event_type.lower())

    content = invoke_real_page_api('insertactivity', lead.property, activity)
    response = bf.data(content.find('.//Activity'))

    if response.get('Activity'):
        with transaction.atomic():
            lead = Lead.objects.select_for_update().filter(pk=lead.pk).first()
            lead.pms_sync_status = 'SUCCESS'
            lead.pms_sync_date = timezone.localtime(timezone.now())
            lead.save()
