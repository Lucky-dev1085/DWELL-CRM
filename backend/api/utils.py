import functools
import json
import logging
import re
import math
import phonenumbers
import pytz
import redis

from urllib.parse import urlparse
from dateutil.parser import isoparse
from datetime import timedelta, datetime
from django.conf import settings
from django.db import connection
from django.db.models import Q, Count
from django.template.response import TemplateResponse
from django.utils import timezone


def hyphens(name):
    replacements = [
        (' ', '-'),
        (r'/([a-z])([A-Z])/g', '$1-$2')
    ]
    for old, new in replacements:
        name = re.sub(old, new, name)
    return name.lower()


def upload_image_to(instance, filename):
    dir_name = 'propertyLogo' if instance._meta.model_name == 'property' else ''
    return '%s/%s_%s' % (
        dir_name,
        int(timezone.now().timestamp()),
        filename,
    )


def get_image_url(url):
    if settings.SETTINGS_MODULE in ['backend.settings.production', 'backend.settings.staging']:
        return url
    else:
        return '{}{}'.format(settings.CRM_HOST, url)


def get_value_from_array_by_key(value, key, shared_email=None):
    """
    Get value from first object of array using key which is used for retrieving sender / receiver email from nylas.
    :param value: Array
    :param key: key (name/email)
    :return: email address
    """
    result_value = ''
    if value:
        result_value = value[0].get(key)
    if shared_email and len(value) > 1:
        property_data = next((item for item in value if item.get('email').lower() == shared_email.lower()), None)
        if property_data:
            result_value = property_data.get(key)
    return result_value


def is_archived_email(labels, is_label_format):
    """
    Check if the current email is archived by checking nylas labels.
    :param labels: all available labels
    :param is_label_format: label or folder format
    :return:
    """
    if is_label_format:
        return True
    else:
        return bool(len([label for label in labels if label.get('name') == 'archive']))


def nylas_failed_request_cb(error, property):
    """
    Change nylas link status up to failed reason.
    :param error: error object
    :param property: current property that is doing nylas integration
    :return:
    """
    # define property model here in order to avoid recursion importing
    from backend.api.models import Property
    if error.response.status_code in [401, 403]:
        Property.objects.filter(pk=property.id).update(
            nylas_status=Property.NYLAS_STATUS_AUTH_REQUIRED
        )
    logging.error(error)


def nylas_failed_send_request(error, property, lead):
    error_response_body = json.loads(error.response.content)
    if lead:
        error_message = '{}\n{}: {}\nproperty: {} {}\nlead: {} {}'.format(
            error, error_response_body.get('type'), error_response_body.get('message'), property.id, property.name,
            lead.id, lead.name)
    else:
        error_message = '{}\n{}: {}\nproperty: {} {}'.format(
            error, error_response_body.get('type'), error_response_body.get('message'), property.id, property.name)
    logging.error(error_message)


def get_pusher_socket_id(request):
    """
    Takes a request and return the socket id. The frontend sometimes passes "null", which this function will transform
    to no socket id

    :param request: The request object

    :return: The socket id
    """
    socket_id = request.META.get('HTTP_SOCKET_ID', None)

    if socket_id == 'null':
        return None

    return socket_id


def format_transcription(data):
    result = ''
    items = data['items']
    if not items:
        return result
    segments = data['speaker_labels']['segments']
    prev_speaker = ''
    speaker_label = 'Person B'
    for segment in segments:
        if prev_speaker != segment['speaker_label']:
            prev_speaker = segment['speaker_label']
            speaker_label = 'Person A' if speaker_label == 'Person B' else 'Person B'
            result += '<strong>{}:</strong> '.format(speaker_label)
        else:
            result += '<br class="small-space" />'
        start_time = segment['start_time']
        end_time = segment['end_time']
        start_item_index = next((i for i in range(len(items)) if 'start_time' in items[i] and
                                 float(items[i]['start_time']) >= float(start_time)), None)
        end_item_index = next((i for i in range(len(items)) if 'start_time' in items[i] and
                               float(items[i]['start_time']) >= float(end_time)), None)
        segment_items = items[start_item_index:end_item_index] if end_item_index else \
            items[start_item_index:]
        for index, item in enumerate(segment_items):
            max_confidence = max(float(alternative['confidence']) for alternative in item['alternatives'])
            value = next(alternative for alternative in item['alternatives'] if float(alternative['confidence']) >=
                         max_confidence)['content']
            result += value if index + 1 <= len(segment_items) - 1 \
                               and segment_items[index + 1]['type'] == 'punctuation' else '{} '.format(value)
        if segment != segments[-1]:
            result += '<br />'
    return result


