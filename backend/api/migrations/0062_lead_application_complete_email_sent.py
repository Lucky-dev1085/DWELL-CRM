# Generated by Django 2.1.5 on 2019-11-27 19:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0061_auto_20191128_0002'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='application_complete_email_sent',
            field=models.BooleanField(default=False),
        ),
    ]
