# Generated by Django 2.1.5 on 2020-03-09 20:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0084_auto_20200309_0126'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='lead',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='api.Lead'),
        ),
        migrations.AlterField(
            model_name='note',
            name='lead',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='api.Lead'),
        ),
        migrations.AlterField(
            model_name='roommate',
            name='lead',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='roommates', to='api.Lead'),
        ),
    ]