def push_bulk_update_event(request, object, model):
    socket_id = get_pusher_socket_id(request) if request else None
    from backend.api.tasks import push_bulk_save
    push_bulk_save.delay(object, request.property.external_id, model, True, socket_id)


def push_bulk_delete_event(request, object, model):
    socket_id = get_pusher_socket_id(request) if request else None
    from backend.api.tasks import push_bulk_delete
    push_bulk_delete.delay(object, request.property.external_id, model, socket_id)


def require_confirmation(func):
    def wrapper(modeladmin, request, queryset):
        if request.POST.get('confirmation') is None:
            request.current_app = modeladmin.admin_site.name
            context = {'action': request.POST['action'], 'queryset': queryset}
            return TemplateResponse(request, 'admin_action_confirmation.html', context)

        return func(modeladmin, request, queryset)

    wrapper.__name__ = func.__name__
    return wrapper


def is_same_phone_number(number1, number2):
    try:
        return phonenumbers.parse(number1, 'US') == phonenumbers.parse(number2, 'US')
    except phonenumbers.phonenumberutil.NumberParseException:
        return number1 == number2


def reactivate_lead(lead):
    from backend.api.models import Lead
    from backend.api.tasks.reports.get_reports_data import remove_reactivated_lead_from_engagement_report

    lead.status = Lead.LEAD_ACTIVE
    lead.last_reactivated_date = timezone.now()
    remove_reactivated_lead_from_engagement_report.delay(lead.id)

    lead.save()


def handle_same_lead(lead, source):
    from backend.api.models import Lead
    if lead.status == Lead.LEAD_LOST and getattr(lead.lost_reason, 'name', None) in ['Spam', 'Test']:
        return lead
    if lead.status == Lead.LEAD_CLOSED:
        if lead.last_activity_date and timezone.now() - lead.last_activity_date <= timedelta(days=9 * 30) \
                or lead.move_in_date and timezone.now().date() - lead.move_in_date <= timedelta(days=9 * 30):
            return lead
        else:
            reactivate_lead(lead)
    if lead.status == Lead.LEAD_LOST:
        lead.tasks.exclude(status='COMPLETED').delete()
        reactivate_lead(lead)
    if lead.last_activity_date and timezone.now() - lead.last_activity_date > timedelta(days=21):
        lead.stage = Lead.STAGE_INQUIRY
    lead.acquisition_date = timezone.now()
    lead.last_source = source
    lead.save()
    return lead


def construct_lead_filter(property, **fields):
    first_name = fields.get('first_name')
    last_name = fields.get('last_name')
    email = fields.get('email')
    phone_number = fields.get('phone_number')

    lead_filter = Q(first_name__iexact=first_name, last_name__iexact=last_name)
    if email:
        lead_filter |= Q(email__iexact=email)
    if phone_number:
        lead_filter |= Q(phone_number=phone_number)
    lead_filter &= Q(property=property)

    return lead_filter


def create_new_lead(property, tour_date=None, **fields):
    """
    Doc: https://www.notion.so/Lead-dedupe-logic-0b814366439940659209dfa119c573b4
    """
    from backend.api.models import Lead
    from backend.api.views.notification_creation import create_assign_lead_owner_notification

    owner = None
    if hasattr(property, 'assign_lead_owner') and property.assign_lead_owner.is_enabled:
        date = tour_date if tour_date else timezone.now()
        weekday = date.astimezone(tz=property.timezone).strftime('%A').lower()
        owner = getattr(property.assign_lead_owner, weekday, None)

    floor_plan = fields.pop('floor_plan', None)
    units = fields.pop('units', None)
    lead = Lead.objects.create(owner=owner, property=property, **fields)

    if floor_plan:
        lead.floor_plan.set(floor_plan)
    if units:
        lead.units.set(units)

    if lead.owner:
        create_assign_lead_owner_notification(lead, lead.owner)
    else:
        for team_member in property.team_members:
            create_assign_lead_owner_notification(lead, team_member)

    pms_sync_delayed = lead.pms_sync()
    if pms_sync_delayed:
        connection.on_commit(pms_sync_delayed)
    return lead, True


def overwrite_other_fields(lead, fields):
    for field in fields.keys():
        value = fields.get(field)
        if value:
            if field == 'units':
                lead.units.set(value)
            elif field == 'floor_plan':
                lead.floor_plan.set(value)
            else:
                setattr(lead, field, value)

    return handle_same_lead(lead, lead.source), False


