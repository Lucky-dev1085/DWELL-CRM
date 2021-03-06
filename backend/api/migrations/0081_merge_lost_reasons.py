# Generated by Django 2.1.5 on 2019-11-13 14:43

from django.db import migrations


def migrate_existing_compare_value(apps, *args, **kwargs):
    ProspectLostReason = apps.get_model('api', 'ProspectLostReason')
    Lead = apps.get_model('api', 'Lead')
    external_ids = ProspectLostReason.objects.values_list('external_id', flat=True).distinct()
    for external_id in external_ids:
        reasons = ProspectLostReason.objects.filter(external_id=external_id)
        if reasons.exists():
            first_reason = reasons.first()
            Lead.objects.filter(lost_reason__in=reasons).update(lost_reason=first_reason)
            print('Deleting prospects - %s / %s (total / deleting records)'
                  % (reasons.count(), reasons.exclude(pk=first_reason.pk).count()))
            reasons.exclude(pk=first_reason.pk).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0080_auto_20200305_0320'),
    ]

    operations = [
        migrations.RunPython(migrate_existing_compare_value),
    ]
