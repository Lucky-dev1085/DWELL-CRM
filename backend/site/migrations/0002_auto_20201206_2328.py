# Generated by Django 2.2.13 on 2020-12-06 23:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='promotion',
            name='name',
            field=models.CharField(max_length=64),
        ),
    ]
