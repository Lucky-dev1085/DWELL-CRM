import logging
from datetime import datetime, timedelta

import pytz
from django.conf import settings
from django.db.models import Q
from django.http import Http404, HttpResponse
from django.shortcuts import render
from django.utils import dateparse, timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from backend.api.models import Property, Task, ChatProspect, ChatConversation, User, FloorPlan, Activity, Note, Unit, \
    ProspectSource, Lead
from backend.api.tasks.smartrent.update_tour import update_tour
from backend.site.models import PageData
from backend.api.permissions import PublicProspectAccessAuthorized, DwellAuthorized
from backend.api.serializer import ChatPublicConversationSerializer, TourDetailSerializer, \
    BusinessHoursSerializer, PublicFloorPlanSerializer, UnitSerializer, CompanyPolicesSerializer
from backend.site.serializer import HobbesPromotionSerializer
from backend.api.tasks import push_object_saved
from backend.api.tasks.nylas.send_emailed_event import send_tour_sms, send_tour_event, delete_event, \
    send_virtual_tour_email, send_text_me_sms
from backend.api.utils import get_pusher_socket_id, dedupe_lead, get_image_url
from backend.api.tasks.smartrent.create_tour import create_tour
from backend.api.tasks.smartrent.cancel_tour import cancel_tour as cancel_smart_rent_tour
from backend.api.tasks.smartrent.utils import get_available_times
from backend.api.serializer.lease import LeaseDefaultSerializer, PropertyPolicySerializer, RentableItemSerializer
from backend.api.tasks.emails.send_notification_email import send_notification_email_task
from backend.api.permissions.vendor import HobbesAccessAuthorized


@api_view(['GET'])
@permission_classes([])
def tour_scheduler(request, property_id):
    property = Property.objects.filter(external_id=property_id).first()
    if not property:
        raise Http404('Property does not belong to CRM.')
    context = {
        'property_name': property.name,
        'client_id': property.client_external_id,
        'dwell_script': '/static/bundles/dwell.js',
    }
    return render(request, 'chat.html', context)


@api_view(['GET'])
@permission_classes([])
def dwell_chat_script(request):
    client_id = request.query_params.get('client_id')
    property = Property.objects.get(client_external_id=client_id)

    url = 'frontend/static/bundles/dwell.js'
    with open(url, 'r') as file:
        content = file.read()
        content = content.replace('{{ propertyName }}', property.name)
        content = content.replace('{{ propertyDomain }}', property.domain)
        content = content.replace('{{ propertyExternalId }}', property.external_id)
        content = content.replace('{{ pusherKey }}', settings.PUSHER_KEY)
        content = content.replace('{{ pusherCluster }}', settings.PUSHER_CLUSTER)
        content = content.replace('{{ chatBotHost }}', settings.CHAT_BOT_HOST)
        content = content.replace('{{ clientId }}', client_id)
        content = content.replace('{{ host }}', settings.CRM_HOST or 'http://localhost:8001')
        content = content.replace('{{ mtHost }}', settings.MT_DOMAIN)
        content = content.replace('{{ mtBaseUrl }}', property.mark_taylor_base_url
        if property.mark_taylor_base_url.endswith('/') else '{}/'.format(property.mark_taylor_base_url))
    return HttpResponse(content, content_type='application/x-javascript')


