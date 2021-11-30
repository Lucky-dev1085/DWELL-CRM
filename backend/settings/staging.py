import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

from .common import *  # NOQA
from .read_environment import *  # NOQA

# AWS S3 storage settings
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
AWS_S3_SECURE_URLS = True      # use http instead of https
AWS_QUERYSTRING_AUTH = False     # don't add complex authentication-related query parameters for requests

AWS_S3_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_S3_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'crm-staging'
AWS_SITE_STORAGE_BUCKET_NAME = 'mst.staging'
IMGIX_DOMAIN = 'https://staging-liftlytics.imgix.net'
AWS_S3_HOST = 's3-us-west-1.amazonaws.com'
AWS_TRANSCRIPTION_BUCKET_NAME = 'crm-staging-transcription'

ALLOW_PMS_SYNC = False

DISABLE_PUSHER = False

SENTRY_KEY = os.environ.get('SENTRY_KEY')
SENTRY_PROJECT = os.environ.get('SENTRY_PROJECT')

if SENTRY_KEY and SENTRY_PROJECT:
    sentry_sdk.init(
        'https://{}@sentry.io/{}'.format(SENTRY_KEY, SENTRY_PROJECT),
        integrations=[CeleryIntegration(), DjangoIntegration()]
    )

BROKER_TRANSPORT = 'amqps'
EMAIL_BACKEND = 'django_ses.SESBackend'
