# Generated by Django 2.2.13 on 2021-01-13 06:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import simple_history.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0189_auto_20210111_1521'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricalUser',
            fields=[
                ('id', models.IntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('first_name', models.CharField(blank=True, max_length=30, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('created', models.DateTimeField(blank=True, editable=False)),
                ('updated', models.DateTimeField(blank=True, editable=False)),
                ('phone_number', models.CharField(blank=True, max_length=32)),
                ('role', models.CharField(choices=[('LIFT_LYTICS_ADMIN', 'Dwell Admin'), ('GENERIC_ADMIN', 'Property Agent'), ('CUSTOMER_ADMIN', 'Corporate'), ('PROPERTY_ADMIN', 'Property Manager')], max_length=32)),
                ('login_count', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('INACTIVE', 'Inactive')], max_length=16)),
                ('is_password_changed', models.BooleanField(default=False)),
                ('email', models.EmailField(db_index=True, max_length=254, verbose_name='email address')),
                ('username', models.CharField(blank=True, max_length=150)),
                ('is_super_customer', models.BooleanField(default=False)),
                ('last_activity', models.DateTimeField(blank=True, null=True)),
                ('avatar', models.TextField(blank=True, max_length=100, null=True)),
                ('is_team_account', models.BooleanField(default=True)),
                ('ping_dom_integrated', models.BooleanField(default=False)),
                ('has_advanced_reports_access', models.BooleanField(default=False)),
                ('is_property_account', models.BooleanField(default=False)),
                ('is_call_scorer', models.BooleanField(default=False)),
                ('is_available', models.BooleanField(default=False)),
                ('disable_notification', models.BooleanField(default=False)),
                ('has_access_to_up_platform', models.BooleanField(default=False)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField()),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('customer', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Customer')),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('last_login_property', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Property')),
                ('partly_owned_property', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Property')),
            ],
            options={
                'verbose_name': 'historical user',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': 'history_date',
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
