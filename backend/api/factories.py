import random
import pytz
import factory
from django.template import defaultfilters
from faker import Faker
from backend.api.models import Lead, Task, User, Property, Client, Customer, Note, EmailMessage, FloorPlan, Unit, \
    ProspectSource, ProspectLostReason, Roommate, Call, PhoneNumber, Conversion, AssignLeadOwners, EmailAttachment, \
    SMSContent, ScoredCall, CallScoringQuestion, SourceMatching, ChatProspect, ChatConversation, PetType, \
    ReasonForMoving, RelationshipType, Portfolio

faker = Faker()


def get_choice_value(choices):
    return [choice[0] for choice in choices]


class UserFactory(factory.django.DjangoModelFactory):
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.first_name)))
    phone_number = factory.Faker('phone_number')
    status = 'ACTIVE'
    role = User.G_ADMIN

    class Meta:
        model = User
        django_get_or_create = ('email',)


class PropertyFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('company')
    domain = factory.LazyAttribute(lambda f: '{}.com'.format(defaultfilters.slugify(f.name)))
    resman_account_id = factory.Faker('random_number', digits=4)
    resman_property_id = factory.Faker('uuid4')
    phone_number = factory.Faker('phone_number')
    city = factory.Faker('city')
    town = factory.Faker('address')
    platform = 'BOTH'
    status = 'ACTIVE'
    is_released = True
    is_calls_scoring_enabled = True
    is_chat_reviewing_enabled = True

    class Meta:
        model = Property
        django_get_or_create = ('name', 'domain',)


class ClientFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('company')
    status = factory.Iterator(['ACTIVE', 'INACTIVE'])

    class Meta:
        model = Client
        django_get_or_create = ('name',)


class CustomerFactory(factory.django.DjangoModelFactory):
    customer_name = factory.LazyAttribute(lambda n: faker.company()[:10])

    class Meta:
        model = Customer
        django_get_or_create = ('customer_name',)


class PetTypeFactory(factory.django.DjangoModelFactory):
    """ Factory for PetType """

    property = factory.SubFactory(PropertyFactory)
    name = factory.Iterator(['Dog', 'Cat', 'Bird'])
    external_id = factory.Faker('random_number', digits=4)

    class Meta:
        model = PetType


class ReasonForMovingFactory(factory.django.DjangoModelFactory):
    """ Factory for ReasonForMoving """

    property = factory.SubFactory(PropertyFactory)
    reason = factory.Iterator(['Employment', 'Family', 'Other'])
    external_id = factory.Faker('random_number', digits=4)

    class Meta:
        model = ReasonForMoving


class LeadFactory(factory.django.DjangoModelFactory):
    """ Factory for Leads """

    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.first_name)))
    phone_number = factory.Faker('phone_number')
    origin = factory.Iterator(get_choice_value(Lead.ORIGIN_CHOICES))
    move_in_date = factory.Faker('future_date')
    desired_rent = factory.Faker('random_number', digits=3)
    lease_term = factory.Faker('random_number', digits=1)
    best_contact_method = factory.Iterator(get_choice_value(Lead.CONTACT_METHOD_CHOICES))
    best_contact_time = factory.Iterator(get_choice_value(Lead.CONTACT_TIME_CHOICES))
    occupants = factory.Faker('random_number', digits=1)
    beds = factory.Faker('random_number', digits=1)
    baths = factory.Faker('random_number', digits=1)
    pets = factory.Faker('random_number', digits=1)
    vehicles = factory.Faker('random_number', digits=1)
    washer_dryer_method = factory.Iterator(get_choice_value(Lead.WASHER_DRYER_METHOD))
    property = factory.SubFactory(PropertyFactory)
    stage = factory.Iterator(get_choice_value(Lead.STAGE_CHOICES))
    status = factory.Iterator(['ACTIVE', 'CLOSED', 'DELETED'])
    pms_sync_date = factory.Faker('date_time_this_year', tzinfo=pytz.UTC)
    pms_sync_status = factory.Iterator(['SUCCESS', 'FAILURE'])

    @factory.post_generation
    def tasks(self, create, extracted, **kwargs):
        if extracted is None:
            for i in range(0, 2):
                TaskFactory.create(lead=self, property=self.property)

    @factory.post_generation
    def notes(self, create, count, **kwargs):
        if count is None:
            for i in range(0, 3):
                NoteFactory.create(lead=self, property=self.property)

    @factory.post_generation
    def emails(self, create, extracted, **kwargs):
        if extracted is None:
            for i in range(0, 3):
                EmailMessageFactory.create(lead=self, property=self.property)

    class Meta:
        model = Lead


