# Generated by Django 2.1.5 on 2020-02-01 17:24

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0072_auto_20200126_1241'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='lead_response_time',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(default=0), blank=True, null=True, size=None),
        ),
    ]
