# Generated by Django 2.2.11 on 2020-04-12 12:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0103_auto_20200403_0716'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(choices=[('NEW_LEAD', 'New Lead'), ('NEW_TASK', 'New Task'), ('OVERDUE_TASK', 'Overdue Task'), ('TASK_DUE_TODAY', 'Task due today'), ('TEAM_MENTION', 'Team Mention'), ('EMAIL_BLAST_COMPLETED', 'Email blast completed'), ('NEW_CALL', 'New call recording')], max_length=32),
        ),
    ]
