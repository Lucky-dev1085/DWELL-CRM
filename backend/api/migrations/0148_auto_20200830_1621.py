# Generated by Django 2.2.11 on 2020-08-30 16:21
import secrets
from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import uuid


def migrate_client_id(apps, schema_editor):
    Property = apps.get_model('api', 'Property')
    for property in Property.objects.all():
        property.client_external_id = secrets.token_hex(16)
        property.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0147_currentresident'),
    ]

    operations = [
        migrations.CreateModel(
            name='Calendar',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.CharField(max_length=64)),
                ('name', models.CharField(max_length=128)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='conversion',
            name='lead',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='leads', to='api.Lead'),
        ),
        migrations.AddField(
            model_name='historicallead',
            name='confirmation_sms_reminder_async_id',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='calendar_sync_option',
            field=models.CharField(choices=[('SYNC_ALL', 'Sync all'), ('SYNC_LABELED', 'Sync labeled')], default='SYNC_ALL', max_length=16),
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='client_external_id',
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='smartrent_group_id',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='tour_types',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('VIRTUAL_TOUR', 'Virtual Tour'), ('GUIDED_VIRTUAL_TOUR', 'Guided Virtual Tour'), ('IN_PERSON', 'In-Person Tour'), ('FACETIME', 'Facetime Tour'), ('SELF_GUIDED_TOUR', 'Self-Guided Tour')], max_length=32), default=['VIRTUAL_TOUR', 'GUIDED_VIRTUAL_TOUR', 'FACETIME', 'IN_PERSON', 'SELF_GUIDED_TOUR'], size=None),
        ),
        migrations.AddField(
            model_name='lead',
            name='confirmation_sms_reminder_async_id',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='calendar_sync_option',
            field=models.CharField(choices=[('SYNC_ALL', 'Sync all'), ('SYNC_LABELED', 'Sync labeled')], default='SYNC_ALL', max_length=16),
        ),
        migrations.AddField(
            model_name='property',
            name='client_external_id',
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name='property',
            name='smartrent_group_id',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name='property',
            name='tour_types',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('VIRTUAL_TOUR', 'Virtual Tour'), ('GUIDED_VIRTUAL_TOUR', 'Guided Virtual Tour'), ('IN_PERSON', 'In-Person Tour'), ('FACETIME', 'Facetime Tour'), ('SELF_GUIDED_TOUR', 'Self-Guided Tour')], max_length=32), default=['VIRTUAL_TOUR', 'GUIDED_VIRTUAL_TOUR', 'FACETIME', 'IN_PERSON', 'SELF_GUIDED_TOUR'], size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='agent_chat_conversations',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='cancel_tour_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='chat_conversations',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='check_prices_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='facetime_tours',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='facetime_tours_leases',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='guests_created',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='guided_virtual_tours',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='guided_virtual_tours_leases',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='in_person_tours',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='in_person_tours_leases',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='repeat_chat_conversations',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='reschedule_tour_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='schedule_tour_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='tours_scheduled',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='view_photos_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='virtual_tours',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='virtual_tours_leases',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), blank=True, null=True, size=None),
        ),
        migrations.AddField(
            model_name='report',
            name='visitor_chat_engagement',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='task',
            name='is_cancelled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='task',
            name='is_created_through_chat',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='task',
            name='smartrent_id',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_available',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='activity',
            name='type',
            field=models.CharField(choices=[('LEAD_CREATED', 'Lead created'), ('TASK_CREATED', 'Task created'), ('NOTE_CREATED', 'Note created'), ('EMAIL_CREATED', 'Email created'), ('LEAD_UPDATED', 'Lead updated'), ('TASK_COMPLETED', 'Task completed'), ('TOUR_COMPLETED', 'Tour completed'), ('LEAD_UPDATED', 'Lead updated'), ('LEAD_SHARED', 'Lead shared'), ('LEAD_CHAT_HOBBES', 'Chat with Hobbes'), ('SMS_CREATED', 'SMS created')], max_length=16),
        ),
        migrations.AlterField(
            model_name='emailtemplate',
            name='type',
            field=models.CharField(choices=[('TOUR_CONFIRMATION', 'Tour Confirmation'), ('GENERIC', 'Generic'), ('FIRST_FOLLOWUP', 'First Followup'), ('SECOND_FOLLOWUP', 'Second Followup'), ('THIRD_FOLLOWUP', 'Third Followup'), ('FINAL_FOLLOWUP', 'Final Followup'), ('RECEIVED_APPLICATION', 'Received Application'), ('IN_PERSON_TOUR_CONFIRMATION', 'In-Person Tour Confirmation'), ('FACETIME_TOUR_CONFIRMATION', 'Facetime Tour Confirmation'), ('SELF_GUIDED_TOUR_CONFIRMATION', 'Self-Guided Tour Confirmation'), ('GUIDED_VIRTUAL_TOUR_CONFIRMATION', 'Guided Virtual Tour Confirmation')], default='GENERIC', max_length=32),
        ),
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(choices=[('NEW_LEAD', 'New Lead'), ('NEW_TASK', 'New Task'), ('OVERDUE_TASK', 'Overdue Task'), ('TASK_DUE_TODAY', 'Task due today'), ('TEAM_MENTION', 'Team Mention'), ('EMAIL_BLAST_COMPLETED', 'Email blast completed'), ('NEW_CALL', 'New call recording'), ('NEW_SMS', 'New incoming SMS'), ('NEW_PROSPECT', 'New prospect'), ('NEW_AGENT_REQUEST', 'New agent request')], max_length=32),
        ),
        migrations.AlterField(
            model_name='task',
            name='type',
            field=models.CharField(choices=[('FIRST_FOLLOWUP', 'First Follow-up'), ('SECOND_FOLLOWUP', 'Second Follow-up'), ('THIRD_FOLLOWUP', 'Third Follow-up'), ('FINAL_FOLLOWUP', 'Final Follow-up'), ('FUTURE_DATE_FOLLOWUP', 'Future Date Follow-up'), ('CHECK_APP', 'Check for Application'), ('CHECK_DOCS', 'Check for Documents'), ('PRICE_AVAILABILITY', 'Send New Price/Availability'), ('TOUR', 'Schedule Tour'), ('VIRTUAL_TOUR', 'Schedule Virtual Tour'), ('GUIDED_VIRTUAL_TOUR', 'Schedule Guided Virtual Tour'), ('IN_PERSON', 'Schedule In-Person Tour'), ('FACETIME', 'Schedule Facetime Tour'), ('SELF_GUIDED_TOUR', 'Schedule Self-Guided Tour')], default='FIRST_FOLLOWUP', max_length=32),
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.CharField(max_length=255, unique=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('time', models.DateTimeField(blank=True, null=True)),
                ('owner', models.CharField(blank=True, max_length=255)),
                ('participants', django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=[], null=True)),
                ('status', models.CharField(blank=True, max_length=16)),
                ('calendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='api.Calendar')),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='api.Property')),
                ('tour', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event', to='api.Task')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ChatProspect',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('last_visit_page', models.CharField(blank=True, max_length=64, null=True)),
                ('is_archived', models.BooleanField(default=False)),
                ('is_mute', models.BooleanField(default=False)),
                ('is_chat_open', models.BooleanField(default=False)),
                ('is_waiting_agent', models.BooleanField(default=False)),
                ('smartrent_id', models.IntegerField(blank=True, null=True)),
                ('is_in_group', models.BooleanField(default=True)),
                ('conversion', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_prospects', to='api.Conversion')),
                ('guest_card', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_prospects_for_guest', to='api.Lead')),
                ('lead', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_prospects', to='api.Lead')),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chat_prospects', to='api.Property')),
                ('task', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chat_prospects', to='api.Task')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ChatConversation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('external_id', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('type', models.CharField(choices=[('AGENT', 'Agent message'), ('BOT', 'Bot message'), ('PROSPECT', 'Prospect message'), ('JOINED', 'Agent joined'), ('AGENT_REQUEST', 'Agent request'), ('GREETING', 'Greeting message')], default='BOT', max_length=32)),
                ('action', models.CharField(blank=True, choices=[('VIEW_PHOTOS', 'View photos'), ('SCHEDULE_TOUR', 'Schedule a tour'), ('RESCHEDULE_TOUR', 'Reschedule tour / edit tour'), ('CANCEL_TOUR', 'Cancel tour'), ('CHECK_PRICES', 'Check prices / availability'), ('RESIDENT_ACCESS', 'Resident access')], max_length=32, null=True)),
                ('to_agent', models.BooleanField(default=False)),
                ('message', models.TextField(blank=True, null=True)),
                ('is_read', models.BooleanField(default=False)),
                ('is_form_message', models.BooleanField(default=False)),
                ('agent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='conversations', to=settings.AUTH_USER_MODEL)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='conversations', to='api.Property')),
                ('prospect', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='conversations', to='api.ChatProspect')),
            ],
            options={
                'ordering': ('date',),
            },
        ),
        migrations.AddField(
            model_name='calendar',
            name='property',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='calendars', to='api.Property'),
        ),
        migrations.CreateModel(
            name='AgentRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('is_declined', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='agent_requests', to='api.Property')),
                ('prospect', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='agent_requests', to='api.ChatProspect')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='agent_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='property',
            name='nylas_selected_calendars',
            field=models.ManyToManyField(blank=True, null=True, related_name='properties', to='api.Calendar'),
        ),
        migrations.RunPython(migrate_client_id),
    ]
