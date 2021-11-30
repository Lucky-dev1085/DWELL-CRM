from datetime import datetime, timedelta

import pytz
from django.conf import settings
from django.db import models
from django.db.models import F, Count, Subquery, OuterRef, Case, When, Value, CharField, Q
from django.db.models.functions import Least, Coalesce
from django.utils.dateparse import parse_date

from backend.api.models import Property, Report, EmailMessage, Lead, SMSContent, Note, \
    Activity, ScoredCall, CallScoringQuestion
from backend.api.tasks import push_object_saved
from backend.api.tasks.resman.utils import get_notice_to_vacate, get_expected_move_in
from backend.api.views.reports import get_lead_to_lease_data, get_activities_data, \
    get_calls_data
from backend.api.views.reports.report_utils import is_business_hours_lead, get_next_working_date, \
    is_responded_before_closing, get_tours_data, get_chat_data, calculate_lead_source_data, flatten, nearest, \
    get_score_by_category, get_call_score
from backend.celery_app import app

TZ = pytz.timezone('America/Phoenix')


@app.task
def generate_overview_reports(filter_date=None, properties=None, is_daily=False, is_historical=False):
    """
    Compute overview reports data for given date
    :param is_admin_action:
    :param filter_date:
    :param properties: used for initial bulk populating
    :return:
    """
    if not filter_date:
        filter_date = datetime.now(pytz.timezone('America/Phoenix')).date()
    if is_daily:
        filter_date = datetime.now(pytz.timezone('America/Phoenix')).date() - timedelta(days=1)
    start = TZ.localize(datetime.combine(filter_date, datetime.min.time())).astimezone(tz=pytz.UTC)
    end = TZ.localize(datetime.combine(filter_date, datetime.max.time())).astimezone(tz=pytz.UTC)
    for property in (properties or Property.objects.filter(is_released=True)):
        if not property.business_hours.filter(is_workday=True).count():
            continue
        lead_to_lease_report_data = get_lead_to_lease_data((start, end), [property], is_historical)
        activities_report_data = get_activities_data((start, end), [property])
        calls_report_data = get_calls_data((start, end), [property])
        lead_source_data = calculate_lead_source_data((start, end), [property], is_historical)

        if is_daily and settings.RESMAN_INTEGRATION_PARTNER_ID:
            notice_to_vacates = get_notice_to_vacate(start.date(), (end + timedelta(days=1)).date(), property) or 0
        else:
            notice_to_vacates = 0

        if settings.RESMAN_INTEGRATION_PARTNER_ID:
            expected_move_ins = get_expected_move_in(start.date(), (end + timedelta(days=1)).date(), property) or 0
        else:
            expected_move_ins = 0

        tours_report_data = get_tours_data((start, end), [property])
        chat_report_data = get_chat_data((start, end), [property])
        report = Report.objects.update_or_create(
            property=property, date=filter_date,
            defaults=dict(
                leads=lead_to_lease_report_data['leads'], leases=lead_to_lease_report_data['leases'],
                tours=lead_to_lease_report_data['tours'], lost_leads=lead_to_lease_report_data['lost_leads'],

                notes=activities_report_data['notes'], emails=activities_report_data['emails'],
                tasks=activities_report_data['tasks'], calls=activities_report_data['calls'],
                agent_chats=activities_report_data['agent_chats'],
                prospect_calls=calls_report_data['prospect_calls'], call_time=calls_report_data['call_time'],
                call_answered=calls_report_data['call_answered'], call_missed=calls_report_data['call_missed'],
                call_busy=calls_report_data['call_busy'], call_failed=calls_report_data['call_failed'],

                notice_to_vacates=notice_to_vacates,
                expected_move_ins=expected_move_ins,

                in_person_tours=tours_report_data['in_person_tours'],
                virtual_tours=tours_report_data['virtual_tours'],
                guided_virtual_tours=tours_report_data['guided_virtual_tours'],
                facetime_tours=tours_report_data['facetime_tours'],

                in_person_tours_leases=tours_report_data['in_person_tours_leases'],
                virtual_tours_leases=tours_report_data['virtual_tours_leases'],
                guided_virtual_tours_leases=tours_report_data['guided_virtual_tours_leases'],
                facetime_tours_leases=tours_report_data['facetime_tours_leases'],

                chat_conversations=chat_report_data['chat_conversations'],
                agent_chat_conversations=chat_report_data['agent_chat_conversations'],
                repeat_chat_conversations=chat_report_data['repeat_chat_conversations'],

                view_photos_count=chat_report_data['view_photos_count'],
                schedule_tour_count=chat_report_data['schedule_tour_count'],
                reschedule_tour_count=chat_report_data['reschedule_tour_count'],
                cancel_tour_count=chat_report_data['cancel_tour_count'],
                check_prices_count=chat_report_data['check_prices_count'],

                visitor_chat_engagement=chat_report_data['visitor_chat_engagement'],
                tours_scheduled=chat_report_data['tours_scheduled'],
                guests_created=chat_report_data['guests_created'],

                hobbes_chat_conversations=chat_report_data['hobbes_chat_conversations'],
                hobbes_answered_questions=chat_report_data['hobbes_answered_questions'],
                question_count=chat_report_data['question_count'],
                sources=lead_source_data,
            ),
        )
        if filter_date == datetime.now(pytz.timezone('America/Phoenix')).date() - timedelta(days=1):
            push_object_saved(report[0].id, 'Report', True)


