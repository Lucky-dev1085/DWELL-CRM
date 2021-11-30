# Generated by Django 2.2.11 on 2020-04-02 12:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0100_auto_20200402_1842'),
    ]

    operations = [
        migrations.AlterField(
            model_name='survey',
            name='unit_class',
            field=models.CharField(choices=[('STUDIO', 'Studio'), ('ONE_BED', '1 bed'), ('TWO_BED', '2 bed'), ('THREE_BED', '3 bed'), ('ONE_BED_PENTHOUSE', '1 bed Penthouse'), ('TWO_BED_PENTHOUSE', '2 bed Penthouse'), ('THREE_BED_PENTHOUSE', '3 bed Penthouse'), ('FOUR_BED', '4 bed')], default='STUDIO', max_length=32),
        ),
    ]
