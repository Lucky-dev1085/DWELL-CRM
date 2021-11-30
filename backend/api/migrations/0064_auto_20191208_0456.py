# Generated by Django 2.1.5 on 2019-12-07 21:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0063_roommate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Column',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('position', models.IntegerField()),
                ('is_visible', models.BooleanField(default=True)),
                ('property', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='column', to='api.Property')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='column',
            unique_together={('property', 'name')},
        ),
    ]
