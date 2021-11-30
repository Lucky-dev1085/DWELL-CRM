from datetime import date

import factory
from faker import Faker

from backend.hobbes.models import ChatReport, ChatReportConversation, ChatReportMessage

faker = Faker()
today = date.today()


def choice_value_getter(choice):
    return choice[0]


class ChoiceIterator(factory.Iterator):
    def __init__(self, iterator, cycle=True):
        super().__init__(iterator, cycle, choice_value_getter)


class ChatReportFactory(factory.django.DjangoModelFactory):
    session_date = factory.Faker('date', pattern='%Y-%m-01')
    status = ChoiceIterator(ChatReport.EVALUATION_STATUSES)

    class Meta:
        model = ChatReport
        django_get_or_create = ('session_date',)


class ChatReportConversationFactory(factory.django.DjangoModelFactory):
    report = factory.SubFactory(ChatReportFactory)

    class Meta:
        model = ChatReportConversation
        django_get_or_create = ('report', 'conversation')


class ChatReportMessageFactory(factory.django.DjangoModelFactory):
    status = ChoiceIterator(ChatReportMessage.MESSAGES_STATUSES)

    conversation = factory.SubFactory(ChatReportConversationFactory)

    class Meta:
        model = ChatReportMessage
        django_get_or_create = ('conversation', 'message')
