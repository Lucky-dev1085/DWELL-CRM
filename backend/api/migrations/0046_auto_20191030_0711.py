# Generated by Django 2.1.5 on 2019-10-30 07:11

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0045_user_is_team_account'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailLabel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.CharField(max_length=64)),
                ('name', models.CharField(max_length=32)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='EmailMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('nylas_message_id', models.CharField(max_length=255, unique=True)),
                ('subject', models.CharField(blank=True, max_length=255)),
                ('sender_name', models.CharField(blank=True, max_length=255)),
                ('sender_email', models.CharField(blank=True, max_length=255)),
                ('receiver_name', models.CharField(blank=True, max_length=255)),
                ('receiver_email', models.CharField(blank=True, max_length=255)),
                ('snippet', models.CharField(blank=True, max_length=255)),
                ('body', models.TextField(blank=True, null=True)),
                ('date', models.DateTimeField(blank=True, null=True)),
                ('is_unread', models.BooleanField(default=True)),
                ('is_replied_to', models.BooleanField(default=False)),
                ('is_archived', models.BooleanField(default=False)),
                ('cc', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=255), blank=True, null=True, size=None)),
                ('labels', models.ManyToManyField(related_name='email_messages', to='api.EmailLabel')),
                ('lead', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='email_messages', to='api.Lead')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_access_token',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_account_id',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_status',
            field=models.CharField(blank=True, choices=[('READY_TO_CONNECT', 'Ready to connect'), ('CONNECTED', 'Connected'), ('DISCONNECTED', 'Disconnected')], max_length=16),
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_sync_option',
            field=models.CharField(choices=[('SYNC_ALL', 'Sync all'), ('SYNC_LABELED', 'Sync labeled')], default='SYNC_ALL', max_length=16),
        ),
        migrations.AlterField(
            model_name='emailtemplate',
            name='text',
            field=models.TextField(blank=True, max_length=8192, null=True),
        ),
        migrations.AddField(
            model_name='emailmessage',
            name='property',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='email_messages', to='api.Property'),
        ),
        migrations.AddField(
            model_name='emaillabel',
            name='property',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='email_labels', to='api.Property'),
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_selected_labels',
            field=models.ManyToManyField(blank=True, null=True, related_name='properties', to='api.EmailLabel'),
        ),
    ]