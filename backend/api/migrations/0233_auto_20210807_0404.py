# Generated by Django 2.2.19 on 2021-08-07 04:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0232_auto_20210807_0127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emailattachment',
            name='attachment',
            field=models.FileField(max_length=255, upload_to='email_attachments'),
        ),
    ]
