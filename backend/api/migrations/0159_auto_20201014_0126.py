# Generated by Django 2.2.13 on 2020-10-14 07:26

from django.db import migrations
import timezone_field.fields


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0158_auto_20201008_1745'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproperty',
            name='timezone',
            field=timezone_field.fields.TimeZoneField(default='America/Phoenix'),
        ),
        migrations.AddField(
            model_name='property',
            name='timezone',
            field=timezone_field.fields.TimeZoneField(default='America/Phoenix'),
        ),
    ]
