# Generated by Django 2.2.19 on 2021-05-20 03:54

import django.contrib.postgres.fields.jsonb
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import timezone_field.fields
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0218_auto_20210514_0636'),
    ]

    operations = [
        migrations.CreateModel(
            name='DemoTour',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('date', models.DateTimeField(null=True)),
                ('external_id', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('is_cancelled', models.BooleanField(default=False)),
                ('first_name', models.CharField(max_length=64)),
                ('last_name', models.CharField(max_length=64)),
                ('email', models.EmailField(max_length=64)),
                ('phone_number', models.CharField(max_length=32, validators=[django.core.validators.RegexValidator('\\d+')])),
                ('company', models.CharField(max_length=128)),
                ('timezone', timezone_field.fields.TimeZoneField(default='US/Central')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DemoEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.CharField(max_length=255, unique=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('time', models.DateTimeField(blank=True, null=True)),
                ('owner', models.CharField(blank=True, max_length=255, null=True)),
                ('participants', django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True)),
                ('status', models.CharField(blank=True, max_length=16)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('demo', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event', to='api.DemoTour')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
