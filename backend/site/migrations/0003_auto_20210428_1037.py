# Generated by Django 2.2.13 on 2021-04-28 10:37

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0216_auto_20210422_0942'),
        ('site', '0002_auto_20201206_2328'),
    ]

    operations = [
        migrations.AddField(
            model_name='promotion',
            name='floor_plans',
            field=models.ManyToManyField(blank=True, related_name='promotions', to='api.FloorPlan'),
        ),
        migrations.AddField(
            model_name='promotion',
            name='restriction',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='promotion',
            name='unit_types',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('STUDIO', 'Studio'), ('ONE_BEDROOM', '1 bedroom'), ('TWO_BEDROOM', '2 bedroom'), ('THREE_BEDROOM', '3 bedroom'), ('FOUR_BEDROOM', '4 bedroom'), ('FIVE_BEDROOM', '5 bedroom')], max_length=128), default=list, size=None),
        ),
    ]