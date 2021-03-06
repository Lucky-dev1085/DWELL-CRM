# Generated by Django 2.2.13 on 2020-11-12 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0167_leasedefault_leasedefaultsetting_leasedocument_propertypolicy_rentableitem'),
    ]

    operations = [
        migrations.RenameField(
            model_name='leasedefault',
            old_name='apartment_key_fee',
            new_name='replacement_key_fee',
        ),
        migrations.RenameField(
            model_name='propertypolicy',
            old_name='max_one_bedroom_vehicles',
            new_name='max_vehicles_for_one_bedroom',
        ),
        migrations.RenameField(
            model_name='propertypolicy',
            old_name='max_studio_vehicles',
            new_name='max_vehicles_for_studio',
        ),
        migrations.RenameField(
            model_name='propertypolicy',
            old_name='max_three_bedrooms_vehicles',
            new_name='max_vehicles_for_three_bedrooms',
        ),
        migrations.RenameField(
            model_name='propertypolicy',
            old_name='max_two_bedrooms_vehicles',
            new_name='max_vehicles_for_two_bedrooms',
        ),
        migrations.RemoveField(
            model_name='propertypolicy',
            name='employee_discount',
        ),
        migrations.RemoveField(
            model_name='propertypolicy',
            name='employee_discount_mode',
        ),
        migrations.RemoveField(
            model_name='propertypolicy',
            name='max_birds_per_bedrooms',
        ),
        migrations.RemoveField(
            model_name='propertypolicy',
            name='max_cats_per_bedrooms',
        ),
        migrations.RemoveField(
            model_name='propertypolicy',
            name='max_dogs_per_bedrooms',
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='has_bird_size_limit',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='has_cat_size_limit',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='has_dog_size_limit',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_for_four_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_for_one_leaseholder',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_for_three_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_for_two_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_per_unit',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_pets_policy_mode',
            field=models.CharField(choices=[('UNIT', 'Unit'), ('LEASEHOLDER', 'Leaseholder')], default='UNIT', max_length=16),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_vehicles_for_four_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_vehicles_for_one_leaseholder',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_vehicles_for_three_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_vehicles_for_two_leaseholders',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='propertypolicy',
            name='max_vehicles_policy_mode',
            field=models.CharField(choices=[('UNIT', 'Unit'), ('LEASEHOLDER', 'Leaseholder')], default='UNIT', max_length=16),
        ),
        migrations.AlterField(
            model_name='propertypolicy',
            name='apartment_hold_expiration',
            field=models.CharField(blank=True, choices=[('MANUAL', 'Manually released'), ('24_HOURS', '24 hours'), ('48_HOURS', '48 hours'), ('72_HOURS', '72 hours'), ('WEEK', '1 week')], max_length=32, null=True),
        ),
    ]
