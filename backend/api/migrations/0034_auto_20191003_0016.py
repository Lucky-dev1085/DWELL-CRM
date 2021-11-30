# Generated by Django 2.1.5 on 2019-10-02 17:16

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_auto_20191002_0121'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='created',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customer',
            name='updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
