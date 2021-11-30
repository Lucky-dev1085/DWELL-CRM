import pytz
import pandas as pd
import requests
import logging
import uuid
import openpyxl
from json import loads

from django.core.files import File
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.conf import settings
from django.template.loader import render_to_string

from backend.api.models import Property
from backend.hobbes.models import HobbesAutoTestQuestion, HobbesAutoTestResult
from backend.celery_app import app


def call_bot(message, prospect_id, property):
    data = dict(sender=prospect_id, message=message)
    response = requests.post(f'{settings.CHAT_BOT_HOST}/webhooks/rest/webhook', json=data)
    if response.status_code != 200:
        print('Error: ---')
        logging.error(f'Calling bot had an issue - {response.status_code}, {response.content}')
        return
    content = loads(response.content)
    for item in content:
        if item.get('text') == 'utter_require_property':
            param = f'"property": "{property.domain}"'
            call_bot('/smalltalk.set_property{' + param + '}', prospect_id, property)
            call_bot(message, prospect_id, property)
    return '\n'.join([i.get('text', '') or i.get('custom', {}).get('type', '') for i in content])


def parse_question(message):
    data = dict(text=message, lang='en')
    response = requests.post(f'{settings.RASA_WORKER_HOST}/model/parse?token={settings.RASA_TOKEN}', json=data)
    if response.status_code != 200:
        logging.info(response.content)
        return None, None
    content = loads(response.content)
    intent = content.get('intent', {}).get('name')
    entities = {}
    for entity in content.get('entities', []):
        entities[entity['entity']] = entity['value']
    return intent, entities


def export_to_excel(worksheet, content, cell):
    for index, value in enumerate(content):
        cell_key = f'{cell}{index + 2}'
        if type(worksheet[cell_key]) == openpyxl.cell.cell.Cell:
            worksheet[cell_key] = value
    return worksheet


@app.task
def run_hobbes_auto_test(property_ids):
    for property in Property.objects.filter(id__in=property_ids):
        prospect_id = str(uuid.uuid4())
        param = f'"property": "{property.domain}"'
        call_bot('/smalltalk.set_property{' + param + '}', prospect_id, property)

        questions = HobbesAutoTestQuestion.objects.filter(is_active=True)
        answers = []
        actual_intents = []
        actual_entities = []
        intent_evaluation = []
        missing_entities = []
        extra_entities = []
        response_evaluation = []
        for index, question in enumerate(questions):
            if index % 50 == 49:
                prospect_id = str(uuid.uuid4())
                param = f'"property": "{property.domain}"'
                call_bot('/smalltalk.set_property{' + param + '}', prospect_id, property)

            positive_answers = str(question.positive_answer or '')
            negative_answers = str(question.negative_answer or '')
            possible_answers = positive_answers.split('//') + negative_answers.split('//')
            answer = call_bot(question.question, prospect_id, property)

            # utter_require_property
            intent, entities = parse_question(question.question)
            actual_intents.append(intent)
            actual_entities.append(entities)

            answered_properly = False
            for item in possible_answers:
                if item.lower().replace('\r', '').replace('\n', '').strip() in \
                        answer.lower().replace('\r', '').replace('\n', '').strip():
                    answered_properly = True
                    break

            if not positive_answers or str(positive_answers) == 'nan':
                answered_properly = True

            if intent == question.intent:
                intent_evaluation.append('')
            else:
                intent_evaluation.append('Incorrect')

            missing_entity = {}
            extra_entity = {}
            for entity in question.entities.keys():
                if entity not in entities.keys():
                    missing_entity[entity] = question.entities[entity]
                elif entity != 'time' and question.entities[entity] != entities[entity]:
                    # we won't check time entity because it will be changed everytime
                    missing_entity[entity] = question.entities[entity]

            for entity in entities.keys():
                if entity not in question.entities.keys():
                    extra_entity[entity] = entities[entity]

            missing_entities.append(missing_entity)
            extra_entities.append(extra_entity)

            response_evaluation.append('' if answered_properly else 'Incorrect')
            answers.append(answer)

        df = pd.DataFrame.from_dict(
            dict(
                questions=list(questions.values_list('question', flat=True)),
                answers=answers,
                response_evaluation=response_evaluation,
                expected_intent=list(questions.values_list('intent', flat=True)),
                actual_intent=actual_intents,
                intent_evaluation=intent_evaluation,
                expected_entities=list(questions.values_list('entities', flat=True)),
                actual_entities=actual_entities,
                missing_entities=missing_entities,
                extra_entities=extra_entities,
            ),
        )

        df.to_excel('backend/hobbes/static/template/auto_test_results.xlsx', index=False)

        hobbes_check = HobbesAutoTestResult.objects.create(
            property=property, date=timezone.now()
        )

        with open('backend/hobbes/static/template/auto_test_results.xlsx', 'rb') as local_file:
            date = hobbes_check.date.astimezone(tz=pytz.timezone('America/Phoenix')).strftime('%Y-%m-%dT%H-%M-%S')
            hobbes_check.file.save(f'Export-{property.external_id}-{date}.xlsx', File(local_file))
            url = hobbes_check.file.url
            send_hobbes_auto_test_result(url[:url.find('?')])
            local_file.close()


@app.task
def send_hobbes_auto_test_result(url):
    template = render_to_string('email/hobbes_auto_test_email/hobbes_auto_test_email.html', {'url': url})

    msg = EmailMultiAlternatives(
        # title:
        'Hobbes auto test report',
        # message:
        None,
        # from:
        'hobbes@dwell.io',
        # to:
        ['chao@dwell.io', settings.HOBBES_AUTO_TEST_REPORT_EMAIL])
    msg.attach_alternative(template, 'text/html')
    msg.send()