@api_view(['GET'])
@permission_classes([PublicProspectAccessAuthorized])
def chat_settings(request):
    property = request.property
    if not property:
        return Response(dict(is_valid_property=False), status=status.HTTP_200_OK)

    available_agents_number = User.objects.filter(
        last_property=property, is_available=True, is_team_account=True
    ).count()

    floor_plans = PublicFloorPlanSerializer(property.floor_plans.all(), many=True).data
    units = UnitSerializer(
        property.units.exclude(
            smart_rent_unit_id=None).exclude(smart_rent_unit_id='').filter(can_be_toured=True), many=True
    ).data
    business_hours = BusinessHoursSerializer(property.business_hours.all(), many=True).data
    try:
        prospect = ChatProspect.objects.filter(external_id=request.GET.get('uuid')).first()
        not_valid_prospect = False
    except Exception:
        prospect = None
        not_valid_prospect = True

    conversations = ChatPublicConversationSerializer(ChatConversation.objects.filter(
        prospect=prospect, date__gte=timezone.now() - timedelta(minutes=30)), many=True).data

    active_agent_name = prospect.active_agent.first_name \
        if prospect and prospect.active_agent and prospect.active_agent.last_property == property else None
    active_agent_avatar = None
    is_agent_available = prospect.active_agent.is_available \
        if prospect and prospect.active_agent and prospect.active_agent.last_property == property else False
    if active_agent_name and prospect.active_agent.avatar and hasattr(prospect.active_agent.avatar, 'url'):
        active_agent_avatar = get_image_url(prospect.active_agent.avatar.url)

    tour = dict()
    lead = dict()
    is_in_group = False
    prospect_name = None
    if prospect:
        if prospect.task and not prospect.task.is_cancelled and prospect.task.tour_date \
                and prospect.task.tour_date >= timezone.now():
            tour = TourDetailSerializer(prospect.task).data
            lead = dict(bedroom=prospect.task.lead.beds,
                        unit=prospect.task.units.values_list('id', flat=True)
                        if prospect.task.units.count() > 0 else [],
                        floor_plan=prospect.task.lead.floor_plan.first().id
                        if prospect.task.lead.floor_plan.count() > 0 else None,
                        move_in_date=prospect.task.lead.move_in_date) if prospect.task else None
        is_in_group = prospect.is_in_group
        if prospect.lead or prospect.guest_card:
            prospect_name = prospect.name
    tour_types = property.tour_types
    if not units:
        if 'SELF_GUIDED_TOUR' in tour_types:
            tour_types.remove('SELF_GUIDED_TOUR')
    bedrooms = property.bedroom_types
    is_booking_enabled = property.is_booking_enabled and len(tour_types) > 0

    footer = property.page_data.filter(section='FOOTER').first()
    resident_portal = None
    if footer:
        resident_portal = footer.values['links']['residentPortal']

    contact = property.page_data.filter(section='CONTACT').first()
    neighborhood_url = None
    if contact:
        try:
            neighborhood_url = 'get-to-know-' + contact.values['address']['town'].split(' ')[0].replace(',', '').lower()
        except Exception:
            pass

    return Response(dict(
        not_valid_prospect=not_valid_prospect,
        is_valid_property=True,
        lead=lead,
        floor_plans=floor_plans,
        conversations=conversations,
        active_agent=active_agent_name,
        agent_avatar=active_agent_avatar,
        is_agent_available=is_agent_available,
        tour=tour,
        business_hours=business_hours,
        available_agents_number=available_agents_number,
        is_in_group=is_in_group,
        tour_types=tour_types,
        units=units,
        resident_portal=resident_portal,
        agent_chat_enabled=property.agent_chat_enabled,
        neighborhood_url=neighborhood_url,
        hobbes_enabled=property.hobbes_enabled,
        is_text_me_feature_enabled=property.is_text_me_feature_enabled,
        prospect_name=prospect_name,
        bedrooms=bedrooms,
        is_booking_enabled=is_booking_enabled,
    ), status=status.HTTP_200_OK)


