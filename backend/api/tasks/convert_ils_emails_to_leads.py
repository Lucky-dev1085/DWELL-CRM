import string
import logging
import re

from django.utils import timezone
from datetime import datetime, timedelta

from backend.api.models import ILSEmail, Property, ProspectSource, Note, PetType
from backend.celery_app import app
from backend.api.utils import dedupe_lead


@app.task
def convert_ils_emails_to_leads(minutes_back=30):
    """
    Convert the ILS emails created on last 10 minutes to leads
    :return:
    """
    start = timezone.now() - timedelta(minutes=minutes_back)
    for ils in ILSEmail.objects.filter(created__gte=start, lead=None):
        logging.info(f'ILS email - {ils.pk}')
        receiver = ils.email
        body = ils.body
        lead = None
        if 'apartmentlist@dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.apartmentlist@dwell.io')], 'ApartmentList.com')
        if 'apartmentlist@ils.dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.apartmentlist@ils.dwell.io')], 'ApartmentList.com')
        if 'yelp@dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.yelp@dwell.io')], 'Yelp.com')
        if 'yelp@ils.dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.yelp@ils.dwell.io')], 'Yelp.com')
        if 'mt@dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.mt@dwell.io')], 'Mark-Taylor.com')
        if 'mt@ils.dwell.io' in receiver:
            lead = pull_lead_from_ils(body, receiver[0:-len('.mt@ils.dwell.io')], 'Mark-Taylor.com')
        if not lead:
            if '<table' in body and '<html' in body:
                # This is the on-going issue from MT team, sometimes they send the ILS email in html format which
                # we don't accept. To reduce the traffic of Sentry from this logs, we reduce the log level to INFO
                logging.info(f'ILS email was unable to create lead [HTML format]. Info - {ils.id}')
            else:
                logging.error(f'ILS email was unable to create lead. Info - {ils.id}')
        ils.lead = lead
        ils.save()


def pull_lead_from_ils(content, external_id, source_name):
    """
    Generate the lead from single ILS email content
    :param content:
    :param external_id:
    :param source_name:
    :return:
    """
    property = Property.objects.get(external_id=external_id)
    source = ProspectSource.objects.filter(name=source_name, property=property).first()
    if not source:
        logging.error(f'{source_name} does not exists in prospect sources of {property.name}')
    lead_details, note_text = parsing_ils_email(content)

    if not lead_details.get('first_name') and not lead_details.get('last_name') \
            and not lead_details.get('phone_number') and not lead_details.get('email'):
        logging.info(f'Invalid ILS data ...')
        return None

    if lead_details.get('pet_type'):
        lead_details['pet_type'] = PetType.objects.filter(
            property=property, name__iexact=lead_details['pet_type']
        ).first()

    lead_details = dict(
        **lead_details,
        source=source,
        origin='WEB',
    )
    lead, _ = dedupe_lead(property, **lead_details)

    if note_text:
        note_text += f'This note was auto-generated from an {source_name} lead email'
        Note.objects.create(lead=lead, property=property, text=note_text, is_auto_generated=True)
    logging.info(f'Created lead from ILS data is being returned {lead}')
    return lead


