# Generated by Django 2.2.13 on 2020-11-30 14:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0173_auto_20201127_1406'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='chatprospect',
            options={'ordering': ('created',)},
        ),
        migrations.AddField(
            model_name='chatprospect',
            name='number',
            field=models.IntegerField(null=True),
        ),
    ]