def dedupe_lead(property, tour_date=None, **fields):
    """
    Doc: https://www.notion.so/Lead-dedupe-logic-0b814366439940659209dfa119c573b4
    """
    from backend.api.models import Lead

    lead_status_filter = ~Q(status__in=[Lead.LEAD_TEST, Lead.LEAD_DELETED]) & Q(property=property)

    original_fields = fields.copy()
    first_name = fields.pop('first_name', None)
    last_name = fields.pop('last_name', None)
    email = fields.pop('email', None)
    phone_number = fields.pop('phone_number', None)

    if phone_number:
        try:
            phone_number = phonenumbers.format_number(
                phonenumbers.parse(str(phone_number), 'US'), phonenumbers.PhoneNumberFormat.NATIONAL
            )
        except phonenumbers.phonenumberutil.NumberParseException:
            pass

    # scenario 1 - Update to the latest information provided by the lead when Phone and Email match
    if first_name and last_name and email and phone_number:
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number, email__iexact=email
        ).order_by('-acquisition_date').first()
        if lead and lead.first_name != first_name and lead.last_name != last_name:
            lead.first_name = first_name
            lead.last_name = last_name
            return overwrite_other_fields(lead, fields)

    # scenario 2 - If there is a Match on Last name + Phone number then update all other data, including Email address
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number, last_name__iexact=last_name
        ).order_by('-acquisition_date').first()
        if lead and lead.email != email and lead.first_name != first_name:
            if not lead.email:
                lead.email = email
            else:
                lead.secondary_email = lead.email
                lead.email = email
            lead.first_name = first_name
            return overwrite_other_fields(lead, fields)

    # scenario 3 - If there is a match on a phone number, but no match on other data (email address, last or
    # first name), create a new lead and disassociate the matching phone number from the old lead
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number
        ).order_by('-acquisition_date').first()
        if lead and lead.email != email and lead.first_name != first_name and lead.last_name != last_name:
            lead.phone_number = None
            lead.save()
            return create_new_lead(property, tour_date, **original_fields)

    # scenario 4 - If there is a match on a phone number, but no match on other data (email address, last or
    # first name), we should:
    # 1. add the different email address to the lead's account
    # 2. make the old email address the secondary (so the new email address is featured)
    # 3. accept email from both accounts, but send to the new / updated email address
    if phone_number and email and not first_name and not last_name:
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number
        ).order_by('-acquisition_date').first()
        if lead and lead.email != email:
            if not lead.email:
                lead.email = email
            else:
                lead.secondary_email = lead.email
                lead.email = email
            return overwrite_other_fields(lead, fields)

    # scenario 5 - If there is a match on a phone number, but no other data to match on (email address, last or
    # first name), we can assume it is the existing lead and to update the existing lead data
    if phone_number and not email and not first_name and not last_name:
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number
        ).order_by('-acquisition_date').first()
        if lead:
            return overwrite_other_fields(lead, fields)

    # scenario 6 - If there is a match on a phone number, but no email address and no other data matches (last or
    # first name), we should assume it is the existing lead and to update the existing lead data
    if phone_number and not email and first_name and last_name:
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number
        ).order_by('-acquisition_date').first()
        if lead and lead.first_name != first_name and lead.last_name != last_name:
            return create_new_lead(property, tour_date, **original_fields)

    # scenario 7 - If there is a match on email address, but no match on other data (phone number, last or first name),
    # create a new lead and disassociate the matching email address from the old lead
    if email:
        lead = Lead.objects.filter(lead_status_filter, email__iexact=email).order_by('-acquisition_date').first()
        if lead and phone_number and first_name and last_name and lead.phone_number != phone_number and \
                lead.first_name != first_name and lead.last_name != last_name:
            lead.email = None
            lead.save()
            return create_new_lead(property, tour_date, **original_fields)

    # scenario 8 - If there is a match on email address, but no phone number and no other data matches (last or
    # first name), we should assume it is the existing lead and to update the existing lead data
    if email:
        lead = Lead.objects.filter(
            lead_status_filter, email__iexact=email
        ).order_by('-acquisition_date').first()
        if lead and not phone_number and first_name and last_name and lead.first_name != first_name \
                and lead.last_name != last_name:
            lead.first_name = first_name
            lead.last_name = last_name
            return overwrite_other_fields(lead, fields)

    # scenario 9 - If there is a Match on Last name + Phone number then update all other data, including Email address
    if email and last_name:
        lead = Lead.objects.filter(
            lead_status_filter, email__iexact=email, last_name__iexact=last_name
        ).order_by('-acquisition_date').first()
        if lead and phone_number and first_name and lead.phone_number != phone_number and lead.first_name != first_name:
            lead.secondary_phone_number = phone_number
            lead.first_name = first_name
            return overwrite_other_fields(lead, fields)

    # scenario 10 - If there is a Match on Last name + Phone then update all other data
    if phone_number and first_name and last_name and not email:
        lead = Lead.objects.filter(
            lead_status_filter, phone_number__iexact=phone_number, last_name__iexact=last_name
        ).order_by('-acquisition_date').first()
        if lead and lead.first_name != first_name:
            lead.first_name = first_name
            return overwrite_other_fields(lead, fields)

    # scenario 11 - If there is a Match on First name + Last name and Phone number / Email is empty, then override
    # the lead
    if first_name and last_name:
        lead = Lead.objects.filter(
            lead_status_filter, first_name__iexact=first_name, last_name__iexact=last_name,
            email=None, phone_number=None
        ).order_by('-acquisition_date').first()
        if lead:
            lead.email = email
            lead.phone_number = phone_number
            return overwrite_other_fields(lead, fields)

        lead = Lead.objects.filter(
            lead_status_filter, first_name__iexact=first_name, last_name__iexact=last_name
        ).order_by('-acquisition_date').first()
        if lead:
            if email and lead.email == email or phone_number and lead.phone_number == phone_number:
                lead.email = email
                lead.phone_number = phone_number
                return overwrite_other_fields(lead, fields)
    return create_new_lead(property, tour_date, **original_fields)


