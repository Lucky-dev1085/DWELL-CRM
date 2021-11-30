# Generated by Django 2.2.11 on 2020-04-17 10:32

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0106_task_new_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='activities',
        ),
        migrations.RemoveField(
            model_name='report',
            name='inquiry',
        ),
        migrations.RemoveField(
            model_name='report',
            name='emails',
        ),
        migrations.RemoveField(
            model_name='report',
            name='leads',
        ),
        migrations.RemoveField(
            model_name='report',
            name='leases',
        ),
        migrations.RemoveField(
            model_name='report',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='report',
            name='tasks',
        ),
        migrations.RemoveField(
            model_name='report',
            name='tours',
        ),
        migrations.AddField(
            model_name='report',
            name='emails',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='leads',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='leases',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='notes',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='tasks',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='tours',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True,
                                                            null=True, size=None),
        ),
    ]
