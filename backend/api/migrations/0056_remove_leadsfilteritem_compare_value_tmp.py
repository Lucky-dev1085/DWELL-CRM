# Generated by Django 2.1.5 on 2019-11-13 18:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0055_add_compare_value_array_field'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='leadsfilteritem',
            name='compare_value_tmp',
        ),
    ]
