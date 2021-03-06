# Generated by Django 2.2.10 on 2020-04-02 23:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0101_auto_20200402_1228'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='resman_sync_condition_lack_reason',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='resman_sync_status',
            field=models.CharField(blank=True, choices=[('SUCCESS', 'Success'), ('FAILURE', 'Failure'), ('NOT_STARTED', 'Not Started'), ('LACK_CONDITION', 'Lack Condition'), ('SYNCING', 'Syncing')], default='NOT_STARTED', max_length=16, null=True),
        ),
        migrations.CreateModel(
            name='ResManEmployee',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.CharField(blank=True, max_length=150)),
                ('name', models.CharField(blank=True, max_length=150)),
                ('external_id', models.CharField(blank=True, max_length=128, null=True)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='resman_employees', to='api.Property')),
            ],
        ),
    ]
