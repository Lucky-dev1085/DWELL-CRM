# Generated by Django 2.1.5 on 2020-02-26 08:05

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0078_auto_20200302_1409'),
    ]

    operations = [
        migrations.CreateModel(
            name='Competitor',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=128)),
                ('address_line_1', models.CharField(blank=True, max_length=256)),
                ('address_line_2', models.CharField(blank=True, max_length=256)),
                ('city', models.CharField(blank=True, max_length=128)),
                ('state', models.CharField(blank=True, max_length=128)),
                ('zip_code', models.CharField(blank=True, max_length=16)),
                ('phone_number', models.CharField(blank=True, max_length=32)),
                ('fax_number', models.CharField(blank=True, max_length=32)),
                ('property', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='competitors', to='api.Property')),
            ],
            options={
                'ordering': ('created',),
            },
        ),
        migrations.CreateModel(
            name='Survey',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('unit_type', models.CharField(max_length=64)),
                ('unit_type_name', models.CharField(max_length=128)),
                ('unit_class', models.CharField(choices=[('STUDIO', 'Studio'), ('ONE_BED', '1 bed'), ('TWO_BED', '2 bed'), ('THREE_BED', '3 bed'), ('ONE_BED_PENTHOUSE', '1 bed Penthouse'), ('TWO_BED_PENTHOUSE', '2 bed Penthouse'), ('THREE_BED_PENTHOUSE', '3 bed Penthouse')], default='STUDIO', max_length=32)),
                ('market_rent', models.FloatField(default=0)),
                ('effective_rent', models.FloatField(default=0)),
                ('concession_amount', models.FloatField(default=0)),
                ('date', models.DateField(blank=True, null=True)),
                ('is_first', models.BooleanField(default=False)),
                ('competitor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='surveys', to='api.Competitor')),
                ('property', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='surveys', to='api.Property')),
            ],
            options={
                'ordering': ('created',),
            },
        ),
        migrations.AddField(
            model_name='prospectsource',
            name='is_paid',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='report',
            name='expected_move_ins',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='notice_to_vacates',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='unit',
            name='bed_rooms',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='unit',
            name='effective_rent',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='unit',
            name='lease_dates',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=[]),
        ),
        migrations.AddField(
            model_name='unit',
            name='market_rent',
            field=models.FloatField(default=0),
        ),
        migrations.AlterUniqueTogether(
            name='competitor',
            unique_together={('property', 'name')},
        ),
    ]