# Generated by Django 2.2.13 on 2021-03-31 04:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0212_auto_20210324_0945'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(choices=[('NEW_LEAD', 'New Lead'), ('NEW_TASK', 'New Task'), ('OVERDUE_TASK', 'Overdue Task'), ('TASK_DUE_TODAY', 'Task due today'), ('TEAM_MENTION', 'Team Mention'), ('EMAIL_BLAST_COMPLETED', 'Email blast completed'), ('NEW_CALL', 'New call recording'), ('NEW_SMS', 'New incoming SMS'), ('NEW_AGENT_REQUEST', 'New agent request'), ('BENCHMARK_ALERT', 'Benchmark Alert'), ('THRESHOLD_ALERT', 'Threshold Alert')], max_length=32),
        ),
    ]