# Generated by Django 2.1.5 on 2020-02-02 19:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0073_auto_20200202_0124'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='unit',
            unique_together={('property', 'unit', 'floor_plan')},
        ),
    ]
