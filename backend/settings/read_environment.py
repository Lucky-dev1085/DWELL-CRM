import os
from datetime import timedelta

from celery.schedules import crontab

REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')

RABBIT_URL = os.environ.get('RABBIT_URL', 'amqp://admin:mypass@localhost:5672')

# CELERY STUFF
BROKER_URL = RABBIT_URL
BROKER_TRANSPORT = 'amqp'

# https://www.cloudamqp.com/docs/celery.html
# BROKER_POOL_LIMIT = 1  # Will decrease connection usage
BROKER_HEARTBEAT = None  # We're using TCP keep-alive instead
# May require a long timeout due to Linux DNS timeouts etc
BROKER_CONNECTION_TIMEOUT = 30

CELERYBEAT_SCHEDULE = {
    'check_tasks_due_date_task': {
        'task': 'backend.api.tasks.check_tasks_due_date.check_tasks_due_date_task',
        'schedule': crontab(hour=1, minute=0),
    },
    'pull_res_man_floor_plans': {
        'task': 'backend.api.tasks.resman.pull_floor_plans.pull_res_man_floor_plans',
        'schedule': crontab(hour=1, minute=10),
    },
    'pull_real_page_floor_plans': {
        'task': 'backend.api.tasks.realpage.pull_floor_plans.pull_real_page_floor_plans',
        'schedule': crontab(hour=1, minute=10),
    },
    'pull_on_site_floor_plans': {
        'task': 'backend.site.tasks.pull_on_site_floor_plans.pull_on_site_floor_plans',
        'schedule': crontab(hour=1, minute=10),
    },
    'pull_yardi_floor_plans': {
        'task': 'backend.site.tasks.pull_yardi_floor_plans.pull_yardi_floor_plans',
        'schedule': crontab(hour=1, minute=10),
    },
    'pull_resman_prospect_source': {
        'task': 'backend.api.tasks.resman.pull_prospect_sources.pull_res_man_prospect_sources',
        'schedule': crontab(hour=1, minute=20),
    },
    'pull_real_page_prospect_source': {
        'task': 'backend.api.tasks.realpage.pull_prospect_sources.pull_real_page_prospect_sources',
        'schedule': crontab(hour=1, minute=20),
    },
    'pull_res_man_prospect_lost_reasons': {
        'task': 'backend.api.tasks.resman.pull_lost_prospect_reasons.pull_res_man_lost_prospect_reasons',
        'schedule': crontab(hour=1, minute=30),
    },
    'pull_real_page_prospect_lost_reasons': {
        'task': 'backend.api.tasks.realpage.pull_lost_reason.pull_real_page_lost_reason',
        'schedule': crontab(hour=1, minute=30),
    },
    'pull_res_man_employees': {
        'task': 'backend.api.tasks.resman.pull_employees.pull_res_man_employees',
        'schedule': crontab(hour=1, minute=40),
    },
    'pull_real_page_employees': {
        'task': 'backend.api.tasks.realpage.pull_employees.pull_real_page_employees',
        'schedule': crontab(hour=1, minute=40),
    },
    'pull_real_page_pet_weights': {
        'task': 'backend.api.tasks.realpage.pull_pet_weight.pull_real_page_pet_weights',
        'schedule': crontab(hour=1, minute=50),
    },
    'pull_real_page_pet_types': {
        'task': 'backend.api.tasks.realpage.pull_pet_types.pull_real_page_pet_types',
        'schedule': crontab(hour=1, minute=50),
    },
    'pull_real_page_price_ranges': {
        'task': 'backend.api.tasks.realpage.pull_price_ranges.pull_real_page_price_ranges',
        'schedule': crontab(hour=2, minute=0),
    },
    'pull_real_page_reason_for_moving': {
        'task': 'backend.api.tasks.realpage.pull_reason_for_moving.pull_real_page_reason_for_moving',
        'schedule': crontab(hour=2, minute=0),
    },
    'pull_real_page_relationship_types': {
        'task': 'backend.api.tasks.realpage.pull_relationship_types.pull_real_page_relationship_types',
        'schedule': crontab(hour=2, minute=10),
    },
    'sync_application_status': {
        'task': 'backend.api.tasks.resman.sync_application_status.sync_application_status',
        'schedule': crontab(hour=2, minute=0),
    },
    'sync_nylas_messages': {
        'task': 'backend.api.tasks.nylas.sync_nylas_messages.sync_nylas_messages_task',
        'schedule': crontab(hour=7, minute=0),
    },
    'pull_email_labels': {
        'task': 'backend.api.tasks.nylas.pull_nylas_email_labels.pull_email_labels',
        'schedule': crontab(hour=1, minute=50),
    },
    'sync_check_account_activity': {
        'task': 'backend.api.tasks.nylas.check_nylas_account_activity.sync_check_account_activity',
        'schedule': crontab(hour='*/2', minute=30),
    },
    'reset_sent_email_counters': {
        'task': 'backend.api.tasks.nylas.reset_daily_email_counters.reset_sent_email_counters',
        'schedule': crontab(hour=0, minute=0),
    },
    'generate_overview_reports_hourly': {
        'task': 'backend.api.tasks.reports.get_reports_data.generate_overview_reports',
        'schedule': crontab(hour='*/1', minute=0),
    },
    'generate_overview_reports_daily': {
        'task': 'backend.api.tasks.reports.get_reports_data.generate_overview_reports',
        'schedule': crontab(hour=8, minute=10),
        'kwargs': dict(is_daily=True)
    },
    # 'compute_all_reports': {
    #     'task': 'backend.api.tasks.reports.get_reports_data.compute_all_reports',
    #     'schedule': crontab(day_of_week=0, hour=7, minute=0),
    # },
    'update_transcribe_status': {
        'task': 'backend.api.tasks.calls.update_transcribe_status.update_transcribe_status',
        'schedule': crontab(minute='*/30'),
    },
    'generate_engagement_reports': {
        'task': 'backend.api.tasks.reports.get_reports_data.generate_engagement_reports',
        'schedule': crontab(hour='*/1', minute=30),
    },
    'generate_call_scoring_reports': {
        'task': 'backend.api.tasks.reports.get_reports_data.generate_call_scoring_reports',
        'schedule': crontab(hour='*/1', minute=45),
    },
    'remove_old_attachments': {
        'task': 'backend.api.tasks.nylas.remove_old_attachments.remove_old_attachments',
        'schedule': crontab(hour=11, minute=0),
    },
    'pull_prospect_and_sync_using_modified_date': {
        'task': 'backend.api.tasks.resman.pull_resman_prospect_and_sync.pull_prospect_and_sync_using_modified_date',
        'schedule': crontab(hour='*/1', minute=0),
    },
    'pull_prospect_and_sync_using_modified_date_on_office_end_time': {
        'task': 'backend.api.tasks.resman.pull_resman_prospect_and_sync.pull_prospect_and_sync_using_modified_date',
        'schedule': crontab(hour='22, 23', minute='*/15'),
        'args': (False,)
    },
    'pull_twilio_messages': {
        'task': 'backend.api.tasks.twilio.pull_backup_twilio_messages.pull_backup_twilio_messages',
        'schedule': crontab(hour=9, minute=0),
    },
    'validate_tracking_numbers': {
        'task': 'backend.api.tasks.twilio.validate_tracking_numbers.validate_tracking_numbers',
        'schedule': crontab(hour=9, minute=30),
    },
    'pull_sent_email_labels': {
        'task': 'backend.api.tasks.nylas.pull_sent_email_labels.pull_sent_email_labels',
        'schedule': crontab(hour=10, minute=0),
    },
    'convert_ils_emails_to_leads': {
        'task': 'backend.api.tasks.convert_ils_emails_to_leads.convert_ils_emails_to_leads',
        'schedule': crontab(minute='*/1'),
    },
    'pull_res_man_current_residents': {
        'task': 'backend.api.tasks.resman.pull_current_residents.pull_res_man_current_residents',
        'schedule': crontab(hour='*/4', minute=0),
    },
    # 'pull_calendars': {
    #     'task': 'backend.api.tasks.nylas.pull_nylas_calendars.pull_calendars',
    #     'schedule': crontab(hour=2, minute=10),
    # },
    'check_cancelled_tours': {
        'task': 'backend.api.tasks.smartrent.check_cancelled_tours.check_cancelled_tours',
        'schedule': crontab(hour='*/1', minute=0),
    },
    'sync_smart_rent_units': {
        'task': 'backend.api.tasks.smartrent.sync_units.sync_smart_rent_units',
        'schedule': crontab(hour=6, minute=30),
    },
    'set_user_state_to_available': {
        'task': 'backend.api.tasks.chat.update_user_available_state.set_user_available_state_by_static_time',
        'schedule': crontab(hour=16, minute=0),
        'args': (True,)
    },
    'set_user_state_to_unavailable': {
        'task': 'backend.api.tasks.chat.update_user_available_state.set_user_available_state_by_static_time',
        'schedule': crontab(hour=0, minute=30),
        'args': (False,)
    },
    'reset_is_call_rescore_required_today': {
        'task': 'backend.api.tasks.calls.reset_is_call_rescore_required_today.reset_is_call_rescore_required_today',
        'schedule': crontab(hour=7, minute=0),
    },
    'create_chat_conversation_activities': {
        'task': 'backend.api.tasks.chat.create_chat_activity.create_chat_conversation_activities',
        'schedule': crontab(minute='*/2'),
    },

    # Compete celery beats
    'check_benchmark_alert': {
        'task': 'backend.compete.tasks.check_alert.check_benchmark_alert',
        'schedule': crontab(hour=15, minute=0, day_of_week=0),
    },
    'check_threshold_alert': {
        'task': 'backend.compete.tasks.check_alert.check_threshold_alert',
        'schedule': crontab(hour=15, minute=0),
    },
    'check_scrapping_state': {
        'task': 'backend.compete.tasks.pull_scrapping_data.check_scrapping_state',
        'schedule': crontab(minute='*/30'),
    },
    'generate_history_for_mt_properties': {
        'task': 'backend.compete.tasks.pull_scrapping_data.generate_history_for_mt_properties',
        'schedule': crontab(hour=14, minute=0),
    },

    # Hobbes celery beats
    'sync_human_first': {
        'task': 'backend.hobbes.tasks.sync_human_first.sync_human_first',
        'schedule': crontab(hour=6, minute=0),
    },
    'populate_amenities': {
        'task': 'backend.hobbes.tasks.populate_amenities.populate_amenities',
        'schedule': crontab(hour=6, minute=20),
    },
    'populate_chat_evaluation_data': {
        'task': 'backend.hobbes.tasks.populate_chat_evaluation_data.populate_chat_evaluation_data',
        'schedule': crontab(day_of_month=8),
    },
    'clear_older_notification': {
        'task': 'backend.api.tasks.clear_older_notification.clear_older_notification',
        'schedule': crontab(hour=18, minute=0, day_of_week=6),
    }
}

