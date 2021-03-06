# Generated by Django 2.2.13 on 2021-01-22 07:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0193_companypolices'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='historicalproperty',
            name='is_calls_scored_today',
        ),
        migrations.RemoveField(
            model_name='property',
            name='is_calls_scored_today',
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='is_call_rescore_required_today',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='property',
            name='is_call_rescore_required_today',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='scoredcall',
            name='prev_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='scoredcall',
            name='rescore_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='scoredcall',
            name='rescore_status',
            field=models.CharField(choices=[('NOT_REQUIRED', 'Not required'), ('REQUIRED', 'Required'), ('RESCORED', 'Rescored')], default='NOT_REQUIRED', max_length=32),
        ),
        migrations.AddField(
            model_name='scoredcall',
            name='scored_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
