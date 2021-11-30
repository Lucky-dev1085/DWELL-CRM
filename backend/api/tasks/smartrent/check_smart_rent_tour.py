import logging

from backend.api.tasks.smartrent.create_prospect import create_prospect
from backend.api.tasks.smartrent.utils import check_tokens
from backend.api.models import Task, Lead


def check_smart_rent_tour(lead_id, tour_id):
    access_token = check_tokens()
    tour = Task.objects.filter(id=tour_id).first()
    if not tour:
        logging.error(
            '[Smart Rent]: Tour with id - {} does not exist.'.format(tour_id))
        return

    lead = Lead.objects.filter(id=lead_id).first()
    if not lead:
        logging.error(
            '[Smart Rent]: Lead with id - {} does not exist.'.format(lead_id))
        return

    if not lead.smart_rent_id:
        lead = create_prospect(lead_id)
        if not lead:
            logging.error(f'[Smart Rent]: Smart Rent prospect is not created from the lead {lead_id}')
            return

    return lead, tour, {'Authorization': 'Bearer {token}'.format(token=access_token)}
