# Generated by Django 2.1.5 on 2019-10-31 08:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0048_emailtemplate_subject_variables'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emaillabel',
            name='name',
            field=models.CharField(max_length=128),
        ),
    ]
