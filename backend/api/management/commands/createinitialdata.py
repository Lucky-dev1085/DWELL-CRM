import json
import random
import string
from datetime import timedelta
from io import BytesIO

import pytz
import requests
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils import timezone

from backend.api.factories import UserFactory, ClientFactory, CustomerFactory, PropertyFactory, LeadFactory, \
    FloorPlanFactory, UnitFactory, ProspectLostReasonFactory, ProspectSourceFactory, CallFactory, \
    ChatConversationFactory, ChatProspectFactory, EmailMessageFactory, SMSContentFactory, \
    RelationshipTypeFactory, CallScoringQuestionFactory, PortfolioFactory, NoteFactory, TaskFactory
from backend.api.management.commands.migrate_mongodb_data import _generate_site_data
from backend.api.models import User, Property, ScoredCall, CallScoringQuestion, Portfolio, Lead, ProspectSource, \
    ProspectLostReason, Activity, Unit, Task
from backend.api.tasks.reports.get_reports_data import compute_all_reports, generate_engagement_reports, \
    generate_call_scoring_reports
from backend.hobbes.factories import ChatReportFactory, ChatReportConversationFactory, ChatReportMessageFactory
from backend.hobbes.models import ChatReport
from backend.site.models import PageData
from backend.compete.management.commands.compete_initial_data import generate_compete_mock