CELERY_ROUTES = {
    'backend.api.tasks.nylas.receive_emails_by_webhook.*': {
        'queue': 'nylas_webhook'
    },
    'backend.api.tasks.chat.update_prospect_availability.*': {
        'queue': 'prospect_availability'
    },
    'backend.compete.tasks.*': {
        'queue': 'compete'
    },
}

CELERY_TIMEZONE = 'UTC'
CELERY_RESULT_BACKEND = '{}/2'.format(REDIS_URL)

# TOKEN
ACCESS_TOKEN_LIFETIME = timedelta(days=(os.environ.get('ACCESS_TOKEN_LIFETIME', 1)))

RESMAN_INTEGRATION_PARTNER_ID = os.environ.get('RESMAN_INTEGRATION_PARTNER_ID')
RESMAN_API_KEY = os.environ.get('RESMAN_API_KEY')

# Django CacheOps stuff
CACHEOPS_REDIS = '{}/1'.format(REDIS_URL)
CACHEOPS_DEFAULTS = {'timeout': 60 * 60}
CACHEOPS = {
    'api.user': {
        'ops': 'all',
        'timeout': 24 * 60 * 60
    },
    # 'api.property': {
    #     'ops': 'all',
    #     'timeout': 24 * 60 * 60
    # },
    '*.*': {
        'ops': ()
    },
}
# todo check this option
CACHEOPS_DEGRADE_ON_FAILURE = False