def get_available_time_slots(property, date, current_tour):
    times = []
    business_hours = property.business_hours.all().get(weekday=date.weekday())
    if not business_hours.is_workday:
        return times
    start = datetime.combine(date, business_hours.start_time) + timedelta(minutes=30)
    end = datetime.combine(date, business_hours.end_time) - timedelta(minutes=60)
    step = timedelta(minutes=30)

    tour_type_list = Task.TOUR_TYPES.keys()
    tours_filter = Q(status=Task.TASK_COMPLETED) | Q(is_cancelled=True)
    if current_tour:
        tours_filter |= Q(id=current_tour)
    existing_times = property.tasks.exclude(tours_filter).filter(
        type__in=tour_type_list,
        tour_date__range=(property.timezone.localize(start),
                          property.timezone.localize(end))).values_list('tour_date', flat=True)

    existing_times = [time.astimezone(tz=property.timezone) for time in existing_times]

    while start <= end:
        time = property.timezone.localize(start)
        prev_time = property.timezone.localize(start - step)
        non_standart_time = next((t for t in existing_times if prev_time < t < time), None)
        if non_standart_time:
            if prev_time in times:
                times.remove(prev_time)
            start += step
            continue

        if time in existing_times:
            start += step
            continue

        if time > timezone.now().astimezone(property.timezone):
            times.append(time)
        start += step

    return times


@api_view(['GET'])
@permission_classes([PublicProspectAccessAuthorized | DwellAuthorized])
def tour_available_time(request):
    property = request.property
    if not property:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)

    unit_ids = dict(request.GET).get('unit[]')
    date = request.query_params.get('date')
    current_tour = request.query_params.get('tour')
    # timezone difference from utc
    tz_difference = int(request.query_params.get('tz_difference') or 0)
    tz = [tz for tz in map(pytz.timezone, pytz.all_timezones_set) if
          timezone.now().astimezone(tz).utcoffset() == timedelta(minutes=-tz_difference)][0]

    if unit_ids:
        times = get_available_times(property, unit_ids)
        times = [dict(date=item['date'],
                      times=[dict(time=time['time'], available=time['available'],
                                  date_time=datetime.strptime(time['date_time'], '%Y-%m-%dT%H:%M:%SZ').astimezone(tz))
                             for time in item['times']]) for item in times]
    else:
        date = datetime.strptime(date, '%Y-%m-%d')
        date_start = tz.localize(datetime.combine(date, datetime.min.time()))
        date_end = tz.localize(datetime.combine(date, datetime.max.time()))

        times = get_available_time_slots(
            property, date - timedelta(days=1), current_tour) + get_available_time_slots(
            property, date, current_tour) + get_available_time_slots(
            property, date + timedelta(days=1), current_tour)

        times = [time.astimezone(tz) for time in times if date_start <= time <= date_end]

    return Response(dict(times=times), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def book_tour(request):
    property = request.property
    prospect = ChatProspect.objects.filter(external_id=request.data.get('prospect')).first()
    if not property or not prospect:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)

    if request.data.get('is_from_mt'):
        source = ProspectSource.objects.filter(name='Mark-Taylor.com', property=property).first()
    else:
        source = ProspectSource.objects.filter(name='Standalone Website', property=property).first()

    tour_date = dateparse.parse_datetime(request.data.get('tour_date')) if request.data.get('tour_date') else None
    lead_details = dict(
        first_name=request.data.get('first_name'),
        last_name=request.data.get('last_name'),
        email=request.data.get('email'),
        phone_number=request.data.get('phone_number'),
        move_in_date=datetime.strptime(request.data.get('move_in_date'), '%Y-%m-%d').date(),
        beds=request.data.get('bedroom'),
        source=source,
        stage=Lead.STAGE_TOUR_SET,
    )

    if request.data.get('floor_plan'):
        floor_plans = FloorPlan.objects.filter(id=request.data.get('floor_plan'))
        if floor_plans.count():
            lead_details['floor_plan'] = list(floor_plans)

    if request.data.get('unit'):
        units = Unit.objects.filter(id__in=request.data.get('unit'))
        if units.count():
            lead_details['units'] = list(units)

    lead, is_lead_created = dedupe_lead(property, tour_date, **lead_details)
    lead.last_followup_date = lead.created
    lead.save()

    tour = Task.objects.create(
        type=request.data.get('type'), lead=lead, property=property, owner=lead.owner, tour_date=tour_date,
        is_created_through_chat=True,
        status='PENDING' if request.data.get('type') == Task.TYPE_SELF_GUIDED_TOUR else 'OPEN'
    )

    if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
        unit_ids = request.data.get('unit') or []
        units = Unit.objects.filter(id__in=unit_ids)
        tour.units.set(units)
    logging.info(f'The tour {tour.id} of type {tour.type} is created by Dwell Chat')
    Activity.objects.create(property=property, lead=lead, type=Activity.LEAD_CHAT_HOBBES, content='Tour scheduled',
                            creator=prospect.active_agent, object=tour)

    prospect.lead = lead
    prospect.task = tour
    prospect.save()

    socket_id = get_pusher_socket_id(request) if request else None

    request_data = dict(user_id=request.user.id, property_id=request.property.id)
    push_object_saved.delay(lead.id, lead.__class__.__name__, is_lead_created, socket_id, request_data=request_data)

    push_object_saved.delay(prospect.id, prospect.__class__.__name__, False, socket_id)

    if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
        create_tour.delay(lead.id, tour.id)
    elif tour.type == Task.TYPE_VIRTUAL_TOUR:
        host = request.get_host()
        send_virtual_tour_email.delay(property.id, tour.id, host)
    else:
        send_tour_event.delay(property.id, tour.id)
        tour_date = tour.tour_date.astimezone(tz=lead.property.timezone).strftime('%A, %m/%d/%Y at %I:%M %p')
        create_tour_email(lead.name, lead.property.shared_email, Task.TOUR_TYPES[tour.type], tour_date, lead.page_url)
    if tour.type != Task.TYPE_SELF_GUIDED_TOUR:
        send_tour_sms.delay(property.id, tour.id)
    return Response(dict(tour_id=tour.id, status=tour.status), status=status.HTTP_200_OK)


