# Generated by Django 2.1.5 on 2019-09-25 16:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_auto_20190925_0333'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('content', models.CharField(max_length=1024, null=True)),
                ('redirect_url', models.CharField(max_length=128, null=True)),
                ('is_read', models.BooleanField(default=False)),
                ('type', models.CharField(choices=[('NEW_LEAD', 'New Lead'), ('NEW_TASK', 'New Task'), ('OVERDUE_TASK', 'Overdue Task'), ('TASK_DUE_TODAY', 'Task due today'), ('TEAM_MENTION', 'Team Mention')], max_length=16)),
                ('is_display', models.BooleanField(default=True)),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='owner_notifications', to=settings.AUTH_USER_MODEL)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifications', to='api.Property')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
