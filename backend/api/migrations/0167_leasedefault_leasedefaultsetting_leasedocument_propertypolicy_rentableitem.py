# Generated by Django 2.2.13 on 2020-11-03 15:12

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0166_scoredcall_omitted_questions'),
    ]

    operations = [
        migrations.CreateModel(
            name='RentableItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=64)),
                ('description', models.TextField(blank=True, null=True)),
                ('deposit', models.FloatField(blank=True, null=True)),
                ('fee', models.FloatField(blank=True, null=True)),
                ('monthly_rent', models.FloatField(blank=True, null=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rentable_items', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PropertyPolicy',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('household_income_times', models.FloatField(blank=True, null=True)),
                ('is_cosigners_allowed', models.BooleanField(default=True)),
                ('is_offer_month_to_month', models.BooleanField(default=True)),
                ('shortest_lease_term', models.IntegerField(blank=True, null=True)),
                ('longest_lease_term', models.IntegerField(blank=True, null=True)),
                ('employee_discount', models.FloatField(blank=True, null=True)),
                ('employee_discount_mode', models.CharField(choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed')], default='PERCENT', max_length=32)),
                ('utilities', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('ELECTRIC', 'electric'), ('WATER', 'water'), ('TRASH', 'trash'), ('GAS', 'gas'), ('SEWER', 'sewer'), ('RENTERS_INSURANCE', 'renters insurance'), ('VALET_TRASH_SERVICE', 'valet trash service')], max_length=32), blank=True, null=True, size=None)),
                ('acceptable_forms_of_payment', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('PERSONAL_CHECK', 'Personal Check'), ('CASHIER_CHECK', "Cashier's Check"), ('ELECTRONIC_CHECK', 'Electronic Check'), ('CREDIT_CARD', 'Credit Card'), ('DEBIT_CARD', 'Debit Card'), ('ONLINE_PAYMENT', 'Online Payment'), ('MONEY_ORDER', 'Money Order')], max_length=32), blank=True, null=True, size=None)),
                ('checks_paid_to', models.CharField(blank=True, max_length=128, null=True)),
                ('waitlist_fee', models.FloatField(blank=True, null=True)),
                ('notice_to_vacate_prior_days', models.IntegerField(blank=True, null=True)),
                ('notice_to_vacate_month_to_month_days', models.IntegerField(blank=True, null=True)),
                ('apartment_hold_expiration', models.CharField(blank=True, choices=[('MANUAL', 'Manually released'), ('24_HOURS', '24 hours'), ('36_HOURS', '36 hours'), ('72_HOURS', '72 hours'), ('WEEK', '1 week')], max_length=32, null=True)),
                ('guest_parking_allowed', models.CharField(blank=True, choices=[('ANY_UNASSIGNED_SPACE', 'Yes, in any unassigned space'), ('SPACES_MARKED_FOR_GUEST_OR_VISITORS', 'Yes, in spaces marked for guest or visitors'), ('GUEST_VEHICLE_DISPLAY_GUEST_PASS', 'Yes, when the guest vehicle is displaying a guest pass'), ('NO', 'No')], max_length=64, null=True)),
                ('max_studio_occupants', models.IntegerField(blank=True, null=True)),
                ('max_one_bedroom_occupants', models.IntegerField(blank=True, null=True)),
                ('max_two_bedrooms_occupants', models.IntegerField(blank=True, null=True)),
                ('max_three_bedrooms_occupants', models.IntegerField(blank=True, null=True)),
                ('max_studio_vehicles', models.IntegerField(blank=True, null=True)),
                ('max_one_bedroom_vehicles', models.IntegerField(blank=True, null=True)),
                ('max_two_bedrooms_vehicles', models.IntegerField(blank=True, null=True)),
                ('max_three_bedrooms_vehicles', models.IntegerField(blank=True, null=True)),
                ('is_dogs_acceptable', models.BooleanField(default=True)),
                ('dog_size_limit', models.FloatField(blank=True, null=True)),
                ('dog_breed_restrictions', models.TextField(blank=True, null=True)),
                ('max_dogs_per_bedrooms', models.IntegerField(blank=True, null=True)),
                ('is_cats_acceptable', models.BooleanField(default=True)),
                ('cat_size_limit', models.FloatField(blank=True, null=True)),
                ('cat_breed_restrictions', models.TextField(blank=True, null=True)),
                ('max_cats_per_bedrooms', models.IntegerField(blank=True, null=True)),
                ('is_birds_acceptable', models.BooleanField(default=True)),
                ('bird_size_limit', models.FloatField(blank=True, null=True)),
                ('bird_breed_restrictions', models.TextField(blank=True, null=True)),
                ('max_birds_per_bedrooms', models.IntegerField(blank=True, null=True)),
                ('property', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='polices', to='api.Property')),
            ],
            options={
                'verbose_name_plural': 'Property policies',
            },
        ),
        migrations.CreateModel(
            name='LeaseDocument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=64)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lease_documents', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LeaseDefault',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('approved_security_deposit', models.FloatField(blank=True, null=True)),
                ('approved_non_refundable_premium_fee', models.FloatField(blank=True, null=True)),
                ('conditionally_approved_security_deposit', models.FloatField(blank=True, null=True)),
                ('conditionally_approved_non_refundable_premium_fee', models.FloatField(blank=True, null=True)),
                ('pet_rent', models.FloatField(blank=True, null=True)),
                ('parking_rent', models.FloatField(blank=True, null=True)),
                ('pet_fee', models.FloatField(blank=True, null=True)),
                ('pet_deposit', models.FloatField(blank=True, null=True)),
                ('sales_tax', models.FloatField(blank=True, null=True)),
                ('valet_waste', models.FloatField(blank=True, null=True)),
                ('facilities_fee', models.FloatField(blank=True, null=True)),
                ('non_refundable_administration_fee', models.FloatField(blank=True, null=True)),
                ('application_fee', models.FloatField(blank=True, null=True)),
                ('guarantor_application_fee', models.FloatField(blank=True, null=True)),
                ('corporate_application_fee', models.FloatField(blank=True, null=True)),
                ('apartment_key_fee', models.FloatField(blank=True, null=True)),
                ('month_to_month_fee', models.FloatField(blank=True, null=True)),
                ('month_to_month_fee_mode', models.CharField(choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed')], default='PERCENT', max_length=32)),
                ('early_termination_fee', models.FloatField(blank=True, null=True)),
                ('early_termination_fee_mode', models.CharField(choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed'), ('MONTHLY_RENT_TIMES', 'Monthly rent times')], default='MONTHLY_RENT_TIMES', max_length=32)),
                ('apartment_transfer_fee', models.FloatField(blank=True, null=True)),
                ('late_charges', models.FloatField(blank=True, null=True)),
                ('late_charges_mode', models.CharField(choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed')], default='PERCENT', max_length=32)),
                ('late_charges_after_days', models.IntegerField(blank=True, null=True)),
                ('late_charges_per_day', models.FloatField(blank=True, null=True)),
                ('dishonored_funds_charge', models.FloatField(blank=True, null=True)),
                ('insurance_coverage_minimum', models.FloatField(blank=True, null=True)),
                ('storage_unit_late_fee', models.FloatField(blank=True, null=True)),
                ('storage_unit_late_fee_mode', models.CharField(choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed')], default='PERCENT', max_length=32)),
                ('storage_unit_late_fee_after_days', models.IntegerField(blank=True, null=True)),
                ('special_provisions', models.TextField(blank=True, null=True)),
                ('community_manager_name', models.CharField(blank=True, max_length=64, null=True)),
                ('management_office_phone', models.CharField(blank=True, max_length=32, null=True)),
                ('management_office_address', models.CharField(blank=True, max_length=256, null=True)),
                ('is_default_setting', models.BooleanField(default=False)),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='lease_defaults', to='api.Customer')),
                ('lease_document', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='lease_defaults', to='api.LeaseDocument')),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lease_defaults', to='api.Property')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LeaseDefaultSetting',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('api.leasedefault',),
        ),
    ]
