# Generated by Django 2.2.19 on 2021-08-12 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0234_auto_20210810_0225'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproperty',
            name='is_chat_reviewing_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='is_chat_reviewer',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='property',
            name='is_chat_reviewing_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='is_chat_reviewer',
            field=models.BooleanField(default=False),
        ),
    ]