# Generated by Django 2.2.11 on 2020-05-28 14:53
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0122_auto_20200528_0800'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='last_twilio_backup_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
