# Generated by Django 2.2.11 on 2020-05-08 07:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0110_user_is_property_account'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproperty',
            name='nylas_last_connected_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_last_connected_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]