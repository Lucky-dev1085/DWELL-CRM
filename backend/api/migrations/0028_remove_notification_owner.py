# Generated by Django 2.1.5 on 2019-09-26 07:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_auto_20190926_0721'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notification',
            name='owner',
        ),
    ]