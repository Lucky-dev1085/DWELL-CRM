# Generated by Django 2.2.19 on 2021-07-07 16:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0228_auto_20210628_0814'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicallead',
            name='vendor',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.VendorAuth'),
        ),
        migrations.AddField(
            model_name='lead',
            name='vendor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='leads', to='api.VendorAuth'),
        ),
        migrations.AddField(
            model_name='task',
            name='vendor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='api.VendorAuth'),
        ),
    ]