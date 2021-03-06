# Generated by Django 2.2.13 on 2020-12-06 14:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0180_auto_20201205_0756'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlatformSwitchActivity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('destination', models.CharField(choices=[('DWELL_V1', 'Dwell V1'), ('DWELL_V2', 'Dwell V2')], default='DWELL_V1', max_length=16)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='platform_switch_activities', to='api.Property')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='platform_switch_activities', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
