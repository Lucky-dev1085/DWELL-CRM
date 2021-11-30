# Generated by Django 2.1.5 on 2019-11-13 14:43

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0053_property_is_email_blast_disabled'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='leadsfilter',
            name='is_display',
        ),
        migrations.AddField(
            model_name='leadsfilter',
            name='filter_type',
            field=models.CharField(choices=[('ALL', 'All'), ('ANY', 'Any')], default='ALL', max_length=32),
        ),
        migrations.AddField(
            model_name='leadsfilteritem',
            name='compare_operator',
            field=models.CharField(choices=[('IS', 'Is'), ('IS_NOT', 'Is not'), ('STARTS_WITH', 'Starts with'), ('ENDS_WITH', 'Ends with'), ('IS_BETWEEN', 'Is between'), ('IS_LESS_THAN', 'Is less than'), ('IS_GREATER_THAN', 'Is greater than'), ('IS_NOT_SET', 'Is not set'), ('IS_ON_OR_BEFORE', 'Is on or before'), ('IS_ON_OR_AFTER', 'Is on or after'), ('IS_ONE_OF', 'Is one of'), ('IS_ON', 'Is on')], default='IS_ON', max_length=32),
        ),
        migrations.RenameField(
            model_name='leadsfilteritem',
            old_name='compare_value',
            new_name='compare_value_tmp',
        ),
    ]
