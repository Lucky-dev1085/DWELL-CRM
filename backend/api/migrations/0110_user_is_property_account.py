# Generated by Django 2.2.11 on 2020-04-28 07:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0109_migrate_lead_floor_plan_column'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_property_account',
            field=models.BooleanField(default=False),
        ),
    ]