# SmartRent
SMART_RENT_REDIS = os.environ.get('SMART_RENT_REDIS', '{}/3'.format(REDIS_URL))
SMART_RENT_HOST = os.environ.get('SMART_RENT_HOST', 'control.smartrent.com')
MAX_SMART_RENT_RETRIES = int(os.environ.get('MAX_SMART_RENT_RETRIES', 1))

CRM_HOST = os.environ.get('CRM_HOST', 'http://localhost:8000')
MST_HOST = os.environ.get('MST_HOST', 'http://localhost:3000')

ALLOW_PMS_SYNC = False

NYLAS_OAUTH_CLIENT_ID = os.environ.get('NYLAS_OAUTH_CLIENT_ID')
NYLAS_OAUTH_CLIENT_SECRET = os.environ.get('NYLAS_OAUTH_CLIENT_SECRET')
NYLAS_SYNC_DAYS_LIMIT = int(os.environ.get('NYLAS_SYNC_DAYS_LIMIT', 30))
NYLAS_SYNC_BATCH_SIZE = int(os.environ.get('NYLAS_SYNC_BATCH_SIZE', 5))

EMAIL_BLAST_BATCH_SIZE = int(os.environ.get('EMAIL_BLAST_BATCH_SIZE', 5))
MAX_RECIPIENTS = int(os.environ.get('MAX_RECIPIENTS', 800))
MAX_NYLAS_RETRIES = int(os.environ.get('MAX_NYLAS_RETRIES', 2))
NYLAS_SYNC_MAX_EMAILS_COMMIT_IN_ONCE = 50
MAX_PMS_SYNC_RETRIES = int(os.environ.get('MAX_PMS_SYNC_RETRIES', 1))
EMAIL_DELAY_TIME = int(os.environ.get('EMAIL_DELAY_TIME', 5))
SES_EMAIL_NOTIFICATION_DELAY_TIME = int(os.environ.get('SES_EMAIL_NOTIFICATION_DELAY_TIME', 5))

