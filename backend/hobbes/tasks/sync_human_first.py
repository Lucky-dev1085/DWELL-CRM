import logging
import requests
import psycopg2
import pytz
import pandas as pd

from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta

from backend.celery_app import app
from backend.hobbes.models import HumanFirstSyncState

TZ = pytz.timezone('America/Phoenix')


class HFSyncFailed(Exception):
    pass


@app.task
def sync_human_first():
    if not settings.HF_INTEGRATION_ENABLED:
        return

    is_succeed = True
    try:
        conn = psycopg2.connect(
            host=settings.RASA_X_DB_HOST, database=settings.RASA_X_DB_NAME, user=settings.RASA_X_DB_USER,
            password=settings.RASA_X_DB_PASSWORD
        )
        cur = conn.cursor()
        timestamp = (datetime.now() - timedelta(days=1, minutes=3)).timestamp()
        cur.execute(f"SELECT hash, text, time FROM message_log WHERE text NOT Like '/%' AND time > {timestamp} "
                    f'ORDER BY time')
        rows = cur.fetchall()

        formatted_rows = []
        for row in rows:
            formatted_rows.append((row[0], int(row[2] * 1000), 'client', row[1]))

        df = pd.DataFrame.from_records(formatted_rows)

        date = timezone.now().astimezone(tz=pytz.timezone('America/Phoenix')).strftime('%Y_%m_%d_%H_%M_%S')
        file_name = f'backend/hobbes/static/template/conversations_{date}.csv'
        df.to_csv(file_name, header=False, index=False)
        # waiting rest API integration

        # Authenticate
        response = requests.post(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?'
            'key=AIzaSyA5xZ7WCkI6X1Q2yzWHUrc70OXH5iCp7-c',
            dict(email=settings.HF_USERNAME, password=settings.HF_PASSWORD, returnSecureToken=True)
        )
        if response.status_code != 200:
            logging.error(f'[Human First]: Authentication Failed: {response.content}')
            raise HFSyncFailed

        content = response.json()
        token = content.get('idToken')

        response = requests.post(
            f'https://api.humanfirst.ai/v1alpha1/files/dwell/convsrc-{settings.HF_CONVERSATION_SOURCE}',
            files=dict(file=open(file_name, 'rb')), data=dict(format='IMPORT_FORMAT_SIMPLE_CSV'),
            headers=dict(Authorization=f'Bearer {token}')
        )

        if response.status_code != 201:
            logging.error(f'[Human First]: Conversation upload failed: {response.content}')
            raise HFSyncFailed
    except Exception as e:
        logging.error(e)
        is_succeed = False
        pass

    HumanFirstSyncState.objects.create(date=timezone.now(), is_succeed=is_succeed)
