from backend.celery_app import app
from .cancel_tour import cancel_tour
from .create_tour import create_tour


@app.task
def update_tour(lead_id, tour_id):
    cancel_tour(lead_id, tour_id, remove_smart_rent_id=True)
    create_tour(lead_id, tour_id)
