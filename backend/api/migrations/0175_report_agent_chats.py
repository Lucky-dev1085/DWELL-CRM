# Generated by Django 2.2.13 on 2020-11-30 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0174_auto_20201130_1446'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='agent_chats',
            field=models.IntegerField(default=0),
        ),
    ]