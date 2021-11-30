# Generated by Django 2.1.5 on 2020-01-15 14:46

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0068_prospectsource_spends'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('date', models.DateTimeField()),
                ('leads', models.IntegerField(default=0)),
                ('leases', models.IntegerField(default=0)),
                ('tours', models.IntegerField(default=0)),
                ('inquiry', models.IntegerField(default=0)),
                ('activities', models.IntegerField(default=0)),
                ('notes', models.IntegerField(default=0)),
                ('emails', models.IntegerField(default=0)),
                ('tasks', models.IntegerField(default=0)),
                ('calls', models.IntegerField(default=0)),
                ('lead_response_time', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None)),
                ('sign_lease_time', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None)),
                ('followups_number', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None)),
                ('followups_2_hours', models.IntegerField(default=0)),
                ('followups_24_hours', models.IntegerField(default=0)),
                ('followups_48_hours', models.IntegerField(default=0)),
                ('followups_more_48_hours', models.IntegerField(default=0)),
                ('prospect_calls', models.IntegerField(default=0)),
                ('call_time', models.IntegerField(default=0)),
                ('call_answered', models.IntegerField(default=0)),
                ('call_missed', models.IntegerField(default=0)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
