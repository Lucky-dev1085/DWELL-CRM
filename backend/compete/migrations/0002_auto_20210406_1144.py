# Generated by Django 2.2.13 on 2021-04-06 11:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compete', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='property',
            name='concession_description',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]