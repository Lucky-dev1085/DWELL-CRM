import logging
from datetime import datetime, timedelta

from django.conf import settings
from nylas import APIClient

from backend.api.models import DemoTour
from backend.api.tasks.nylas.utils import create_demo_event_from_nylas
from backend.celery_app import app


@app.task
def create_demo_event(demo_id, is_updated=False):
    client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                       settings.DEMO_TOUR_NYLAS_ACCESS_TOKEN)
    demo = DemoTour.objects.filter(id=demo_id).first()

    if not is_updated:
        event = client.events.create()
    else:
        event = client.events.where(event_id=demo.event.external_id).first()
    event.title = 'Dwell Demo with Ethan'
    event.description = f"""
    Join Zoom Meeting
    https://us02web.zoom.us/j/6655340718?pwd=azdkZXdzd2VaalhEcEhuaUM0VTJQQT09

    Meeting ID: 665 534 0718
    Passcode: 0000
    One tap mobile
    +12532158782,,6655340718#,,,,*0000# US (Tacoma)
    +13017158592,,6655340718#,,,,*0000# US (Washington DC)

    Dial by your location
    +1 253 215 8782 US (Tacoma)
    +1 301 715 8592 US (Washington DC)
    +1 312 626 6799 US (Chicago)
    +1 346 248 7799 US (Houston)
    +1 669 900 6833 US (San Jose)
    +1 929 205 6099 US (New York)
    Meeting ID: 665 534 0718
    Passcode: 0000
    Find your local number: https://us02web.zoom.us/u/kIxHQWo3y
    """
    event.when = {'start_time': datetime.timestamp(demo.date.astimezone(tz=demo.timezone)),
                  'end_time': datetime.timestamp(demo.date.astimezone(tz=demo.timezone) + timedelta(hours=1))}
    participants = [
        {'name': '{} {}'.format(demo.first_name, demo.last_name), 'email': demo.email},
    ]
    if settings.DWELL_TOUR_PARTICIPANT_EMAIL:
        participants.append({'name': 'Dwell', 'email': settings.DWELL_TOUR_PARTICIPANT_EMAIL})

    event.participants = participants
    event.calendar_id = settings.DEMO_TOUR_NYLAS_CALENDAR_ID
    event.location = 'https://us02web.zoom.us/j/6655340718?pwd=azdkZXdzd2VaalhEcEhuaUM0VTJQQT09'

    event.save(notify_participants='true')
    logging.info(f'Demo tour notification: Confirmation email sent for demo {demo.id}')
    create_demo_event_from_nylas(event, demo)


@app.task
def delete_demo_event(demo_event_external_id):
    client = APIClient(settings.NYLAS_OAUTH_CLIENT_ID, settings.NYLAS_OAUTH_CLIENT_SECRET,
                       settings.DEMO_TOUR_NYLAS_ACCESS_TOKEN)
    client.events.delete(demo_event_external_id, notify_participants='true')
