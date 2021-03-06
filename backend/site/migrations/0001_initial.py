# Generated by Django 2.2.13 on 2020-11-27 01:58

import django.contrib.postgres.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('api', '0170_auto_20201127_0155'),
    ]

    operations = [
        migrations.CreateModel(
            name='StatusItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('value', models.IntegerField()),
                ('element', models.CharField(max_length=64)),
                ('hint_text', models.CharField(blank=True, max_length=64, null=True)),
                ('section', models.CharField(choices=[('HOME', 'HOME'), ('PROMOTION', 'PROMOTION'), ('GALLERY', 'GALLERY'), ('FLOOR_PLANS', 'FLOOR_PLANS'), ('AMENITIES', 'AMENITIES'), ('CONTACT', 'CONTACT'), ('FOOTER', 'FOOTER'), ('SEO', 'SEO'), ('NEIGHBORHOOD', 'NEIGHBORHOOD'), ('DESIGN', 'DESIGN'), ('DESIGN', 'DESIGN'), ('VIRTUAL_TOUR', 'VIRTUAL_TOUR')], max_length=32)),
                ('importance', models.CharField(choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')], default='LOW', max_length=32)),
                ('visible_to_visitor', models.BooleanField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('section', models.CharField(choices=[('WEB_ASSETS', 'WEB_ASSETS'), ('COMMUNICATION', 'COMMUNICATION'), ('MARKETING', 'MARKETING'), ('GUIDES', 'GUIDES'), ('CALENDAR', 'CALENDAR')], max_length=32)),
                ('values', django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.jsonb.JSONField(), default=list, size=None)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resource', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Promotion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=64, unique=True)),
                ('promotion_text', models.TextField()),
                ('promotion_title', models.CharField(default='Exclusive Offer', max_length=64)),
                ('promotion_html', models.CharField(max_length=512)),
                ('button_label', models.CharField(default='Select A Unit', max_length=64)),
                ('is_active', models.BooleanField(default=False)),
                ('image', models.CharField(max_length=256)),
                ('seo_title', models.CharField(blank=True, max_length=256, null=True)),
                ('seo_description', models.CharField(blank=True, max_length=512, null=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='promotion', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PageData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('section', models.CharField(choices=[('HOME', 'HOME'), ('PROMOTION', 'PROMOTION'), ('GALLERY', 'GALLERY'), ('FLOOR_PLANS', 'FLOOR_PLANS'), ('AMENITIES', 'AMENITIES'), ('CONTACT', 'CONTACT'), ('FOOTER', 'FOOTER'), ('SEO', 'SEO'), ('NEIGHBORHOOD', 'NEIGHBORHOOD'), ('DESIGN', 'DESIGN'), ('DESIGN', 'DESIGN'), ('VIRTUAL_TOUR', 'VIRTUAL_TOUR')], max_length=32)),
                ('values', django.contrib.postgres.fields.jsonb.JSONField()),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='page_data', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