REMINDER_EMAIL_ENABLED = os.environ.get('REMINDER_EMAIL_ENABLED', False)

GTM_ID = os.environ.get('GTM_ID', 'GTM-KNDDG88')
PUSHER_APP_ID = os.environ.get('PUSHER_APP_ID', '879322')
PUSHER_KEY = os.environ.get('PUSHER_KEY', '157fa85bd6e15d3606b3')
PUSHER_SECRET = os.environ.get('PUSHER_SECRET', '2695b67ea8c0135b244b')
PUSHER_CLUSTER = os.environ.get('PUSHER_CLUSTER', 'us3')

GA_ID = os.environ.get('GTM_ID', 'UA-154705212-1')
ILS_ENABLED = os.environ.get('ILS_ENABLED', False)

NYLAS_BLACK_LIST_EMAILS = [
    'no-reply@on-site.com',
    'no-reply@sightplan.com',
    'svc_vlmyvaletalerts@valetliving.com',
    'no-reply@henrihome.com',
    'lightson@anyonehome.com',
    'no-reply@microsoft.com',
    'kim@carmelcleaners.com'
]
NYLAS_WEBHOOK_PAYLOADS_REDIS = '{}/4'.format(REDIS_URL)

RESMAN_SYNC_API_THREAD_COUNT = 10

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_STUDIO_ID = os.environ.get('TWILIO_STUDIO_ID')
TWIML_APPLICATION_SID = os.environ.get('TWIML_APPLICATION_SID')
TWILIO_OUTBOUND_CALLBACK = '{}/api/v1/calls/outbound_complete_callback/'.format(CRM_HOST)
TWILIO_AVAILABLE_NUMBER_LIMIT = os.environ.get('TWILIO_AVAILABLE_NUMBER_LIMIT', 30)
MAX_TWILIO_RETRIES = int(os.environ.get('MAX_TWILIO_RETRIES', 2))
TWILIO_SMS_CALLBACK = '{}/api/v1/sms_callback/'.format(CRM_HOST)
TWILIO_RECORDING_CALLBACK = '{}/api/v1/calls/recording_callback/'.format(CRM_HOST)

