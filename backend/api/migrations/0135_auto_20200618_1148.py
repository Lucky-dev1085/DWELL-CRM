# Generated by Django 2.2.10 on 2020-06-18 11:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0134_auto_20200617_0948'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='type',
            field=models.CharField(choices=[('LEAD_CREATED', 'Lead created'), ('TASK_CREATED', 'Task created'), ('NOTE_CREATED', 'Note created'), ('EMAIL_CREATED', 'Email created'), ('LEAD_UPDATED', 'Lead updated'), ('TASK_COMPLETED', 'Task completed'), ('TOUR_COMPLETED', 'Tour completed'), ('LEAD_UPDATED', 'Lead updated'), ('LEAD_SHARED', 'Lead shared')], max_length=16),
        ),
    ]
