# Generated by Django 2.2.10 on 2020-04-02 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0099_auto_20200401_2303'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leadsfilter',
            name='name',
            field=models.CharField(max_length=64),
        ),
    ]
