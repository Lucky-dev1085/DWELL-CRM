# Generated by Django 2.2.13 on 2020-10-19 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0162_unit_can_be_toured'),
    ]

    operations = [
        migrations.AddField(
            model_name='unit',
            name='not_used_for_marketing',
            field=models.BooleanField(default=False),
        ),
    ]