class TaskFactory(factory.django.DjangoModelFactory):
    """ Factory for Tasks """
    description = factory.Faker('catch_phrase')
    status = factory.Iterator(get_choice_value(Task.STATUS_CHOICES))
    type = factory.Iterator(get_choice_value(Task.TYPE_CHOICES))
    due_date = factory.LazyAttribute(
        lambda obj: faker.date_time_this_year(tzinfo=pytz.UTC) if obj.type not in ['GUIDED_VIRTUAL_TOUR',
                                                                                   'VIRTUAL_TOUR', 'FACETIME',
                                                                                   'IN_PERSON'] else None)
    tour_date = factory.LazyAttribute(
        lambda obj: faker.date_time_this_year(tzinfo=pytz.UTC) if obj.type in ['GUIDED_VIRTUAL_TOUR', 'VIRTUAL_TOUR',
                                                                               'FACETIME', 'IN_PERSON'] else None)

    @factory.post_generation
    def on_created(self, create, extracted, **kwargs):
        if self.type in ['GUIDED_VIRTUAL_TOUR', 'VIRTUAL_TOUR', 'FACETIME', 'IN_PERSON']:
            units = Unit.objects.filter(property=self.property).values_list('pk', flat=True)
            if units.count() > 5:
                self.units.set(Unit.objects.filter(pk__in=random.choices(units, k=5)))

    class Meta:
        model = Task


class NoteFactory(factory.django.DjangoModelFactory):
    """ Factory for Notes """

    text = factory.Faker('catch_phrase')

    class Meta:
        model = Note


class EmailMessageFactory(factory.django.DjangoModelFactory):
    """ Factory for EmailMessages """

    nylas_message_id = factory.Faker('uuid4')
    subject = factory.Faker('catch_phrase')
    sender_name = factory.Faker('first_name')
    sender_email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.sender_name)))
    receiver_name = factory.Faker('first_name')
    receiver_email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.receiver_name)))
    snippet = factory.Faker('catch_phrase')
    body = factory.Faker('catch_phrase')
    date = factory.Faker('future_datetime', end_date='+30d', tzinfo=pytz.UTC)

    class Meta:
        model = EmailMessage
        django_get_or_create = ('nylas_message_id',)


class FloorPlanFactory(factory.django.DjangoModelFactory):
    """ Factory for FloorPlan """

    property = factory.SubFactory(PropertyFactory)
    plan = factory.LazyAttribute(lambda f: '%s-%s' % (faker.random_number(3), faker.word()[0].upper()))
    max_rent = factory.Faker('random_number', digits=3)
    min_rent = factory.Faker('random_number', digits=2)

    class Meta:
        model = FloorPlan


class UnitFactory(factory.django.DjangoModelFactory):
    """ Factory for Unit """

    property = factory.SubFactory(PropertyFactory)
    unit = factory.Faker('random_int', min=4)
    floor_plan = factory.SubFactory(FloorPlanFactory)

    class Meta:
        model = Unit


class ProspectSourceFactory(factory.django.DjangoModelFactory):
    """ Factory for ProspectSource """

    property = factory.SubFactory(PropertyFactory)
    name = factory.Faker('company')
    external_id = factory.Faker('uuid4')

    class Meta:
        model = ProspectSource


class ProspectLostReasonFactory(factory.django.DjangoModelFactory):
    """ Factory for ProspectLostReason """

    name = factory.Iterator(['Availability', 'Cancelled', 'Denied', 'Inactive (Lack of Response)', 'Not Moving'])
    property = factory.SubFactory(PropertyFactory)
    external_id = factory.Faker('uuid4')

    class Meta:
        model = ProspectLostReason
        django_get_or_create = ('external_id',)


class RommateFactory(factory.django.DjangoModelFactory):
    """ Factory for Roommate """

    email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.first_name)))
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    phone_number = factory.Faker('phone_number')
    property = factory.SubFactory(PropertyFactory)

    class Meta:
        model = Roommate


class CallFactory(factory.django.DjangoModelFactory):
    """ Factory for Call """

    source = factory.Faker('company')
    prospect_phone_number = factory.Faker('phone_number')
    property = factory.SubFactory(PropertyFactory)
    call_result = factory.Iterator(get_choice_value(Call.CALL_RESULT_CHOICES))
    duration = factory.Faker('random_number', digits=2)
    date = factory.Faker('past_date')
    recording = factory.django.FileField(filename='recording.mp3')

    class Meta:
        model = Call


class PhoneNumberFactory(factory.django.DjangoModelFactory):
    """ Factory for Phone number """

    phone_number = factory.Faker('phone_number')
    property = factory.SubFactory(PropertyFactory)

    class Meta:
        model = PhoneNumber