def create_tour_email(lead_name, property_email, tour_type, tour_date, lead_url):
    notification_data = {
        'email': property_email,
        'content': f'{lead_name} scheduled a new {tour_type} for {tour_date}',
        'subject': f'A new {tour_type} has been auto-scheduled via Dwell Chat',
        'redirect_url': lead_url,
        'button_text': 'View Lead & Tour Task',
    }
    return send_notification_email_task.delay(notification_data)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def text_me(request):
    property = request.property
    prospect = ChatProspect.objects.filter(external_id=request.data.get('prospect')).first()
    if not property or not prospect:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)
    lead_details = dict(
        first_name=request.data.get('first_name'),
        last_name=request.data.get('last_name'),
        phone_number=request.data.get('phone_number'),
    )

    lead, is_lead_created = dedupe_lead(property, **lead_details)
    # Even if the lead is duplicated, we should still use the new phone number because our current dedupe logic won't
    # overwrite if existing lead have the value.
    lead.phone_number = request.data.get('phone_number')
    lead.last_followup_date = lead.created
    lead.save()
    prospect.lead = lead
    prospect.save()

    send_text_me_sms.delay(property.id, lead.id, prospect.source)

    socket_id = get_pusher_socket_id(request) if request else None

    # Send pusher event for the lead. We should sent it everytime because even though it was acquired,
    # it should be shown to the top of pipeline so we should send pusher update
    request_data = dict(user_id=request.user.id, property_id=request.property.id)
    push_object_saved.delay(lead.id, lead.__class__.__name__, is_lead_created, socket_id, request_data=request_data)

    push_object_saved.delay(prospect.id, prospect.__class__.__name__, False, socket_id)
    return Response(dict(success=True), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def reschedule_tour(request):
    property = request.property
    if not property:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)
    tour = Task.objects.filter(id=request.data.get('id'), property=property).first()
    if tour:
        lead = tour.lead

        move_in_date = datetime.strptime(request.data.get('move_in_date'), '%Y-%m-%d').date()
        if lead.move_in_date != move_in_date:
            lead.move_in_date = move_in_date

        beds = request.data.get('bedroom')
        if lead.beds != beds:
            lead.beds = beds

        if request.data.get('floor_plan'):
            floor_plan = FloorPlan.objects.filter(id=request.data.get('floor_plan')).first()
            if floor_plan and floor_plan not in lead.floor_plan.all():
                lead.floor_plan.add(floor_plan)
        lead.save()

        if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
            unit_ids = request.data.get('unit') or []
            units = Unit.objects.filter(id__in=unit_ids)
            tour.units.set(units)

        tour.type = request.data.get('type')
        tour.tour_date = dateparse.parse_datetime(request.data.get('tour_date'))
        tour.save()

        if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
            update_tour.delay(lead.id, tour.id)
        elif tour.type == Task.TYPE_VIRTUAL_TOUR:
            host = request.get_host()
            send_virtual_tour_email.delay(property.id, tour.id, host)
        else:
            send_tour_event.delay(property.id, tour.id, is_reschedule=True)
        send_tour_sms.delay(property.id, tour.id)
    return Response(dict(tour_id=tour.id, status=tour.status), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def cancel_tour(request):
    property = request.property
    if not property:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)
    tour = Task.objects.filter(id=request.data.get('id'), property=property).first()
    if tour:
        tour.is_cancelled = True
        tour.save()
        if tour.type == Task.TYPE_SELF_GUIDED_TOUR:
            cancel_smart_rent_tour.delay(tour.lead.id, tour.id)
        else:
            if tour.active_event:
                delete_event.delay(property.id, tour.active_event.external_id)
            send_tour_sms.delay(property.id, tour.id, is_cancel=True)
    return Response(dict(success=True), status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([HobbesAccessAuthorized])
def hobbies_sources(request):
    domain = request.META.get('HTTP_X_DOMAIN')
    try:
        property = Property.objects.get(domain=domain)
    except Property.DoesNotExist:
        raise NotFound()

    contact_details = dict(
        phone_number=property.phone_number,
        town=property.town,
        city=property.city,
        email=property.shared_email,
    )
    business_hours = BusinessHoursSerializer(property.business_hours.all().order_by('weekday'), many=True).data
    units = PublicFloorPlanSerializer(property.floor_plans.all(), many=True).data

    amenities = []
    communities = []
    virtual_tour = []
    promotion = {}
    schools = []
    restaurants = []
    locations = []
    resident_quotes = []
    property_details_note = ''
    if property.page_data.count():
        amenities_data = property.page_data.filter(section='AMENITIES').first()
        virtual_tour_data = property.page_data.filter(section='VIRTUAL_TOUR').first()
        neighborhood_data = property.page_data.filter(section='NEIGHBORHOOD').first()
        home_data = property.page_data.filter(section='HOME').first()
        contact = property.page_data.filter(section='CONTACT').first()

        contact_details['city'] = contact.values['address']['town']
        contact_details['town'] = contact.values['address']['city']

        # amenitiesList
        for amenity in amenities_data.values['amenitiesList']:
            if amenity['name'] == 'Apartment Features':
                for column in amenity['amenitiesDetails']:
                    amenities += [item['description'] for item in column]

            if amenity['name'] == 'Community Amenities':
                for column in amenity['amenitiesDetails']:
                    communities += [item['description'] for item in column]

        virtual_tour = virtual_tour_data.values['tours']
        locations = neighborhood_data.values.get('locations', [])

        quote = home_data.values['quote']
        resident_quotes = [
            dict(text=quote.get('text'), author=quote.get('author'), details=quote.get('details')),
            dict(text=quote.get('secondText'), author=quote.get('secondAuthor'), details=quote.get('secondDetails')),
            dict(text=quote.get('thirdText'), author=quote.get('thirdAuthor'), details=quote.get('thirdDetails')),
        ]
        property_details_note = home_data.values['thirdRibbon']['text']

        school_category_id = None
        restaurant_category_id = None
        for category in neighborhood_data.values.get('categories', []):
            if 'school' in category['name'].lower():
                school_category_id = category['id']
            if 'restaurant' in category['name'].lower():
                restaurant_category_id = category['id']

        for location in locations:
            if school_category_id in location['category']:
                schools.append(location)
            if restaurant_category_id in location['category']:
                restaurants.append(location)

    if property.promotion.filter(is_active=True).count():
        promotion = HobbesPromotionSerializer(property.promotion.filter(is_active=True).first()).data

    lease_default = LeaseDefaultSerializer(
        property.lease_defaults.first()
    ).data if property.lease_defaults.first() else {}

    property_polices = PropertyPolicySerializer(property.polices).data if hasattr(property, 'polices') else {}

    rentable_items = RentableItemSerializer(
        property.rentable_items.all(), many=True
    ).data if property.rentable_items.count() else []

    company_polices = CompanyPolicesSerializer(property.customer.company_polices).data \
        if hasattr(property.customer, 'company_polices') else dict()
    neighborhood = dict(locations=locations, schools=schools, restaurants=restaurants)

    result = dict(
        contact_details=contact_details,
        business_hours=business_hours,
        amenities=amenities or [],
        communities=communities or [],
        virtual_tour=virtual_tour or [],
        units=units,
        promotion=promotion,
        lease_default=lease_default,
        property_polices=property_polices,
        rentable_items=rentable_items,
        company_polices=company_polices,
        neighborhood=neighborhood,
        tour_types=property.tour_types,
        resident_quotes=resident_quotes,
        property_details_note=property_details_note,
        name=property.name,
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([HobbesAccessAuthorized])
def hobbes_training_sources(request):
    amenities = []
    communities = []
    for page_data in PageData.objects.filter(section='AMENITIES'):
        for amenity in page_data.values['amenitiesList']:
            if amenity['name'] == 'Apartment Features':
                for column in amenity['amenitiesDetails']:
                    amenities += [item['description'] for item in column]

            if amenity['name'] == 'Community Amenities':
                for column in amenity['amenitiesDetails']:
                    communities += [item['description'] for item in column]

    result = dict(
        property_names=Property.objects.values_list('name', flat=True),
        unit_types=FloorPlan.objects.values_list('plan', flat=True).distinct(),
        amenities=list(set(amenities)),
        communities=list(set(communities))
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def timed_out_agent_request_prospect(request):
    property = request.property
    prospect = ChatProspect.objects.filter(external_id=request.data.get('prospect')).first()
    if not property or not prospect:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)

    lead = prospect.guest_card
    if lead:
        lead.last_followup_date = lead.created
        lead.save()

        if request.data.get('comment'):
            Note.objects.create(lead=prospect.guest_card, text=request.data.get('comment'), property=property)
        prospect.save()

        Task.objects.create(type=Task.TYPE_FOLLOW_FIRST, lead=lead, property=property, owner=lead.owner,
                            description='Requests chat prospect requesting follow-up from team member',
                            due_date=timezone.now() + timedelta(days=1))

        socket_id = get_pusher_socket_id(request) if request else None
        push_object_saved.delay(prospect.id, prospect.__class__.__name__, False, socket_id)

    return Response(dict(success=True), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PublicProspectAccessAuthorized])
def capture_data(request):
    property = request.property
    prospect = ChatProspect.objects.filter(external_id=request.data.get('prospect')).first()
    if not property or not prospect:
        return Response(dict(), status=status.HTTP_400_BAD_REQUEST)

    lead_details = dict(
        first_name=request.data.get('first_name'),
        last_name=request.data.get('last_name'),
        email=request.data.get('email'),
        phone_number=request.data.get('phone_number'),
        actor=prospect.active_agent
    )

    lead, is_lead_created = dedupe_lead(property, **lead_details)
    prospect.guest_card = lead
    prospect.save()

    socket_id = get_pusher_socket_id(request) if request else None
    if is_lead_created:
        request_data = dict(user_id=request.user.id, property_id=request.property.id)
        push_object_saved.delay(lead.id, lead.__class__.__name__, True, socket_id, request_data=request_data)
    push_object_saved.delay(prospect.id, prospect.__class__.__name__, False, socket_id)

    return Response(dict(success=True), status=status.HTTP_200_OK)
