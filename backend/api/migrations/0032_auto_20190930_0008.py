# Generated by Django 2.1.5 on 2019-09-29 17:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('api', '0031_auto_20190928_0124'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notification',
            name='redirect_url',
        ),
        migrations.AddField(
            model_name='notification',
            name='object_content_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='notification_object', to='contenttypes.ContentType'),
        ),
        migrations.AddField(
            model_name='notification',
            name='object_id',
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
    ]
