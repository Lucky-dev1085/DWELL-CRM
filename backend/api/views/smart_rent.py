import logging

from dateutil.parser import isoparse
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Task, Unit, Lead
from backend.api.permissions import SmartRentTourAccessAuthorized
from backend.api.tasks.nylas.send_emailed_event import send_tour_event, delete_event
from backend.api.utils import dedupe_lead
from backend.api.views.tour_scheduler import create_tour_email


class SmartRentView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False, permission_classes=[SmartRentTourAccessAuthorized])
    def tour_created(self, request, **kwargs):
        smart_rent_prospect = request.data.get('prospect')
        smart_rent_tour = request.data.get('tour')
        smart_rent_units = request.data.get('units') or []

        property = request.property

        existing_tour = Task.objects.filter(smart_rent_id=smart_rent_tour['id']).first()
        if existing_tour:
            tour_date_changed = False
            tour_finalized = False
            tour_date = isoparse(smart_rent_tour['start'])

            if tour_date != existing_tour.tour_date:
                tour_date_changed = True
                existing_tour.tour_date = tour_date

            if existing_tour.status == 'PENDING':
                existing_tour.status = 'OPEN'
                tour_finalized = True
            existing_tour.save()

            if tour_date_changed or tour_finalized:
                if existing_tour.active_event:
                    delete_event.delay(existing_tour.property.id, existing_tour.active_event.external_id)
                send_tour_event.delay(existing_tour.property.id, existing_tour.id)
            return Response(dict(success=True), status=status.HTTP_200_OK)

        tour_date = isoparse(smart_rent_tour['start'])
        move_in_date = isoparse(smart_rent_prospect.get('desired_move_in_date')) \
            if smart_rent_prospect.get('desired_move_in_date') else None
        lead_details = dict(
            first_name=smart_rent_prospect['first_name'],
            last_name=smart_rent_prospect['last_name'],
            email=smart_rent_prospect['email'],
            phone_number=smart_rent_prospect['phone_number'],
            move_in_date=move_in_date,
            stage=Lead.STAGE_TOUR_SET,
            smart_rent_id=smart_rent_prospect['id']
        )
        lead, _ = dedupe_lead(property, tour_date, **lead_details)
        lead.last_followup_date = lead.created
        lead.save()
        tour = Task.objects.create(
            type=Task.TYPE_SELF_GUIDED_TOUR,
            lead=lead, property=property,
            owner=lead.owner, tour_date=tour_date,
            is_created_through_chat=True,
            smart_rent_id=smart_rent_tour['id']
        )
        logging.info(f'The tour {tour.id} of type {tour.type} is created by Smart Rent')

        unit_ids = [unit['id'] for unit in smart_rent_units]
        units = Unit.objects.filter(smart_rent_unit_id__in=unit_ids)
        tour.units.set(units)

        send_tour_event.delay(property.id, tour.id)

        tour_date = tour.tour_date.astimezone(tz=lead.property.timezone).strftime('%A, %m/%d/%Y at %I:%M %p')
        create_tour_email(lead.name, lead.property.shared_email, Task.TOUR_TYPES[tour.type], tour_date,
                          lead.page_url)
        return Response(dict(success=True), status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, permission_classes=[])
    def tour_cancelled(self, request, **kwargs):
        smart_rent_tour = request.data.get('tour')
        tour = Task.objects.filter(smart_rent_id=smart_rent_tour['id'], is_cancelled=False).first()
        if tour:
            tour.is_cancelled = True
            tour.save()
            if tour.active_event:
                delete_event.delay(tour.property.id, tour.active_event.external_id)
        return Response(dict(success=True), status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, permission_classes=[])
    def prospect_created_or_updated(self, request, **kwargs):
        smart_rent_prospect = request.data.get('prospect')
        lead = Lead.objects.filter(smart_rent_id=smart_rent_prospect['id']).first()
        move_in_date = isoparse(smart_rent_prospect.get('desired_move_in_date')) \
            if smart_rent_prospect.get('desired_move_in_date') else None

        if lead and lead.move_in_date != move_in_date:
            lead.move_in_date = move_in_date
            lead.save()

        return Response(dict(success=True), status=status.HTTP_200_OK)
