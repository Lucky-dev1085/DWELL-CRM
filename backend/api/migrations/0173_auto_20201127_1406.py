# Generated by Django 2.2.13 on 2020-11-27 14:06

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0172_auto_20201127_0227'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='agents_call_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='amenities_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='closing_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='introduction_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='overall_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='qualifying_score',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True),
        ),
    ]