@app.task
def compute_all_reports(property_ids=None, start_date=None, end_date=None):
    """
    Weekly scheduled task that re-compute all reports
    :param is_admin_action: determines if call was made from admin panel
    :param property_ids: used for initial reports populating
    :param start_date:
    :param end_date:
    :return:
    """
    day_count = 0

    start_date = parse_date(start_date) if start_date else datetime(year=2021, month=1, day=5).date()
    end_date = parse_date(end_date) if end_date else datetime.now(pytz.timezone('America/Phoenix')).date()

    properties = Property.objects.filter(is_released=True)
    if property_ids:
        properties = Property.objects.filter(pk__in=property_ids)

    while start_date + timedelta(days=day_count) <= end_date:
        generate_overview_reports((start_date + timedelta(day_count)), properties, is_historical=True)
        print((start_date + timedelta(day_count)))
        day_count += 1


def generate_lead_response_time(leads):
    for lead in leads:
        followup_date = lead.first_followup_date
        data = lead.history.exclude(last_source=None).annotate(
            compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                              default=F('last_reactivated_date'),
                              output_field=models.DateTimeField())) \
            .filter(acquisition_date__gte=F('compare_date')).order_by('acquisition_date') \
            .values_list('acquisition_date').distinct()
        history = [lead.last_reactivated_date if lead.last_reactivated_date else lead.created] + \
                  [record[0] for record in data]
        acquisition_date = nearest(history, followup_date)

        type = lead.first_followup_type
        report = Report.objects.filter(date=acquisition_date.astimezone(tz=TZ).date(),
                                       property=lead.property).first()

        result = is_business_hours_lead(lead)
        is_business_hours = result == 'BUSINESS'
        is_additional = result == 'NON_BUSINESS_ADDITIONAL'

        if report:
            if is_business_hours:
                lead_response_time = next(
                    (item for item in report.lead_response_time_business if item['lead'] == lead.id), None
                )
            else:
                lead_response_time = next(
                    (item for item in report.lead_response_time_non_business if item['lead'] == lead.id), None
                )

            if lead_response_time:
                # We don't calculate the response time if it was already done by previous task.
                continue

            business_response_time = None
            non_business_response_time = None

            next_working_date = get_next_working_date(lead, acquisition_date)
            if not next_working_date:
                continue
            if not is_additional:
                response_time = round((followup_date - acquisition_date).total_seconds() / 60, 1)
                if is_business_hours:
                    business_response_time = response_time
                else:
                    non_business_response_time = response_time
                    if followup_date.astimezone(tz=TZ) > next_working_date:
                        # If the lead created on non-business hours is followed up after next opening hours,
                        # then we should count this for business hours as well.
                        business_response_time = \
                            round((followup_date - next_working_date).total_seconds() / 60, 1)
            else:
                if is_responded_before_closing(lead, followup_date, acquisition_date):
                    non_business_response_time = round((followup_date - acquisition_date).total_seconds() / 60, 1)
                elif followup_date.astimezone(tz=TZ) < next_working_date:
                    continue
                else:
                    # todo should confirm
                    non_business_response_time = round(
                        (followup_date.astimezone(tz=TZ) - next_working_date).total_seconds() / 60, 1)

            if business_response_time is not None:
                report.lead_response_time_business = \
                    (report.lead_response_time_business or []) + [dict(lead=lead.id, minutes=business_response_time,
                                                                       first_followup_date=followup_date.isoformat(),
                                                                       type=type)]

                if business_response_time / 60 <= 2:
                    report.followups_2_hours[0] += 1
                elif 2 < business_response_time / 60 <= 24:
                    report.followups_24_hours[0] += 1
                elif 24 < business_response_time / 60 <= 48:
                    report.followups_48_hours[0] += 1
                elif business_response_time / 60 > 48:
                    report.followups_more_48_hours[0] += 1

            if non_business_response_time is not None:
                report.lead_response_time_non_business = \
                    (report.lead_response_time_non_business or []) \
                    + [dict(lead=lead.id, minutes=non_business_response_time,
                            first_followup_date=followup_date.isoformat(), type=type)]

                if non_business_response_time / 60 <= 2:
                    report.followups_2_hours[1] += 1
                elif 2 < non_business_response_time / 60 <= 24:
                    report.followups_24_hours[1] += 1
                elif 24 < non_business_response_time / 60 <= 48:
                    report.followups_48_hours[1] += 1
                elif non_business_response_time / 60 > 48:
                    report.followups_more_48_hours[1] += 1

            report.save()


