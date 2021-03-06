# Generated by Django 2.1.5 on 2019-09-11 03:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_auto_20190909_1436'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='unit',
        ),
        migrations.AddField(
            model_name='task',
            name='property',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='api.Property'),
        ),
        migrations.AddField(
            model_name='task',
            name='units',
            field=models.ManyToManyField(blank=True, null=True, related_name='tours', to='api.Unit'),
        ),
        migrations.AlterField(
            model_name='task',
            name='description',
            field=models.CharField(blank=True, max_length=1024, null=True),
        ),
    ]