class ConversionFactory(factory.django.DjangoModelFactory):
    """ Factory for Conversion """

    email = factory.LazyAttribute(lambda f: '{}@example.com'.format(defaultfilters.slugify(f.first_name)))
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')

    class Meta:
        model = Conversion


class AssignLeadOwnerFactory(factory.django.DjangoModelFactory):
    """ Factory for AssignLeadOwners """

    property = factory.SubFactory(PropertyFactory)

    class Meta:
        model = AssignLeadOwners


class EmailAttachmentFactory(factory.django.DjangoModelFactory):
    """ Factory for EmailAttachment """

    external_id = factory.Faker('random_number', digits=4)
    email_message = factory.SubFactory(EmailMessageFactory)

    class Meta:
        model = EmailAttachment


class SMSContentFactory(factory.django.DjangoModelFactory):
    """ Factory for SMS Content """

    lead = factory.SubFactory(LeadFactory)
    message = factory.Faker('catch_phrase')
    sender_number = factory.Faker('phone_number')
    receiver_number = factory.Faker('phone_number')
    property = factory.SubFactory(PropertyFactory)
    date = factory.Faker('past_datetime', start_date='-30d', tzinfo=pytz.UTC)

    class Meta:
        model = SMSContent


class ScoredCallFactory(factory.django.DjangoModelFactory):
    """ Factory for ScoredCall """

    call = factory.SubFactory(CallFactory)
    property = factory.SubFactory(PropertyFactory)

    class Meta:
        model = ScoredCall


call_scoring_question_choices = [
    'Analyst: Was the LP helpful, courteous and genuinely interested in customer’s needs?',
    'LP refers caller to a sister community or competitor if no sister community is close by or apartment locator.',
    'LP sets a specific appointment with time and day or earns another commitment from the caller (i.e., online lease invitation, future follow up by phone, email)	',
    'LP invites caller to visit the community/take a tour	',
    'LP describes community or apartment features/amenities, neighborhood or company programs specific to the caller’s stated needs	',
    'LP determines that the caller is not qualified due to price, pet, lack of availability, school district, etc.	',
    'LP asks relevant questions/digs deeper to learn what is most important to the customer	',
    'LP asks at least 3 qualifying questions in a conversational style- (when, size, pets, price, # of people) or caller volunteers	',
    'LP attempts to determine caller’s contact information or caller volunteers	',
    'LP used customers name throughout the call',
    'LP collects caller’s name early in the call or caller volunteers',
    'LP professionally introduces self and the community',
]


class CallScoringQuestionFactory(factory.django.DjangoModelFactory):
    """ Factory for CallScoringQuestion """

    category = factory.Iterator(get_choice_value(CallScoringQuestion.CATEGORY_CHOICES))
    question = factory.Iterator(call_scoring_question_choices)
    weight = factory.Iterator([5, 10, 15, 20, 25])
    order = factory.Faker('random_number', digits=1)

    class Meta:
        model = CallScoringQuestion
        django_get_or_create = ('question',)


class SourceMatchingFactory(factory.django.DjangoModelFactory):
    """ Factory for SourceMatching """

    LH_source = factory.Faker('company')
    ResMan_source = factory.Faker('company')

    class Meta:
        model = SourceMatching


class ChatProspectFactory(factory.django.DjangoModelFactory):
    """ Factory for SourceMatching """

    last_visit_page = factory.Iterator(['Gallery', 'Amenities', 'Floor Plans', 'Contact', 'Apply Now'])

    class Meta:
        model = ChatProspect


class ChatConversationFactory(factory.django.DjangoModelFactory):
    """ Factory for SourceMatching """

    date = factory.Faker('past_datetime', start_date='-30d', tzinfo=pytz.UTC)
    type = factory.LazyAttribute(lambda f: 'AGENT' if f.agent else random.choices(['BOT', 'PROSPECT']))
    message = factory.Faker('sentence', nb_words=10)

    class Meta:
        model = ChatConversation


class RelationshipTypeFactory(factory.django.DjangoModelFactory):
    """ Factory for SourceMatching """

    name = factory.Iterator(['Guarantor/Cosigner', 'Dependent', 'Adult co-head of household	', 'Head of household',
                             'Roommate'])
    value = factory.Faker('random_number', digits=12)

    class Meta:
        model = RelationshipType
        django_get_or_create = ('name', 'property',)


class PortfolioFactory(factory.django.DjangoModelFactory):
    """ Factory for Portfolio """

    name = factory.Faker('company')
    type = factory.Iterator(get_choice_value(Portfolio.TYPE_CHOICES))

    class Meta:
        model = Portfolio
