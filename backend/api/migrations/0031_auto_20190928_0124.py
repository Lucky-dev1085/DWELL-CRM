# Generated by Django 2.1.5 on 2019-09-27 18:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_assignleadowners'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignleadowners',
            name='property',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assign_lead_owner', to='api.Property'),
        ),
    ]
