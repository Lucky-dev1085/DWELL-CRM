# Generated by Django 2.1.5 on 2020-03-02 14:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0077_auto_20200228_0355'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='ping_dom_integrated',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='ping_dom_integrated',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='property',
            name='ping_dom_integrated',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='ping_dom_integrated',
            field=models.BooleanField(default=False),
        ),
    ]
