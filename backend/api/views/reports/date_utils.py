import datetime

import pytz
from dateutil.relativedelta import relativedelta

# DATE VALUES
from backend.api.models import Lead

TZ = pytz.timezone('America/Phoenix')


def get_date_range(date_period, custom_date_start, custom_date_end):
    if date_period == 'TODAY':
        today = datetime.datetime.now(pytz.timezone('America/Phoenix'))
        start = TZ.localize(today.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None))
        end = TZ.localize(today.replace(hour=23, minute=59, second=59, microsecond=0, tzinfo=None))
        date_range = (start.astimezone(tz=pytz.UTC), end.astimezone(tz=pytz.UTC))
    elif date_period == 'ALL_TIME':
        end_of_yesterday = (datetime.datetime.now(pytz.timezone('America/Phoenix')) - datetime.timedelta(days=1)).replace(
            hour=23, minute=59, second=59, microsecond=0)
        leads = Lead.objects.filter(property__isnull=False).exclude(status=Lead.LEAD_TEST).order_by('created')
        start = TZ.localize(leads.first().created) if leads.count() != 0 else end_of_yesterday
        end = end_of_yesterday
        date_range = (start.astimezone(tz=pytz.UTC), end.astimezone(tz=pytz.UTC))
    elif date_period == 'CUSTOM_RANGE':
        date_range = date_period_to_date_range(date_period, custom_date_start, custom_date_end)
    else:
        date_range = date_period_to_date_range(date_period)
    return date_range


def previous_quarter(date):
    """
    Calculate previous quarter end date.
    :param date:
    :return:
    """
    if date.month < 4:
        return date.replace(year=date.year - 1, month=12, day=31)
    elif date.month < 7:
        return date.replace(year=date.year, month=3, day=31)
    elif date.month < 10:
        return date.replace(year=date.year, month=6, day=30)
    return date.replace(year=date.year, month=9, day=30)


def date_period_to_date_range(date_period, custom_date_start=None, custom_date_end=None):
    """
    Convert selected date period to date range.
    :param date_period:
    :param custom_date_start: start date for selected custom range
    :param custom_date_end: end date for selected custom range
    :return:
    """
    start, end = None, None
    today = datetime.datetime.now(pytz.timezone('America/Phoenix'))
    if date_period == 'THIS_WEEK':
        start = (today - datetime.timedelta(days=today.weekday() + 1))
        end = today
    if date_period == 'THIS_MONTH':
        start = today.replace(day=1)
        end = today
    if date_period == 'THIS_QUARTER':
        current_quarter = (today.month - 1) // 3 + 1
        start = datetime.datetime(today.year, 3 * current_quarter - 2, 1)
        end = today
    if date_period == 'THIS_YEAR':
        start = datetime.datetime(today.year, 1, 1)
        end = today
    if date_period == 'LAST_WEEK':
        start = (today - datetime.timedelta(days=today.weekday() + 8))
        end = (today - datetime.timedelta(days=today.weekday() + 2))
    if date_period == 'LAST_MONTH':
        start = (today + relativedelta(months=-1)).replace(day=1)
        end = today.replace(day=1) - datetime.timedelta(days=1)
    if date_period == 'LAST_QUARTER':
        end = previous_quarter(today)
        start = (end + relativedelta(months=-2)).replace(day=1)
    if date_period == 'LAST_YEAR':
        start = datetime.datetime(today.year - 1, 1, 1)
        end = datetime.datetime(today.year - 1, 12, 31)
    if date_period == 'CUSTOM_RANGE':
        start = datetime.datetime.strptime(custom_date_start, '%m-%d-%Y')
        end = datetime.datetime.strptime(custom_date_end, '%m-%d-%Y')
        if end == today:
            end -= datetime.timedelta(days=1)
    start = TZ.localize(start.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None))
    end = TZ.localize(end.replace(hour=23, minute=59, second=59, microsecond=0, tzinfo=None))
    return start.astimezone(tz=pytz.UTC), end.astimezone(tz=pytz.UTC)


def get_previous_date_range(current_date_range, date_period):
    """
    Calculate previous date range based on current one.
    :param current_date_range:
    :param date_period:
    :return:
    """
    start, end = None, None
    today = datetime.datetime.now(pytz.timezone('America/Phoenix'))
    if date_period == 'TODAY':
        start = end = today - datetime.timedelta(days=1)
    if date_period in ['THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER', 'THIS_YEAR', 'CUSTOM_RANGE']:
        td = current_date_range[1] - current_date_range[0]
        start = current_date_range[0] - datetime.timedelta(days=td.days + 1)
        end = current_date_range[0] - datetime.timedelta(days=1)
    if date_period == 'LAST_WEEK':
        start = (today - datetime.timedelta(days=today.weekday() + 15))
        end = (today - datetime.timedelta(days=today.weekday() + 9))
    if date_period == 'LAST_MONTH':
        start = (today + relativedelta(months=-2)).replace(day=1)
        end = (today + relativedelta(months=-1)).replace(day=1) - datetime.timedelta(days=1)
    if date_period == 'LAST_QUARTER':
        end = previous_quarter(previous_quarter(today))
        start = end + relativedelta(months=-3)
    if date_period == 'LAST_YEAR':
        start = datetime.datetime(today.year - 2, 1, 1)
        end = datetime.datetime(today.year - 2, 12, 31)
    start = TZ.localize(start.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None))
    end = TZ.localize(end.replace(hour=23, minute=59, second=59, microsecond=0, tzinfo=None))
    return start.astimezone(tz=pytz.UTC), end.astimezone(tz=pytz.UTC)