def sort_leads(queryset, field, order):
    def rgetattr(obj, attr, *args):
        def _getattr(obj, attr):
            return getattr(obj, attr, *args)

        return functools.reduce(_getattr, [obj] + attr.split('.'))

    default = None
    if field == 'owner':
        field = 'owner.email'
    if field == 'next_task':
        field = 'next_task.title'
    if field == 'next_task_date':
        field = 'next_task.due_date'
        default = 'next_task.tour_date'
    if field == 'floor_plan':
        field = 'floor_plans_count'
        queryset = queryset.annotate(floor_plans_count=Count('floor_plan'))
    sorted_leads = sorted(queryset,
                          key=lambda t: str(rgetattr(t, field, rgetattr(t, default, '') if default else '')).lower(),
                          reverse=order == 'desc')
    return sorted_leads


def get_user_last_activity(user_id):
    r = redis.Redis.from_url(settings.LAST_ACTIVITY_REDIS)
    last_activity = r.get('last_activity-{}'.format(user_id))
    return isoparse(last_activity.decode('utf-8')) if last_activity else None


def is_holiday(d):
    from backend.api.models import Holiday
    holidays = Holiday.objects.filter(date__month=d.month, date__day=d.day, country='US')
    if holidays.count():
        return True
    return False


def get_demo_available_times(date, current_timezone=pytz.timezone('US/Central'), current_demo=None):
    times = []
    start = datetime.combine(date, timezone.now().replace(hour=10, minute=0, second=0, microsecond=0).time())
    end = datetime.combine(date, timezone.now().replace(hour=17, minute=0, second=0, microsecond=0).time())
    step = timedelta(minutes=60)

    from backend.api.models import DemoTour
    existing_times = DemoTour.objects.exclude(external_id=current_demo).filter(
        date__range=(current_timezone.localize(start), current_timezone.localize(end)),
        is_cancelled=False,
    ).values_list('date', flat=True)

    existing_times = [time.astimezone(tz=current_timezone).replace(second=0, microsecond=0) for time in existing_times]

    while start <= end:
        time = current_timezone.localize(start)
        if time not in existing_times:
            times.append(time)
        start += step

    return times


def is_matching_keyword(keyword, values_list):
    has_filtered = False
    for value in values_list:
        if keyword.lower() in str(value or '').lower():
            has_filtered = True
    return has_filtered


def parse_float(value):
    if not value:
        return 0
    frac, whole = math.modf(value)
    if frac == 0.0:
        return int(value)
    return value


def format_private_static_url(url, bucket_name=None):
    if not bucket_name:
        bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
    if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto.S3BotoStorage':
        parse = urlparse(url)
        return f'{settings.CRM_HOST}/private_static/{bucket_name}{parse.path}'
    return url
