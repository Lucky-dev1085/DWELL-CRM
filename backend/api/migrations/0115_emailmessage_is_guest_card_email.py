# Generated by Django 2.2.11 on 2020-05-21 03:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0114_migrate_task_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='emailmessage',
            name='is_guest_card_email',
            field=models.BooleanField(default=False),
        ),
    ]
