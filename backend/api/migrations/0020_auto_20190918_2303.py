# Generated by Django 2.1.5 on 2019-09-19 06:03

import backend.api.utils
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_auto_20190916_0202'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='owner',
        ),
        migrations.AddField(
            model_name='customer',
            name='clients',
            field=models.ManyToManyField(related_name='customers', to='api.Client'),
        ),
        migrations.AddField(
            model_name='customer',
            name='properties',
            field=models.ManyToManyField(related_name='customers', to='api.Property'),
        ),
        migrations.AddField(
            model_name='user',
            name='customer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='employee', to='api.Customer'),
        ),
        migrations.AlterField(
            model_name='customer',
            name='customer_name',
            field=models.CharField(blank=True, max_length=30, unique=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='user',
            field=models.OneToOneField(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='customer_admin', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='property',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to=backend.api.utils.upload_image_to),
        ),
    ]
