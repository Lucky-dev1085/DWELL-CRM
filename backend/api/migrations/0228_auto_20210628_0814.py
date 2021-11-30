# Generated by Django 2.2.19 on 2021-06-28 08:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0227_auto_20210622_1658'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emailtemplate',
            name='type',
            field=models.CharField(choices=[('TOUR_CONFIRMATION', 'Tour Confirmation'), ('GENERIC', 'Generic'), ('FIRST_FOLLOWUP', 'First Followup'), ('SECOND_FOLLOWUP', 'Second Followup'), ('THIRD_FOLLOWUP', 'Third Followup'), ('FINAL_FOLLOWUP', 'Final Followup'), ('RECEIVED_APPLICATION', 'Received Application'), ('IN_PERSON_TOUR_CONFIRMATION', 'In-Person Tour Confirmation'), ('FACETIME_TOUR_CONFIRMATION', 'Facetime Tour Confirmation'), ('SELF_GUIDED_TOUR_CONFIRMATION', 'Self-Guided Tour Confirmation'), ('GUIDED_VIRTUAL_TOUR_CONFIRMATION', 'Guided Virtual Tour Confirmation'), ('NEW_PROSPECT_WELCOME', 'New Prospect Welcome Email')], default='GENERIC', max_length=32),
        ),
    ]
