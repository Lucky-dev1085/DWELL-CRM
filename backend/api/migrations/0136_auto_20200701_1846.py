# Generated by Django 2.2.11 on 2020-07-02 00:46

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import simple_history.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0135_auto_20200618_1148'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='activity',
            options={'verbose_name_plural': 'Activities'},
        ),
        migrations.AlterModelOptions(
            name='assignleadowners',
            options={'verbose_name_plural': 'Assign lead owners'},
        ),
        migrations.AlterModelOptions(
            name='businesshours',
            options={'verbose_name_plural': 'Business hours'},
        ),
        migrations.AlterModelOptions(
            name='property',
            options={'verbose_name_plural': 'Properties'},
        ),
        migrations.AlterModelOptions(
            name='resmanemployee',
            options={'verbose_name_plural': 'Resman employees'},
        ),
        migrations.CreateModel(
            name='HistoricalLead',
            fields=[
                ('id', models.IntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('created', models.DateTimeField(blank=True, editable=False)),
                ('updated', models.DateTimeField(blank=True, editable=False)),
                ('first_name', models.CharField(max_length=64)),
                ('last_name', models.CharField(max_length=64)),
                ('email', models.EmailField(blank=True, max_length=64, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=32, null=True, validators=[django.core.validators.RegexValidator('\\d+')])),
                ('origin', models.CharField(blank=True, choices=[('WEB', 'Web'), ('MOBILE', 'Mobile'), ('PHONE', 'Phone'), ('WALK_IN', 'Walk In'), ('UNKNOWN', 'Unknown')], max_length=32, null=True)),
                ('move_in_date', models.DateField(blank=True, null=True)),
                ('desired_rent', models.FloatField(blank=True, null=True)),
                ('lease_term', models.IntegerField(blank=True, null=True)),
                ('moving_reason', models.CharField(blank=True, choices=[('EMPLOYMENT', 'Employment'), ('FAMILY', 'Family'), ('OTHER', 'Other')], max_length=32, null=True)),
                ('best_contact_method', models.CharField(blank=True, choices=[('EMAIL', 'Email'), ('PHONE', 'Phone'), ('TEXT', 'Text')], max_length=32, null=True)),
                ('best_contact_time', models.CharField(blank=True, choices=[('MORNING', 'Morning'), ('AFTERNOON', 'Afternoon'), ('EVENING', 'Evening')], max_length=32, null=True)),
                ('occupants', models.IntegerField(blank=True, null=True)),
                ('beds', models.IntegerField(blank=True, null=True)),
                ('baths', models.IntegerField(blank=True, null=True)),
                ('pets', models.IntegerField(blank=True, null=True)),
                ('pet_type', models.CharField(blank=True, choices=[('DOG', 'Dog'), ('CAT', 'Cat'), ('BIRD', 'Bird')], max_length=16, null=True)),
                ('vehicles', models.IntegerField(blank=True, null=True)),
                ('washer_dryer_method', models.CharField(blank=True, choices=[('IN_UNIT', 'In Unit'), ('HOOK_UP_ONLY', 'Hook up only'), ('ON_PREMISE', 'On premise'), ('NONE', 'None')], max_length=16, null=True)),
                ('stage', models.CharField(blank=True, choices=[('INQUIRY', 'Inquiry'), ('CONTACT_MADE', 'Contact mode'), ('TOUR_SET', 'Tour set'), ('TOUR_COMPLETED', 'Tour completed'), ('WAITLIST', 'Waitlist'), ('APPLICATION_PENDING', 'Application pending'), ('APPLICATION_COMPLETE', 'Application complete')], default='INQUIRY', max_length=32, null=True)),
                ('status', models.CharField(blank=True, choices=[('ACTIVE', 'Active'), ('CLOSED', 'Closed'), ('LOST', 'Lost'), ('DELETED', 'Deleted')], default='ACTIVE', max_length=16, null=True)),
                ('resman_sync_date', models.DateTimeField(blank=True, null=True)),
                ('resman_sync_status', models.CharField(blank=True, choices=[('SUCCESS', 'Success'), ('FAILURE', 'Failure'), ('NOT_STARTED', 'Not Started'), ('SYNCING', 'Syncing')], default='NOT_STARTED', max_length=16, null=True)),
                ('resman_sync_condition_lack_reason', models.CharField(blank=True, max_length=64, null=True)),
                ('resman_person_id', models.CharField(blank=True, max_length=64, null=True)),
                ('resman_prospect_id', models.CharField(blank=True, max_length=64, null=True)),
                ('resman_prospect_lost', models.BooleanField(default=False)),
                ('followup_reminder_async_id', models.CharField(blank=True, max_length=64, null=True)),
                ('confirmation_reminder_async_id', models.CharField(blank=True, max_length=64, null=True)),
                ('application_complete_email_sent', models.BooleanField(default=False)),
                ('closed_status_date', models.DateTimeField(blank=True, null=True)),
                ('tour_completed_date', models.DateTimeField(blank=True, null=True)),
                ('lost_status_date', models.DateTimeField(blank=True, null=True)),
                ('last_followup_date', models.DateTimeField(blank=True, null=True)),
                ('last_activity_date', models.DateTimeField(blank=True, null=True)),
                ('last_message', models.TextField(blank=True, null=True)),
                ('last_message_date', models.DateTimeField(blank=True, null=True)),
                ('last_twilio_backup_date', models.DateTimeField(blank=True, null=True)),
                ('last_message_read', models.BooleanField(default=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField()),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('actor', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('last_source', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.ProspectSource')),
                ('lost_reason', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.ProspectLostReason')),
                ('owner', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('property', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Property')),
                ('source', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.ProspectSource')),
                ('source_lead', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Lead')),
            ],
            options={
                'verbose_name': 'historical lead',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': 'history_date',
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
