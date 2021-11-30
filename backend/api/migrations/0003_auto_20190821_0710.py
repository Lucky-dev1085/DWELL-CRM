# Generated by Django 2.1.5 on 2019-08-21 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20190820_2257'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='status',
            field=models.CharField(choices=[('ACTIVE', 'Active'),
                                            ('INACTIVE', 'Inactive')],
                                   default='INACTIVE',
                                   max_length=16),
        ),
        migrations.AlterField(
            model_name='user',
            name='clients',
            field=models.ManyToManyField(blank=True,
                                         null=True,
                                         related_name='users',
                                         to='api.Client'),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(blank=True, max_length=150),
        ),
    ]