# Generated by Django 2.2.11 on 2020-08-07 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0145_auto_20200807_0659'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproperty',
            name='last_resman_sync_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='last_resman_sync_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
