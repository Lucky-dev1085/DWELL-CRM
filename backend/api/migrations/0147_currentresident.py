# Generated by Django 2.2.11 on 2020-08-13 01:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0146_auto_20200807_0729'),
    ]

    operations = [
        migrations.CreateModel(
            name='CurrentResident',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=150, null=True)),
                ('last_name', models.CharField(blank=True, max_length=150, null=True)),
                ('mobile_phone', models.CharField(blank=True, max_length=150, null=True)),
                ('home_phone', models.CharField(blank=True, max_length=150, null=True)),
                ('work_phone', models.CharField(blank=True, max_length=150, null=True)),
                ('person_id', models.CharField(blank=True, max_length=128, null=True)),
                ('lease_start_date', models.DateField(blank=True, null=True)),
                ('lease_end_date', models.DateField(blank=True, null=True)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='current_residents', to='api.Property')),
            ],
        ),
    ]