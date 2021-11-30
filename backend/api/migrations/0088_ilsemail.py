# Generated by Django 2.2.10 on 2020-03-24 23:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0087_user_partly_owned_property'),
    ]

    operations = [
        migrations.CreateModel(
            name='ILSEmail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('email', models.CharField(blank=True, max_length=64, null=True)),
                ('body', models.TextField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
