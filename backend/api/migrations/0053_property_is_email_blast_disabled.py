# Generated by Django 2.1.5 on 2019-11-07 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0052_auto_20191107_1349'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='is_email_blast_disabled',
            field=models.BooleanField(default=False),
        ),
    ]
