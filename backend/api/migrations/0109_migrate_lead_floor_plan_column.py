# Generated by Django 2.1.5 on 2020-03-26 07:56

from django.db import migrations
from django.db.models import F


def migrate_lead_columns(apps, *args, **kwargs):
    Column = apps.get_model('api', 'Column')
    Property = apps.get_model('api', 'Property')
    for property in Property.objects.all():
        source_column = Column.objects.filter(property=property, name='source').first()
        if not source_column:
            continue
        source_position = source_column.position
        Column.objects.filter(property=property, position__gt=source_position).update(position=F('position') + 1)
        Column.objects.create(name='floor_plan', position=source_position + 1, property=property)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0108_auto_20200421_1214'),
    ]

    operations = [
        migrations.RunPython(migrate_lead_columns),
    ]
