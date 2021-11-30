# Generated by Django 2.2.11 on 2020-09-11 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0149_migrate_lead_columns'),
    ]

    operations = [
        migrations.CreateModel(
            name='Holiday',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('date', models.DateField(blank=True, null=True)),
                ('name', models.CharField(blank=True, max_length=255)),
                ('country', models.CharField(blank=True, max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='historicalproperty',
            name='country',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name='property',
            name='country',
            field=models.CharField(blank=True, max_length=128),
        ),
    ]