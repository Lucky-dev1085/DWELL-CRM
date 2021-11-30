# Generated by Django 2.2.10 on 2020-03-31 08:10

from django.db import migrations, models


def migrate_advanced_reports_access(apps, *args, **kwargs):
    User = apps.get_model('api', 'User')
    for user in User.objects.all():
        user.has_advanced_reports_access = user.role in ['LIFT_LYTICS_ADMIN', 'CUSTOMER_ADMIN']
        user.save()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0097_auto_20200330_1805'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='has_advanced_reports_access',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(migrate_advanced_reports_access),
    ]
