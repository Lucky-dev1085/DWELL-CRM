# Generated by Django 2.2.10 on 2020-06-01 08:11

import backend.api.models.business_hours
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0125_auto_20200529_1745'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businesshours',
            name='end_time',
            field=models.TimeField(blank=True, default=backend.api.models.business_hours.get_end_time, null=True),
        ),
        migrations.AlterField(
            model_name='businesshours',
            name='start_time',
            field=models.TimeField(blank=True, default=backend.api.models.business_hours.get_start_time, null=True),
        ),
        migrations.AlterField(
            model_name='historicalbusinesshours',
            name='end_time',
            field=models.TimeField(blank=True, default=backend.api.models.business_hours.get_end_time, null=True),
        ),
        migrations.AlterField(
            model_name='historicalbusinesshours',
            name='start_time',
            field=models.TimeField(blank=True, default=backend.api.models.business_hours.get_start_time, null=True),
        ),
    ]