def parsing_ils_email(html):
    """
    Parsing html formatted ils email content to extracting lead fields
    :return:
    """
    html = html.replace('=\r\n', '').replace('=\n', '')
    contents = [line.strip() for line in html.split('\n')]
    lead = dict()
    home_phone = cell_phone = work_phone = None
    comments = amenities = qualifications = message_from_renter = stage = None
    index = 0

    start = end = 0
    for field in contents:
        if 'Content-Type: text/html;' in field:
            break
        if 'comments:' in field.lower():
            start = index
        if 'If you would like to unsubscribe and stop receiving these emails click here' in field and start:
            end = index
            break
        index += 1
    if start != 0:
        end = end or len(contents)
        multi_line_content = ' '.join(contents[start:end]).replace('--------', '  |  ')
        contents = contents[0:start] + [multi_line_content] + contents[end + 1: len(contents)]

    def convert_unicode(str):
        return str.replace('=C2=A0', '').replace('=20', '').replace('=\n', '').replace('\n', ' ')

    def get_value_from_pair(str):
        return str[len(str.split(':')[0]) + 1:].strip()

    for field in contents:
        if 'Content-Type: text/html;' in field:
            break

        value = ''
        if len(field.split(':')) > 1:
            value = convert_unicode(field[len(field.split(':')[0]) + 1:len(field)].strip())

        if not value:
            continue

        lower_string = field.lower().strip()

        if lower_string.startswith('first name:'):
            lead['first_name'] = value
        if lower_string.startswith('last name:'):
            lead['last_name'] = value
        if lower_string.startswith('home phone:'):
            home_phone = value
        if lower_string.startswith('phone:'):
            home_phone = value
        if 'cell phone:' in lower_string:
            cell_phone = value
        if lower_string.startswith('work phone:'):
            work_phone = value
        if lower_string.startswith('email address:'):
            regex = r"[a-zA-Z0-9_!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
            if value:
                lead['email'] = re.search(regex, value).group(0)
        if lower_string.startswith('comments:'):
            comments = value
        if lower_string.startswith('desired move in:'):
            if len(value.split('-')[0]) == 4:
                lead['move_in_date'] = datetime.strptime(value, '%Y-%m-%d').date()
            else:
                lead['move_in_date'] = datetime.strptime(value, '%m/%d/%Y').date()
        if lower_string.startswith('desired lease term:'):
            try:
                lead['lease_term'] = int(value)
            except Exception as e:
                if value == 'month to month':
                    lead['lease_term'] = 1
                elif value.endswith(' months'):
                    lead['lease_term'] = int(value.strip(string.ascii_letters))
                else:
                    logging.error(e)
        if lower_string.startswith('desired bedrooms:'):
            lead['beds'] = int(value)
        if lower_string.startswith('desired bathrooms:'):
            lead['baths'] = int(value)
        if lower_string.startswith('message from renter:'):
            message_from_renter = value
        if lower_string.startswith('amenities:'):
            amenities = value
        if lower_string.startswith('qualifications:'):
            qualifications = value
        if lower_string.startswith('pets:'):
            for pet_type in ['Dog', 'Cat', 'Bird']:
                if pet_type.lower() in lower_string:
                    lead['pet_type'] = pet_type
        if lower_string.startswith('budget:'):
            try:
                lead['desired_rent'] = float(re.sub(r'[^\d.]', '', value))
            except ValueError:
                lead['desired_rent'] = None

        if 'budget:' in lower_string or 'pets:' in lower_string or 'comments:' in lower_string or 'stage' in lower_string:
            for item in field.split('|'):
                lower_string = item.lower()
                value = convert_unicode(get_value_from_pair(item))
                if 'budget:' in lower_string and not lead.get('desired_rent') and 'did not specify' not in lower_string:
                    try:
                        lead['desired_rent'] = float(re.sub(r'[^\d.]', '', convert_unicode(get_value_from_pair(item))))
                    except ValueError:
                        lead['desired_rent'] = None
                if 'pets:' in lower_string and not lead.get('pet_type') and 'did not specify' not in lower_string:
                    for pet_type in ['Dog', 'Cat', 'Bird']:
                        if pet_type.lower() in item.lower():
                            lead['pet_type'] = pet_type
                if 'amenities:' in lower_string and not amenities and 'did not specify' not in lower_string:
                    amenities = value
                if 'qualifications:' in lower_string and not qualifications:
                    qualifications = value
                if 'message from renter:' in lower_string and not message_from_renter:
                    message_from_renter = convert_unicode(
                        item[item.find('MESSAGE FROM RENTER:') + len('MESSAGE FROM RENTER:'):].strip())
                if 'stage:' in lower_string and not stage:
                    for stage_choice in ['Looking', 'Interested', 'Ready to Move']:
                        if f'[{stage_choice}]' in convert_unicode(get_value_from_pair(item)):
                            stage = stage_choice

    lead['phone_number'] = home_phone or cell_phone or work_phone
    note_text = ''
    if message_from_renter:
        note_text += '<strong>Message from lead:</strong> <br>'
        note_text += convert_unicode(message_from_renter)
        note_text += '<br><br>'

    if stage:
        note_text += '<strong>Move urgency:</strong> <br>'
        note_text += convert_unicode(stage)
        note_text += '<br><br>'

    if amenities:
        note_text += '<strong>Amenities:</strong> <br>'
        note_text += convert_unicode(amenities)
        note_text += '<br><br>'

    if qualifications:
        note_text += '<strong>Qualifications:</strong> <br>'
        note_text += convert_unicode(qualifications)
        note_text += '<br>'

    if comments:
        note_text += '<strong>Comment from lead:</strong> <br>'
        note_text += convert_unicode(comments)
        note_text += '<br>'

    if note_text:
        note_text += '----------'
        note_text += '<br>'
    return lead, note_text