@app.task
def generate_engagement_reports(filter_date=None, property_ids=None):
    if not filter_date:
        filter_date = datetime.now(pytz.timezone('America/Phoenix')).date()
    start = TZ.localize(datetime.combine(filter_date, datetime.min.time())).astimezone(tz=pytz.UTC)
    end = TZ.localize(datetime.combine(filter_date, datetime.max.time())).astimezone(tz=pytz.UTC)

    properties = Property.objects.filter(is_released=True)
    if property_ids:
        properties = properties.filter(id__in=property_ids)

    # List of shared email across all properties, which will be used for filtering optimization
    shared_emails = properties.filter(
        is_released=True,
        shared_email__isnull=False
    ).values_list('shared_email', flat=True)

    # Get the followed up leads which had activity in given date range.
    lead_status_filter = (Q(status=Lead.LEAD_LOST) & (Q(lost_reason__name='Spam') | Q(lost_reason__name='Test')))
    email_followup_leads = EmailMessage.objects.filter(
        date__gte=start, date__lte=end, sender_email__in=shared_emails, is_guest_card_email=False
    ).annotate(
        assigned_lead_id=Subquery(
            Lead.objects.annotate(
                compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                                  default=F('last_reactivated_date'),
                                  output_field=models.DateTimeField())).filter(
                email=OuterRef('receiver_email'),
                property=OuterRef('property')
            ).exclude(Q(status=Lead.LEAD_TEST) | lead_status_filter)
                .order_by('email', '-compare_date').distinct('email').values('id')
        )
    ).filter(assigned_lead_id__isnull=False).order_by('assigned_lead_id', 'date') \
        .distinct('assigned_lead_id').values_list('assigned_lead_id', flat=True)

    # the first follow up leads by sms message. (we can get the *first* follow up leads for SMS message because
    # it always has lead assigned)
    sms_followup_leads = SMSContent.objects.filter(date__gte=start, date__lte=end, property__in=properties).annotate(
        first_followup_date=Subquery(
            SMSContent.objects.filter(lead=OuterRef('lead')).order_by('lead', 'date').distinct('lead').values('date')
        )
    ).filter(first_followup_date=F('date')).distinct('lead').values_list('lead', flat=True)

    note_followup_leads = Note.objects.filter(created__gte=start, created__lte=end, is_follow_up=True,
                                              property__in=properties).annotate(
        first_followup_date=Subquery(
            Note.objects.filter(lead=OuterRef('lead')).order_by('lead', 'created').distinct('lead').values('created')
        )
    ).filter(first_followup_date=F('created')).distinct('lead').values_list('lead', flat=True)

    stage_changed_leads = Activity.objects.filter(
        type=Activity.LEAD_UPDATED, created__gte=start, created__lte=end, property__in=properties,
        content__in=[
            'Stage updated to Contact made',
            'Stage updated to Application complete',
            'Stage updated to Application pending',
            'Stage updated to Tour set',
            'Stage updated to Tour completed'
        ]
    ).distinct('lead').values_list('lead', flat=True)

    followups_leads = list(email_followup_leads) + list(sms_followup_leads) + list(note_followup_leads) + \
                      list(stage_changed_leads)

    reports = Report.objects.filter(property__isnull=False)
    response_times = flatten(list(reports.values_list('lead_response_time_business', flat=True)) +
                             list(reports.values_list('lead_response_time_non_business', flat=True)))
    old_leads_ids = [item.get('lead') for item in response_times]
    new_leads = Lead.objects.exclude(id__in=old_leads_ids)

    # Filter only first follow up leads
    leads = new_leads.filter(id__in=followups_leads).exclude(
        Q(status=Lead.LEAD_TEST) | lead_status_filter
    ).annotate(compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                                 default=F('last_reactivated_date'),
                                 output_field=models.DateTimeField())).annotate(
        first_followup_email=Subquery(
            EmailMessage.objects.filter(
                property=OuterRef('property'),
                receiver_email=OuterRef('email'),
                date__gte=OuterRef('compare_date'),
                is_guest_card_email=False,
            ).order_by('receiver_email', 'date').distinct('receiver_email').values('date')
        ),
        first_followup_sms=Subquery(
            SMSContent.objects.filter(
                lead=OuterRef('pk'),
                date__gte=OuterRef('compare_date'),
            ).order_by('lead', 'date').distinct('lead').values('date')
        ),
        first_followup_note=Subquery(
            Note.objects.filter(
                lead=OuterRef('pk'),
                is_follow_up=True,
                created__gte=OuterRef('compare_date'),
            ).order_by('lead', 'created').distinct('lead').values('created')
        ),
        first_stage_update=Subquery(
            Activity.objects.filter(
                lead=OuterRef('pk'),
                type=Activity.LEAD_UPDATED,
                created__gte=OuterRef('compare_date'),
                content__in=[
                    'Stage updated to Contact made',
                    'Stage updated to Application complete',
                    'Stage updated to Application pending',
                    'Stage updated to Tour set',
                    'Stage updated to Tour completed'
                ]
            ).order_by('created').values('created')[:1]
        )
    ).annotate(first_followup_date=Least('first_followup_email', 'first_followup_sms', 'first_followup_note',
                                         'first_stage_update')) \
        .exclude(first_followup_date=None).annotate(
        first_followup_type=Case(
            When(first_followup_date=F('first_followup_email'), then=Value('Email')),
            When(first_followup_date=F('first_followup_sms'), then=Value('SMS')),
            When(first_followup_date=F('first_followup_note'), then=Value('Note')),
            When(first_followup_date=F('first_stage_update'), then=Value('Stage update')),
            output_field=CharField(),
        ), )

    generate_lead_response_time(leads)

    sign_lease_times = flatten(list(reports.values_list('sign_lease_time', flat=True)))
    old_leads_ids = [item.get('lead') for item in sign_lease_times]
    new_leads = Lead.objects.exclude(id__in=old_leads_ids)

    closed_leads = new_leads.filter(
        property__isnull=False, closed_status_date__gte=start, closed_status_date__lte=end).exclude(
        Q(status=Lead.LEAD_TEST) | lead_status_filter | (
                Q(closed_status_date__lt=F('last_reactivated_date')) & ~Q(last_reactivated_date=None)))

    closed_leads = closed_leads.annotate(
        compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                          default=F('last_reactivated_date'),
                          output_field=models.DateTimeField())).annotate(
        email_followups_number=Subquery(
            EmailMessage.objects.filter(
                property=OuterRef('property'),
                date__gte=OuterRef('compare_date'),
                receiver_email=OuterRef('email'),
                date__lt=OuterRef('closed_status_date'),
                is_guest_card_email=False,
            ).values('receiver_email').annotate(followups_number=Count('receiver_email')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        sms_followups_number=Subquery(
            SMSContent.objects.filter(
                lead=OuterRef('pk'),
                date__lt=OuterRef('closed_status_date'),
                date__gte=OuterRef('compare_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        note_followups_number=Subquery(
            Note.objects.filter(
                lead=OuterRef('pk'),
                is_follow_up=True,
                created__lt=OuterRef('closed_status_date'),
                created__gte=OuterRef('compare_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        ),
        stage_followups_number=Subquery(
            Activity.objects.filter(
                type=Activity.LEAD_UPDATED,
                lead=OuterRef('pk'),
                content__in=[
                    'Stage updated to Contact made',
                    'Stage updated to Application complete',
                    'Stage updated to Application pending',
                    'Stage updated to Tour set',
                    'Stage updated to Tour completed'
                ],
                created__lt=OuterRef('closed_status_date'),
                created__gte=OuterRef('compare_date'),
            ).values('lead').annotate(followups_number=Count('lead')).values('followups_number'),
            output_field=models.IntegerField()
        )
    ).annotate(
        followups_number=Coalesce(F('email_followups_number'), 0) + Coalesce(F('sms_followups_number'), 0) +
                         Coalesce(F('note_followups_number'), 0) + Coalesce(F('stage_followups_number'), 0)
    )

    for lead in closed_leads.all():
        data = lead.history.exclude(last_source=None).annotate(
            compare_date=Case(When(last_reactivated_date=None, then=F('created')),
                              default=F('last_reactivated_date'),
                              output_field=models.DateTimeField())) \
            .filter(acquisition_date__gte=F('compare_date')).order_by('acquisition_date') \
            .values_list('acquisition_date').distinct()
        history = [lead.last_reactivated_date if lead.last_reactivated_date else lead.created] + \
                  [record[0] for record in data]
        acquisition_date = nearest(history, lead.closed_status_date)
        report = Report.objects.filter(date=acquisition_date.astimezone(tz=TZ).date(),
                                       property=lead.property.pk).first()
        if report:
            sign_lease_time_exists = False
            followups_number_exists = False

            lead_sign_lease_time = next((item for item in report.sign_lease_time if item['lead'] == lead.id), None)
            if lead_sign_lease_time:
                sign_lease_time_exists = True

            if not sign_lease_time_exists:
                sign_lease_time = (lead.closed_status_date - acquisition_date).days
                if report.sign_lease_time:
                    report.sign_lease_time.append(dict(lead=lead.id, days=sign_lease_time))
                else:
                    report.sign_lease_time = [dict(lead=lead.id, days=sign_lease_time)]

            lead_followups_number = next((item for item in report.followups_number if item['lead'] == lead.id), None)
            if lead_followups_number:
                followups_number_exists = True

            if lead.followups_number and not followups_number_exists:
                if report.followups_number:
                    report.followups_number.append(dict(lead=lead.id, followups=lead.followups_number))
                else:
                    report.followups_number = [dict(lead=lead.id, followups=lead.followups_number)]
            report.save()


@app.task
def generate_call_scoring_reports(filter_date=None, property_ids=None):
    if not filter_date:
        filter_date = datetime.now(pytz.timezone('America/Phoenix')).date()
    start = TZ.localize(datetime.combine(filter_date, datetime.min.time())).astimezone(tz=pytz.UTC)
    end = TZ.localize(datetime.combine(filter_date, datetime.max.time())).astimezone(tz=pytz.UTC)

    properties = Property.objects.filter(is_released=True)
    if property_ids:
        properties = properties.filter(id__in=property_ids)

    for property in properties:
        scored_calls = ScoredCall.objects.filter(scored_at__gte=start, scored_at__lte=end, property=property).exclude(
            rescore_status='REQUIRED')
        for scored_call in scored_calls:
            call = scored_call.call  # original call
            report = Report.objects.filter(date=call.date.astimezone(tz=TZ).date(),
                                           property=call.property).first()
            if report:
                is_call_scored = next(
                    (item for item in report.call_score if item['call'] == call.id), None)
                if is_call_scored:
                    # We don't calculate score if it was already done by previous task.
                    continue
                report.call_score = \
                    (report.call_score or []) + list(get_call_score([scored_call.id]))

                report.introduction_score = \
                    (report.introduction_score or []) + [get_score_by_category(
                        scored_call, CallScoringQuestion.CATEGORY_INTRODUCTION_AND_LEAD_INFORMATION)]
                report.qualifying_score = \
                    (report.qualifying_score or []) + [get_score_by_category(
                        scored_call, CallScoringQuestion.CATEGORY_QUALIFYING_QUESTIONS)]
                report.amenities_score = \
                    (report.amenities_score or []) + [get_score_by_category(
                        scored_call, CallScoringQuestion.CATEGORY_AMENITIES_AND_BENEFITS)]
                report.closing_score = \
                    (report.closing_score or []) + [get_score_by_category(
                        scored_call, CallScoringQuestion.CATEGORY_CLOSING)]
                report.overall_score = \
                    (report.overall_score or []) + [get_score_by_category(
                        scored_call, CallScoringQuestion.CATEGORY_OVERALL_IMPRESSION)]

                agent_call_score = get_call_score([scored_call.id], agent=scored_call.agent)
                agent_call_score = [agent_call_score] if type(agent_call_score) is dict else list(agent_call_score)
                report.agents_call_score = (report.agents_call_score or []) + agent_call_score

                report.save()


@app.task
def remove_reactivated_lead_from_engagement_report(lead_id):
    lead = Lead.objects.filter(id=lead_id).first()
    property = lead.property

    data = lead.history.exclude(last_source=None).order_by('acquisition_date') \
        .values_list('acquisition_date').distinct()
    history = [lead.created.astimezone(tz=TZ).date()]
    history += [record[0].astimezone(tz=TZ).date() for record in data]

    reports = Report.objects.filter(property=property, date__in=history)
    for report in reports:
        response_time_business = next((item for item in report.lead_response_time_business
                                       if item.get('lead') == lead_id), None)
        response_time_non_business = next((item for item in report.lead_response_time_non_business
                                           if item.get('lead') == lead_id), None)

        # remove from followups number by hours
        if response_time_business:
            time = response_time_business.get('minutes')
            if time / 60 <= 2:
                report.followups_2_hours[0] -= 1
            elif 2 < time / 60 <= 24:
                report.followups_24_hours[0] -= 1
            elif 24 < time / 60 <= 48:
                report.followups_48_hours[0] -= 1
            elif time / 60 > 48:
                report.followups_more_48_hours[0] -= 1

        if response_time_non_business:
            time = response_time_non_business.get('minutes')
            if time / 60 <= 2:
                report.followups_2_hours[1] -= 1
            elif 2 < time / 60 <= 24:
                report.followups_24_hours[1] -= 1
            elif 24 < time / 60 <= 48:
                report.followups_48_hours[1] -= 1
            elif time / 60 > 48:
                report.followups_more_48_hours[1] -= 1

        # remove from response business time
        report.lead_response_time_business = list(filter(lambda item: item.get('lead') != lead_id,
                                                         report.lead_response_time_business))
        # remove from response non-business time
        report.lead_response_time_non_business = list(filter(lambda item: item.get('lead') != lead_id,
                                                             report.lead_response_time_non_business))
        # remove from followups number before lease
        report.followups_number = list(filter(lambda item: item.get('lead') != lead_id, report.followups_number))

        # remove from sign_lease_time number before lease
        report.sign_lease_time = list(filter(lambda item: item.get('lead') != lead_id, report.sign_lease_time))
        report.save()
