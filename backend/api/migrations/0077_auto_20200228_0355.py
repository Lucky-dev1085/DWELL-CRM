# Generated by Django 2.1.5 on 2020-02-28 03:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0076_auto_20200209_1831'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproperty',
            name='name_on_lease_hawk',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='name_on_lease_hawk',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]