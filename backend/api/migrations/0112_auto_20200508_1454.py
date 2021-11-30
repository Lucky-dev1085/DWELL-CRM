# Generated by Django 2.2.11 on 2020-05-08 14:54

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0111_auto_20200508_0751'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='lead_response_time_business',
        ),
        migrations.RemoveField(
            model_name='report',
            name='lead_response_time_non_business',
        ),
        migrations.RemoveField(
            model_name='report',
            name='followups_number',
        ),
        migrations.RemoveField(
            model_name='report',
            name='sign_lease_time',
        ),
        migrations.AddField(
            model_name='report',
            name='lead_response_time_business',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='lead_response_time_non_business',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='followups_number',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='sign_lease_time',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
    ]
