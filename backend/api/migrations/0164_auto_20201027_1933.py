# Generated by Django 2.2.13 on 2020-10-28 02:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0163_unit_not_used_for_marketing'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ilsemail',
            name='lead',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ils_emails', to='api.Lead'),
        ),
    ]
