# Generated by Django 2.1.5 on 2019-10-30 15:50

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0047_auto_20191030_1550'),
    ]

    operations = [
        migrations.AddField(
            model_name='emailtemplate',
            name='subject_variables',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=128), blank=True, null=True, size=None),
        ),
    ]