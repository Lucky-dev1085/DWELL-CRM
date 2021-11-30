import pandas as pd
import phonenumbers
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.models import Property, PhoneNumber, ProspectSource


class Command(BaseCommand):
    help = 'Import phone numbers from csv'

    @transaction.atomic
    def handle(self, *args, **options):
        data = pd.read_csv('Sources.csv', encoding='utf-8')

        for index, item in enumerate(data['Unnamed: 0']):
            property = Property.objects.filter(name=item).first()
            if not property:
                print(f'Property not found: {item}')
                continue
            phone_number = data['Unnamed: 1'][index]
            phone_number = phonenumbers.format_number(
                phonenumbers.parse(str(phone_number), 'US'), phonenumbers.PhoneNumberFormat.INTERNATIONAL
            ).replace(' ', '').replace('-', '')
            sid = data['Unnamed: 2'][index]
            source_name = data['Unnamed: 3'][index]
            source, _ = ProspectSource.objects.get_or_create(property=property, name=source_name)
            print(property, phone_number, sid, source)
            PhoneNumber.objects.create(property=property, phone_number=phone_number, twilio_sid=sid, source=source)
