# Generated by Django 2.1.5 on 2020-01-16 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0069_report'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='date',
            field=models.DateField(),
        ),
        migrations.AlterUniqueTogether(
            name='report',
            unique_together={('date', 'property')},
        ),
    ]