class Command(BaseCommand):
    help = 'Creates initial basic data for manual testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--shared_email',
            help="""Shared email for test environment."""
        )
        parser.add_argument(
            '--property_count',
            help="""Property count for test environment."""
        )
        parser.add_argument(
            '--days_count',
            help="""Days count for test environment."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Creates initial basic data for manual testing

        """
        calls = [
            dict(
                transcription='https://crm-production-transcription.s3-us-west-1.amazonaws.com/CA0e08bdbd0d201f85679bf6e2846e0107-transcribe.json',
                recording='https://api.twilio.com/2010-04-01/Accounts/AC09df227c9e20182421dcfe22f227879b/Recordings/RE9d72095945323d8a94c27575003a070d',
                duration=398,
            ),
            dict(
                transcription='https://crm-production-transcription.s3-us-west-1.amazonaws.com/CA26b473d923de94538091f37bf82b8881-transcribe.json',
                recording='https://api.twilio.com/2010-04-01/Accounts/AC09df227c9e20182421dcfe22f227879b/Recordings/RE138449e2caaf23012c91350a282d339d',
                duration=235,
            ),
            dict(
                transcription='https://crm-production-transcription.s3-us-west-1.amazonaws.com/CAe12896e2b3bb661e253fb1262c748b8d-transcribe.json',
                recording='https://api.twilio.com/2010-04-01/Accounts/AC09df227c9e20182421dcfe22f227879b/Recordings/REac6aad443f6f694f0e4874184a0a2d38',
                duration=206,
            ),
            dict(
                transcription='https://crm-production-transcription.s3-us-west-1.amazonaws.com/CA350df2b904f0ea548ebd146fc18b93f0-transcribe.json',
                recording='https://api.twilio.com/2010-04-01/Accounts/AC09df227c9e20182421dcfe22f227879b/Recordings/RE4755cab921e5bedb2c5d1ee6cadac2a9',
                duration=642,
            ),
            dict(
                transcription='https://crm-production-transcription.s3-us-west-1.amazonaws.com/CAbb535ef8a4f4d9c676a73b8c82b915dc-transcribe.json',
                recording='https://api.twilio.com/2010-04-01/Accounts/AC09df227c9e20182421dcfe22f227879b/Recordings/REcbbcd670ccb27665a6ed2cce382a989a',
                duration=757,
            ),
        ]
        for idx, call in enumerate(calls):
            if not default_storage.exists('call_recording/call_{}.mp3'.format(idx)):
                url = call['recording']
                recording_file = requests.get(url)
                recording = BytesIO()
                recording.write(recording_file.content)
                call['recording'] = recording
                default_storage.save('call_recording/call_{}.mp3'.format(idx), recording)

        customer = CustomerFactory()
        c_admin = UserFactory(email='user2@gmail.com', is_team_account=False)
        c_admin.role = User.C_ADMIN
        c_admin.customer = customer
        c_admin.set_password('admin')
        c_admin.save()

        ll_admin = UserFactory(email='user1@gmail.com', is_superuser=True, is_staff=True, is_team_account=False)
        ll_admin.role = User.LL_ADMIN
        ll_admin.customer = customer
        ll_admin.set_password('admin')
        ll_admin.save()

        g_admin = UserFactory(email='user3@gmail.com')
        g_admin.role = User.C_ADMIN
        g_admin.customer = customer
        g_admin.set_password('admin')
        g_admin.save()

        chat_reviewer = UserFactory(
            email='chatreviewer@gmail.com',
            role=User.P_ADMIN,
            customer=customer,
            is_call_scorer=True,
            is_chat_reviewer=True,
        )
        chat_reviewer.set_password('admin')
        chat_reviewer.save()

        call_scorer = UserFactory(
            email='callscorer@gmail.com', role=User.P_ADMIN, customer=customer, is_call_scorer=True
        )
        call_scorer.set_password('admin')
        call_scorer.save()

        client = ClientFactory(customer=customer)

        # Generate Call Scoring Questions
        for i in range(0, 12):
            CallScoringQuestionFactory(status='ACTIVE')

        properties = [
            dict(name='Localhost', domain='localhost:3000', status='ACTIVE', platform='BOTH',
                 is_calls_scoring_enabled=True),
            dict(name='QA Site 1', domain='qa-site-1.dwell.io', status='ACTIVE', platform='BOTH',
                 client_external_id='150fa03fda8ca96eef89fcaef00e570a', site_template='arlo',
                 is_calls_scoring_enabled=True),
            dict(name='QA Site 2', domain='qa-site-2.dwell.io', status='ACTIVE', platform='BOTH',
                 client_external_id='b31b961542f9a1cfda7444517f20f74e', site_template='san_portales',
                 is_calls_scoring_enabled=True,
                 mark_taylor_base_url='http://{}/apartments/az/scottsdale/san-portales/'.format(settings.MT_DOMAIN)),
        ]

        property_count = int(options.get('property_count', None) or 3)
        if property_count > 3:
            for i in range(3, property_count):
                client_external_id = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(32))
                property = dict(name='QA Site {}'.format(i),
                                domain='qa-site-{}.dwell.io'.format(i),
                                status='ACTIVE', platform='BOTH',
                                is_calls_scoring_enabled=True,
                                client_external_id=client_external_id,
                                site_template='emerson')
                properties.append(property)

        portfolio = PortfolioFactory(name='MT', type=Portfolio.TYPE_MARK_TAYLOR)

        rand_int = random.randint(0, 5)
        rand_account = UserFactory(is_team_account=True)
        rand_account.customer = customer
        rand_account.set_password('admin')
        rand_account.save()
        rand_account.clients.add(client)

        days_count = int(options.get('days_count', None) or 7)

        for params in properties:
            site_template = params.pop('site_template', 'page_data')
            property = PropertyFactory(client=client, customer=customer, **params)
            property.portfolios.set([portfolio])
            rand_account.properties.add(property)

            if params.get('client_external_id'):
                property.client_external_id = params.get('client_external_id')
                property.save()
            # PhoneNumberFactory(property=property, type='SMS')

            url = f'backend/api/static/site_data/{site_template}.json'
            with open(url, 'r') as file:
                content = file.read()
            page_data = json.loads(content)

            page_data['domain'] = property.domain
            _generate_site_data([page_data], [], [])

            misc = PageData.objects.filter(property=property, section='SEO').first()
            if misc:
                values = misc.values
                values['aditionalScript'] = \
                    f'{values["aditionalScript"]}' \
                    f'<script src="{settings.CRM_HOST}/api/v1/load_dwelljs/dwell.js?client_id={property.client_external_id}" type="text/javascript" />'
                misc.values = values
                misc.save()

            # create team accounts
            for j in range(5):
                team_account = UserFactory()
                team_account.customer = customer
                team_account.set_password('admin')
                team_account.save()
                team_account.properties.add(property)
                team_account.clients.add(client)

            # create prospect lost reasons
            lost_reason_ids = []
            for j in range(5):
                lost_reason = ProspectLostReasonFactory(property=property)
                lost_reason_ids.append(lost_reason.id)
                print(f'Creating lost reason : {lost_reason.name}')

            # create prospect sources
            source_ids = []
            for j in range(50):
                source = ProspectSourceFactory(property=property, name='Source {}'.format(j))
                source_ids.append(source.id)
                print(f'Creating prospect source : {source.name}')

            # create floor plan and unit
            unit_ids = []
            for j in range(4):
                plan = FloorPlanFactory(property=property, bedrooms=j)
                print(f'Creating floor plan : {plan.plan}')
                for k in range(5):
                    try:
                        unit = UnitFactory(floor_plan=plan, property=property)
                        unit_ids.append(unit.id)
                        print(f'Creating unit : {unit.unit}')
                    except IntegrityError:
                        pass

            # create relationship types
            for j in range(5):
                RelationshipTypeFactory(property=property)

            evaluation_report = ChatReportFactory()

            start_date = timezone.now() - timedelta(days=days_count)
            end_date = timezone.now()
            day_count = 0
            while start_date + timedelta(days=day_count) < end_date:
                day_count += 1
                for j in range(10):
                    try:
                        # create lead (business or non-business)
                        source = ProspectSource.objects.filter(id=random.choice(source_ids)).first()
                        unit = Unit.objects.filter(id=random.choice(unit_ids)).first()
                        lead = LeadFactory(property=property, emails=[], notes=[], tasks=[],
                                           stage=Lead.STAGE_INQUIRY, status=Lead.LEAD_ACTIVE,
                                           source=source)
                        lead.units.add(unit)
                        if random.randint(0, 1):
                            date = (start_date + timedelta(days=day_count, minutes=j)).replace(
                                hour=13, tzinfo=pytz.timezone('America/Phoenix'))
                            lead.acquisition_date = date
                            lead.created = date
                        else:
                            date = (start_date + timedelta(days=day_count, minutes=j)).replace(
                                hour=20, tzinfo=pytz.timezone('America/Phoenix'))
                            lead.acquisition_date = date
                            lead.created = date

                        # 2 tours, 1 lease, 1 lost
                        if j == 6:
                            lost_reason = ProspectLostReason.objects.filter(id=random.choice(lost_reason_ids)).first()
                            lead.status = Lead.LEAD_LOST
                            lead.lost_reason = lost_reason
                        if j in [7, 8]:
                            lead.stage = Lead.STAGE_TOUR_COMPLETED
                            lead.tour_completed_date = lead.acquisition_date + timedelta(hours=random.randint(1, 5))
                        if j == 9:
                            lead.status = Lead.LEAD_CLOSED
                        lead.save()

                        if lead.status == Lead.LEAD_CLOSED:
                            lead.closed_status_date = (lead.created + timedelta(
                                days=random.randint(1, 5), minutes=j)).replace(
                                hour=13, tzinfo=pytz.timezone('America/Phoenix'))

                        activity = Activity.objects.filter(lead=lead, type=Activity.LEAD_UPDATED,
                                                           content='Stage updated to Tour completed').first()
                        if activity:
                            activity.created = lead.acquisition_date + timedelta(hours=random.randint(1, 5))
                            activity.save()
                        print(f'Creating lead : {lead.first_name} {lead.last_name}')

                        # create 3 notes per lead
                        for n in range(3):
                            note = NoteFactory(lead=lead, property=property, is_follow_up=True)
                            note.created = lead.acquisition_date + timedelta(hours=random.randint(0, 6),
                                                                             minutes=random.randint(11, 59))
                            note.save()

                        # create 2 tasks per lead
                        for t in range(2):
                            task = TaskFactory(lead=lead, property=property,
                                               type=random.choice([
                                                   Task.TYPE_IN_PERSON,
                                                   Task.TYPE_VIRTUAL_TOUR,
                                                   Task.TYPE_FACETIME,
                                                   Task.TYPE_GUIDED_VIRTUAL_TOUR,
                                                   Task.TYPE_SELF_GUIDED_TOUR,
                                               ]) if t == 0 else Task.TYPE_FOLLOW_FIRST)
                            task.created = lead.acquisition_date + timedelta(hours=random.randint(0, 6),
                                                                             minutes=random.randint(11, 59))
                            task.save()

                        # create 3 emails per lead
                        for e in range(3):
                            email = EmailMessageFactory(
                                lead=lead,
                                receiver_email=lead.email,
                                receiver_name=lead.first_name,
                                sender_email=property.shared_email or 'test@test.com',
                                date=lead.acquisition_date + timedelta(hours=random.randint(0, 6),
                                                                       minutes=random.randint(11, 59)),
                                property=property
                            )
                            print(f'Creating email : {email.subject}')

                        if random.randint(0, 5) < 4:
                            for k in range(10):
                                if random.randint(0, 1):
                                    SMSContentFactory(lead=lead, property=property, sender_number=lead.phone_number,
                                                      receiver_number=property.sms_tracking_number, is_read=True,
                                                      date=lead.acquisition_date + timedelta(hours=random.randint(0, 6),
                                                                                             minutes=random.randint(11,
                                                                                                                    59)))
                                else:
                                    SMSContentFactory(lead=lead, property=property, receiver_number=lead.phone_number,
                                                      sender_number=lead.property.sms_tracking_number, is_read=True,
                                                      date=lead.acquisition_date + timedelta(hours=random.randint(0, 6),
                                                                                             minutes=random.randint(11,
                                                                                                                    59)))

                        # create prospect
                        if random.randint(0, 1):
                            prospect = ChatProspectFactory(property=property, lead=lead)
                        else:
                            prospect = ChatProspectFactory(property=property)

                        report_status = evaluation_report.status
                        if report_status == ChatReport.STATUS_PENDING:
                            reviewed = False
                        elif report_status == ChatReport.STATUS_PROGRESS:
                            reviewed = bool(random.randint(0, 1))
                        else:
                            reviewed = True

                        evaluation_report_chats = ChatReportConversationFactory(
                            reviewed=reviewed, report=evaluation_report, conversation=prospect
                        )

                        # create conversation history for prospect
                        for k in range(5):
                            user = property.users.filter(is_team_account=True).first() if random.randint(0, 1) else None
                            conv_type = 'AGENT' if user else random.choices(['PROSPECT', 'BOT', 'AGENT'])[0]
                            chat_conversation = ChatConversationFactory(property=property, prospect=prospect, agent=user,
                                                    date=start_date + timedelta(days=day_count), is_read=True,
                                                    type=conv_type)
                            if conv_type == 'AGENT':
                                continue

                            report_message = ChatReportMessageFactory(
                                conversation=evaluation_report_chats, message=chat_conversation
                            )
                            if report_status == ChatReport.STATUS_PENDING or (not reviewed and random.randint(0, 1)):
                                report_message.status = None
                                report_message.save()

                    except IntegrityError:
                        pass

                rand_call_num = random.randint(0, 10)
                for j in range(10):
                    try:
                        source = ProspectSource.objects.filter(id=random.choice(source_ids)).first()
                        call = CallFactory(property=property, is_transcribed=True, call_result='connected',
                                           transcription=calls[j % 5]['transcription'],
                                           duration=calls[j % 5]['duration'],
                                           date=start_date + timedelta(days=day_count),
                                           source=source.name if source else None, recording=None)
                        call.recording.name = 'call_recording/call_{}.mp3'.format(j % 5)
                        call.save()
                        print(f'Creating call : {call.prospect_phone_number}')

                        if j == rand_call_num and start_date + timedelta(days=day_count + 1) < end_date:
                            print(f'Score a call: {call.prospect_phone_number} of {property.name} on {call.date}')
                            random_agent_id = random.choice(
                                property.users.filter(is_team_account=True).values_list('id', flat=True)
                            )
                            questions_count = CallScoringQuestion.objects.count()
                            if i == rand_int:
                                random_agent_id = rand_account.id
                            yes_questions = random.choices(
                                CallScoringQuestion.objects.values_list('id', flat=True), k=questions_count - 3
                            )
                            omitted_questions = random.choices(
                                CallScoringQuestion.objects.exclude(id__in=yes_questions).values_list('id', flat=True)
                            )
                            scored_call = ScoredCall.objects.create(
                                property=property, call=call, call_scorer=call_scorer,
                                agent=User.objects.filter(id=random_agent_id).first(), scored_at=call.date
                            )
                            scored_call.questions.set(yes_questions)
                            scored_call.omitted_questions.set(omitted_questions)
                    except IntegrityError:
                        pass

        customer.clients.set([client])
        customer.properties.set(client.properties.all())

        g_admin.clients.set([client])
        g_admin.properties.set([client.properties.first()])

        chat_reviewer.clients.set([client])
        chat_reviewer.properties.set(client.properties.all())

        call_scorer.clients.set([client])
        call_scorer.properties.set(client.properties.all())

        start_date = (timezone.now() - timedelta(days=days_count)).date()
        end_date = timezone.now().date()
        # Generate reports
        compute_all_reports(Property.objects.values_list('id', flat=True),
                            start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

        day_count = 0
        while start_date + timedelta(days=day_count) <= end_date:
            generate_engagement_reports((start_date + timedelta(day_count)))
            generate_call_scoring_reports((start_date + timedelta(day_count)))
            print((start_date + timedelta(day_count)))
            day_count += 1

        generate_compete_mock()
