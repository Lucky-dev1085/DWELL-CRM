# Generated by Django 2.2.11 on 2020-05-24 22:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0115_emailmessage_is_guest_card_email'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='leadsfilteritem',
            unique_together=set(),
        ),
    ]
