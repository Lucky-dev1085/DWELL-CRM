# Generated by Django 2.2.11 on 2020-07-23 07:19

from django.db import migrations, models
from django.db.models import F
import django.utils.timezone


def add_default_acquisition_date(apps, schema_editor):
    Lead = apps.get_model('api', 'Lead')
    Lead.objects.update(acquisition_date=F('created'))


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0138_remove_call_answered_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicallead',
            name='is_from_external_vendor',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='lead',
            name='is_from_external_vendor',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='is_external_vendor',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicallead',
            name='acquisition_date',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, editable=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='lead',
            name='acquisition_date',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.RunPython(add_default_acquisition_date),
    ]
