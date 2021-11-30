import pytz
import random
from datetime import timedelta, datetime
from django.utils import timezone
from django.urls import include, path
from rest_framework.test import APITestCase, URLPatternsTestCase


from backend.api.models import User, CallScoringQuestion, ScoredCall, Report, Property
from backend.api.factories import CustomerFactory, ClientFactory, UserFactory, PropertyFactory, LeadFactory,\
    CallScoringQuestionFactory, CallFactory
from backend.api.views.reports import get_call_scoring_data


TZ = pytz.timezone('America/Phoenix')


class BaseTestCase(APITestCase, URLPatternsTestCase):
    urlpatterns = [
        path('api/v1/', include('backend.api.urls')),
        # path('', include('backend.leasing.urls'))
    ]

    def setUp(self):
        self.user = UserFactory(password='password', role=User.LL_ADMIN)
        self.c_admin = UserFactory(password='password', role=User.C_ADMIN)

        self.customer = CustomerFactory()
        self.c_admin.customer = self.customer
        self.c_admin.save()

        self.g_admin = UserFactory(password='password', role=User.G_ADMIN, customer=self.customer)
        self.p_admin = UserFactory(password='password', role=User.P_ADMIN, customer=self.customer)
        self.client.force_authenticate(user=self.user)


class LeadLevelBaseTestCase(BaseTestCase):
    def setUp(self):
        super(LeadLevelBaseTestCase, self).setUp()
        self.m_client = ClientFactory(creator=self.user)
        self.property = PropertyFactory(name='test1', domain='http://test1.com', creator=self.user,
                                        client=self.m_client)
        self.lead = LeadFactory(property=self.property, emails=[], tasks=[], notes=[])
        self.user.properties.add(self.property)

        self.client.force_authenticate(user=self.user)


class PropertyLevelBaseTestCase(BaseTestCase):
    def setUp(self):
        super(PropertyLevelBaseTestCase, self).setUp()
        self.m_client = ClientFactory(creator=self.user)
        self.property = PropertyFactory(name='test1', domain='http://test1.com', creator=self.user,
                                        client=self.m_client, is_released=True)
        self.customer.properties.add(self.property)
        self.customer.clients.add(self.m_client)
        self.user.properties.add(self.property)
        self.user.clients.add(self.m_client)
        self.c_admin.properties.add(self.property)
        self.c_admin.clients.add(self.m_client)
        self.g_admin.properties.add(self.property)
        self.g_admin.clients.add(self.m_client)

        self.client.force_authenticate(user=self.user)


class CallScoringBaseTestBase(PropertyLevelBaseTestCase):
    def setUp(self):
        super(CallScoringBaseTestBase, self).setUp()
        # Generate Call Scoring Questions
        for i in range(0, 5):
            CallScoringQuestionFactory(status='ACTIVE')

        self.call_scorer = UserFactory(
            email='callscorer@gmail.com', role=User.P_ADMIN, customer=self.customer, is_call_scorer=True
        )
        self.call_scorer.properties.add(self.property)
        self.call_scorer.clients.add(self.m_client)

        start_date = timezone.now() - timedelta(days=2)
        end_date = timezone.now()
        day_count = 0

        while start_date + timedelta(days=day_count) < end_date:
            day_count += 1

            for j in range(3):
                call = CallFactory(property=self.property, is_transcribed=True, date=start_date + timedelta(days=day_count))
                print(f'Creating call : {call.prospect_phone_number}')

                if j == 1 and start_date + timedelta(days=day_count + 1) < end_date:
                    print(f'Score a call: {call.prospect_phone_number} of {self.property.name} on {call.date}')
                    random_agent_id = random.choice(
                        self.property.users.filter(is_team_account=True).values_list('id', flat=True)
                    )
                    yes_questions = random.choices(
                        CallScoringQuestion.objects.values_list('id', flat=True), k=2
                    )
                    omitted_questions = random.choices(
                        CallScoringQuestion.objects.exclude(id__in=yes_questions).values_list('id', flat=True)
                    )
                    scored_call = ScoredCall.objects.create(
                        property=self.property, call=call, call_scorer=self.call_scorer,
                        agent=User.objects.filter(id=random_agent_id).first(), scored_at=call.date
                    )
                    scored_call.questions.set(yes_questions)
                    scored_call.omitted_questions.set(omitted_questions)

            filter_date = start_date + timedelta(day_count)
            start = TZ.localize(datetime.combine(filter_date, datetime.min.time())).astimezone(tz=pytz.UTC)
            end = TZ.localize(datetime.combine(filter_date, datetime.max.time())).astimezone(tz=pytz.UTC)

            for property in Property.objects.filter(is_released=True):
                calls_report_data = get_call_scoring_data((start, end), [property])

                Report.objects.update_or_create(
                    property=property, date=filter_date,
                    defaults=dict(
                        leads=[], leases=[], tours=[], notes=[], emails=[], tasks=[],
                        call_score=calls_report_data['call_score'],
                        introduction_score=calls_report_data['introduction_score'],
                        qualifying_score=calls_report_data['qualifying_score'],
                        amenities_score=calls_report_data['amenities_score'],
                        closing_score=calls_report_data['closing_score'],
                        overall_score=calls_report_data['overall_score'],
                        agents_call_score=calls_report_data['agents_call_score'],
                    ),
                )


class MockResponse(object):

    def __init__(self, json_data=None, content=None, status_code=None, text=None):
        self.json_data = json_data
        self.content = content
        self.status_code = status_code
        self.text = text

    def json(self):
        return self.json_data
