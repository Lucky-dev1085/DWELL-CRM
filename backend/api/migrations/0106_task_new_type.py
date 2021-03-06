# Generated by Django 2.2.11 on 2020-04-19 16:55

from django.db import migrations, models
from difflib import get_close_matches


def migrate_existing_task_titles(apps, schema_editor):
    Task = apps.get_model('api', 'Task')
    task_choices = {'First Follow-up': 'FIRST_FOLLOWUP', 'Second Follow-up': 'SECOND_FOLLOWUP', 'Third Follow-up': 'THIRD_FOLLOWUP',
                    'Final Follow-up': 'FINAL_FOLLOWUP', 'Future Date Follow-up': 'FUTURE_DATE_FOLLOWUP',
                    'Check for Application': 'CHECK_APP', 'Check for Documents': 'CHECK_DOCS',
                    'Send New Price/Availability': 'PRICE_AVAILABILITY', 'Schedule Tour': 'TOUR',
                    'Schedule Virtual Tour': 'VIRTUAL_TOUR', }
    task_type = task_choices.keys()
    for task in Task.objects.exclude(title=None):
        match = get_close_matches(task.title, task_type, n=1)
        if len(match) > 0:
            task.new_type = task_choices[match[0]]
            task.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0105_update_activity_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='new_type',
            field=models.CharField(
                choices=[('FIRST_FOLLOWUP', 'First Follow-up'), ('SECOND_FOLLOWUP', 'Second Follow-up'),
                         ('THIRD_FOLLOWUP', 'Third Follow-up'), ('FINAL_FOLLOWUP', 'Final Follow-up'),
                         ('FUTURE_DATE_FOLLOWUP', 'Future Date Follow-up'), ('CHECK_APP', 'Check for Application'),
                         ('CHECK_DOCS', 'Check for Documents'), ('PRICE_AVAILABILITY', 'Send New Price/Availability'),
                         ('TOUR', 'Schedule Tour'), ('VIRTUAL_TOUR', 'Schedule Virtual Tour')],
                default='FIRST_FOLLOWUP', max_length=32),
        ),
        migrations.RunPython(migrate_existing_task_titles),
    ]