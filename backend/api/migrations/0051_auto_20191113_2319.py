# Generated by Django 2.1.5 on 2019-11-13 16:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0050_auto_20191107_0029'),
    ]

    operations = [
        migrations.AlterField(
            model_name='conversion',
            name='email',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='conversion',
            name='first_name',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='conversion',
            name='last_name',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='conversion',
            name='phone_number',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='conversion',
            name='type',
            field=models.CharField(choices=[('APPLY_NOW', 'Apply Now'), ('SCHEDULE_A_TOUR', 'Schedule a tour'), ('CONTACT_US', 'Contact Us'), ('JOIN_WAITLIST', 'Join Waitlist'), ('PHONE_CALL', 'Phone Call')], max_length=16),
        ),
    ]