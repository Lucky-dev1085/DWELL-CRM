# Generated by Django 2.1.5 on 2020-03-05 15:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0081_merge_lost_reasons'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='prospectlostreason',
            name='property',
        ),
        migrations.AddField(
            model_name='prospectlostreason',
            name='account_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='prospectlostreason',
            name='external_id',
            field=models.CharField(blank=True, max_length=128, null=True, unique=True),
        ),
    ]