API_RETRIES = int(os.environ.get('API_RETRIES', 2))

CHAT_BOT_HOST = os.environ.get('CHAT_BOT_HOST', 'http://localhost:5005')
RASA_WORKER_HOST = os.environ.get('RASA_WORKER_HOST')
MT_DOMAIN = os.environ.get('MT_DOMAIN', 'g5-clw-1yvea89x-mark-taylor-co.g5static.com')

REAL_PAGE_API_USERNAME = os.environ.get('REAL_PAGE_API_USERNAME')
REAL_PAGE_API_PASSWORD = os.environ.get('REAL_PAGE_API_PASSWORD')
REAL_PAGE_API_LICENSE_KEY = os.environ.get('REAL_PAGE_API_LICENSE_KEY')

SMART_RENT_EMAIL = os.environ.get('SMART_RENT_EMAIL', '').replace('###', '@')
SMART_RENT_PASSWORD = os.environ.get('SMART_RENT_PASSWORD')

ON_SITE_USERNAME = os.environ.get('ON_SITE_USERNAME')
ON_SITE_PASSWORD = os.environ.get('ON_SITE_PASSWORD')

YARDI_TOKEN = os.environ.get('YARDI_TOKEN')

RASA_X_DB_NAME = os.environ.get('RASA_X_DB_NAME')
RASA_X_DB_HOST = os.environ.get('RASA_X_DB_HOST')
RASA_X_DB_USER = os.environ.get('RASA_X_DB_USER')
RASA_X_DB_PASSWORD = os.environ.get('RASA_X_DB_PASSWORD')

RASA_TOKEN = os.environ.get('RASA_TOKEN')

HF_USERNAME = os.environ.get('HF_USERNAME')
HF_PASSWORD = os.environ.get('HF_PASSWORD')
HF_CONVERSATION_SOURCE = os.environ.get('HF_CONVERSATION_SOURCE')
HF_INTEGRATION_ENABLED = False

DISABLE_NOTIFICATION = False

# in seconds
PROSPECT_CHAT_AVAILABILITY_OFFSET = 10
MAX_AGENT_JOINED_PROSPECTS_COUNT = int(os.environ.get('MAX_AGENT_JOINED_PROSPECTS_COUNT', 25))

LAST_ACTIVITY_REDIS = os.environ.get('LAST_ACTIVITY_REDIS', '{}/4'.format(REDIS_URL))

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'debugmail.io'
EMAIL_HOST_USER = 'jakub@liftlytics.com'
EMAIL_HOST_PASSWORD = 'dbce3610-0fa0-11ea-936a-55798ca5e08b'
EMAIL_PORT = 25
EMAIL_USE_TLS = True

DEMO_TOUR_NYLAS_ACCESS_TOKEN = os.environ.get('DEMO_TOUR_NYLAS_ACCESS_TOKEN')
DEMO_TOUR_NYLAS_CALENDAR_ID = os.environ.get('DEMO_TOUR_NYLAS_CALENDAR_ID')
DWELL_TOUR_PARTICIPANT_EMAIL = os.environ.get('DWELL_TOUR_PARTICIPANT_EMAIL')

HOBBES_AUTO_TEST_REPORT_EMAIL = os.environ.get('HOBBES_AUTO_TEST_REPORT_EMAIL')
