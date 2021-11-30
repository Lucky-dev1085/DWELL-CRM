from django.db import migrations


def migrate_clients_properties_access(apps, schema_editor):
    Customer = apps.get_model('api', 'Customer')
    for customer in Customer.objects.all():
        clients = customer.clients.all()
        properties = customer.properties.all()
        clients.update(customer=customer)
        properties.update(customer=customer)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0170_auto_20201127_0155'),
    ]

    operations = [
        migrations.RunPython(migrate_clients_properties_access),
    ]
