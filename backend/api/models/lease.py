from django.contrib.postgres.fields import ArrayField
from django.db import models
from .base import BaseModel
from .property import Property
from .customer import Customer


class LeaseDocument(BaseModel):
    name = models.CharField(max_length=64)
    property = models.ForeignKey(Property, related_name='lease_documents', on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class LeaseDefault(BaseModel):
    PERCENT = 'PERCENT'
    FIXED = 'FIXED'
    FEE_MODE_CHOICES = ((PERCENT, 'Percent'), (FIXED, 'Fixed'),)
    MONTHLY_RENT_TIMES = 'MONTHLY_RENT_TIMES'
    EARLY_TERMINATION_FEE = tuple(list(FEE_MODE_CHOICES) + [(MONTHLY_RENT_TIMES, 'Monthly rent times')])

    customer = models.ForeignKey(Customer, related_name='lease_defaults', null=True, blank=True, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='lease_defaults', on_delete=models.CASCADE)
    lease_document = models.ForeignKey(
        LeaseDocument, related_name='lease_defaults', on_delete=models.CASCADE, null=True, blank=True
    )
    approved_security_deposit = models.FloatField(blank=True, null=True)
    approved_non_refundable_premium_fee = models.FloatField(blank=True, null=True)
    conditionally_approved_security_deposit = models.FloatField(blank=True, null=True)
    conditionally_approved_non_refundable_premium_fee = models.FloatField(blank=True, null=True)
    pet_rent = models.FloatField(blank=True, null=True)
    pet_fee = models.FloatField(blank=True, null=True)
    pet_deposit = models.FloatField(blank=True, null=True)
    pet_non_refundable_deposit = models.FloatField(blank=True, null=True)
    sales_tax = models.FloatField(blank=True, null=True)
    valet_waste = models.FloatField(blank=True, null=True)
    facilities_fee = models.FloatField(blank=True, null=True)
    non_refundable_administration_fee = models.FloatField(blank=True, null=True)
    application_fee = models.FloatField(blank=True, null=True)
    guarantor_application_fee = models.FloatField(blank=True, null=True)
    corporate_application_fee = models.FloatField(blank=True, null=True)
    document_update_change = models.FloatField(blank=True, null=True)
    replacement_key_fee = models.FloatField(blank=True, null=True)
    month_to_month_fee = models.FloatField(blank=True, null=True)
    month_to_month_fee_mode = models.CharField(choices=FEE_MODE_CHOICES, max_length=32, default=PERCENT)
    early_termination_fee = models.FloatField(blank=True, null=True)
    early_termination_fee_mode = models.CharField(
        choices=EARLY_TERMINATION_FEE, max_length=32, default=MONTHLY_RENT_TIMES
    )
    apartment_transfer_fee = models.FloatField(blank=True, null=True)
    late_charges = models.FloatField(blank=True, null=True)
    late_charges_mode = models.CharField(choices=FEE_MODE_CHOICES, max_length=32, default=PERCENT)
    late_charges_after_days = models.FloatField(blank=True, null=True)
    late_charges_per_day = models.FloatField(blank=True, null=True)
    dishonored_funds_charge = models.FloatField(blank=True, null=True)
    insurance_coverage_minimum = models.FloatField(blank=True, null=True)
    storage_unit_late_fee = models.FloatField(blank=True, null=True)
    storage_unit_late_fee_mode = models.CharField(choices=FEE_MODE_CHOICES, max_length=32, default=PERCENT)
    storage_unit_late_fee_after_days = models.FloatField(blank=True, null=True)
    electric_company_website = models.CharField(max_length=256, blank=True, null=True)
    electric_company_phone_number = models.CharField(max_length=32, blank=True, null=True)
    electric_company_name = models.CharField(max_length=32, blank=True, null=True)
    gas_company_website = models.CharField(max_length=256, blank=True, null=True)
    gas_company_phone_number = models.CharField(max_length=32, blank=True, null=True)
    gas_company_name = models.CharField(max_length=32, blank=True, null=True)
    special_provisions = models.TextField(null=True, blank=True)
    community_manager_name = models.CharField(max_length=64, blank=True, null=True)
    management_office_phone = models.CharField(max_length=32, blank=True, null=True)
    management_office_address = models.CharField(max_length=256, blank=True, null=True)
    is_default_setting = models.BooleanField(default=False)
    no_lease_first_violation_fee = models.FloatField(blank=True, null=True)
    no_lease_subsequent_violation_fee = models.FloatField(blank=True, null=True)
    pet_waste_first_violation_fee = models.FloatField(blank=True, null=True)
    pet_waste_subsequent_violation_fee = models.FloatField(blank=True, null=True)
    trash_left_out_fee = models.FloatField(blank=True, null=True)
    trash_container_replacement_fee = models.FloatField(blank=True, null=True)
    facilities_late_fee = models.FloatField(blank=True, null=True)
    unlock_after_hours_fee = models.FloatField(blank=True, null=True)
    fob_replacement_fee = models.FloatField(blank=True, null=True)
    towing_company_website = models.CharField(max_length=256, blank=True, null=True)
    towing_company_phone_number = models.CharField(max_length=32, blank=True, null=True)
    towing_company_name = models.CharField(max_length=32, blank=True, null=True)
    management_fax_number = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.property.name


class LeaseDefaultSetting(LeaseDefault):
    class Meta:
        proxy = True


class PropertyPolicy(BaseModel):
    PERCENT = 'PERCENT'
    FIXED = 'FIXED'
    FEE_MODE_CHOICES = ((PERCENT, 'Percent'), (FIXED, 'Fixed'),)
    MONTHLY_RENT_TIMES = 'MONTHLY_RENT_TIMES'
    EARLY_TERMINATION_FEE = tuple(list(FEE_MODE_CHOICES) + [(MONTHLY_RENT_TIMES, 'Monthly rent times')])

    UTILITY_CHOICES = (('ELECTRIC', 'electric'), ('WATER', 'water'), ('TRASH', 'trash'), ('GAS', 'gas'),
                       ('SEWER', 'sewer'), ('RENTERS_INSURANCE', 'renters insurance'),
                       ('VALET_TRASH_SERVICE', 'valet trash service'),)

    APARTMENT_HOLD_EXPIRATION_CHOICES = (
        ('MANUAL', 'Manually released'), ('24_HOURS', '24 hours'), ('48_HOURS', '48 hours'),
        ('72_HOURS', '72 hours'), ('WEEK', '1 week'), ('TWO_WEEKS', '2 weeks')
    )

    GUEST_PARKING_TYPE_CHOICES = (
        ('ANY_UNASSIGNED_SPACE', 'In any unassigned space'),
        ('SPACES_MARKED_FOR_GUEST_OR_VISITORS', 'In spaces marked for guest or visitors'),
        ('GUEST_VEHICLE_DISPLAY_GUEST_PASS', 'When the guest vehicle is displaying a guest pass'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('PERSONAL_CHECK', 'Personal Check'),
        ('CASHIER_CHECK', 'Cashier\'s Check'),
        ('ELECTRONIC_CHECK', 'Electronic Check'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('ONLINE_PAYMENT', 'Online Payment'),
        ('MONEY_ORDER', 'Money Order'),
    )
    RESIDENT_PARKING_TYPE_CHOICES = (
        ('COVERED_PARKING', 'Assigned, covered parking'),
        ('UNCOVERED_PARKING', 'Assigned, uncovered parking'),
        ('BOTH_PARKING', 'Assigned, covered and uncovered parking'),
    )

    PEST_CONTROL_SERVICE_DAY_CHOICES = (
        ('MONDAYS', 'mondays'),
        ('TUESDAYS', 'tuesdays'),
        ('WEDNESDAYS', 'wednesdays'),
        ('THURSDAYS', 'thursdays'),
        ('FRIDAYS', 'fridays'),
        ('SATURDAYS', 'saturdays'),
        ('SUNDAYS', 'sundays')
    )

    household_income_times = models.FloatField(blank=True, null=True)
    is_cosigners_allowed = models.BooleanField(default=True)
    utilities = ArrayField(models.CharField(choices=UTILITY_CHOICES, max_length=32), null=True, blank=True)
    acceptable_forms_of_payment = ArrayField(
        models.CharField(choices=PAYMENT_METHOD_CHOICES, max_length=32), null=True, blank=True
    )
    checks_paid_to = models.CharField(max_length=128, null=True, blank=True)
    waitlist_fee = models.FloatField(blank=True, null=True)
    notice_to_vacate_prior_days = models.FloatField(blank=True, null=True)
    notice_to_vacate_month_to_month_days = models.FloatField(blank=True, null=True)
    apartment_hold_expiration = models.CharField(
        choices=APARTMENT_HOLD_EXPIRATION_CHOICES, max_length=32, blank=True, null=True
    )
    guest_parking_is_allowed = models.BooleanField(default=False)

    # Occupancy standards
    max_studio_occupants = models.FloatField(blank=True, null=True)
    max_one_bedroom_occupants = models.FloatField(blank=True, null=True)
    max_two_bedrooms_occupants = models.FloatField(blank=True, null=True)
    max_three_bedrooms_occupants = models.FloatField(blank=True, null=True)

    # Vehicle standards
    max_vehicles_for_studio = models.FloatField(blank=True, null=True)
    max_vehicles_for_one_bedroom = models.FloatField(blank=True, null=True)
    max_vehicles_for_two_bedrooms = models.FloatField(blank=True, null=True)
    max_vehicles_for_three_bedrooms = models.FloatField(blank=True, null=True)

    max_vehicles_for_one_leaseholder = models.FloatField(blank=True, null=True)
    max_vehicles_for_two_leaseholders = models.FloatField(blank=True, null=True)
    max_vehicles_for_three_leaseholders = models.FloatField(blank=True, null=True)
    max_vehicles_for_four_leaseholders = models.FloatField(blank=True, null=True)

    max_vehicles_policy_mode = models.CharField(
        choices=(('UNIT', 'Unit'), ('LEASEHOLDER', 'Leaseholder')), default='UNIT', max_length=16
    )

    # note - If we need to support more pet types, then we should have new model that handles pet policy.
    max_pets_per_unit = models.FloatField(blank=True, null=True)
    max_pets_for_one_leaseholder = models.FloatField(blank=True, null=True)
    max_pets_for_two_leaseholders = models.FloatField(blank=True, null=True)
    max_pets_for_three_leaseholders = models.FloatField(blank=True, null=True)
    max_pets_for_four_leaseholders = models.FloatField(blank=True, null=True)
    max_pets_policy_mode = models.CharField(
        choices=(('UNIT', 'Unit'), ('LEASEHOLDER', 'Leaseholder')), default='UNIT', max_length=16
    )

    # Dogs
    is_dogs_acceptable = models.BooleanField(default=True)
    has_dog_size_limit = models.BooleanField(default=True)
    dog_size_limit = models.FloatField(blank=True, null=True)
    dog_breed_restrictions = models.TextField(blank=True, null=True)

    # Cats
    is_cats_acceptable = models.BooleanField(default=True)
    has_cat_size_limit = models.BooleanField(default=True)
    cat_size_limit = models.FloatField(blank=True, null=True)
    cat_breed_restrictions = models.TextField(blank=True, null=True)

    # Birds
    is_birds_acceptable = models.BooleanField(default=True)
    has_bird_size_limit = models.BooleanField(default=True)
    bird_size_limit = models.FloatField(blank=True, null=True)
    bird_breed_restrictions = models.TextField(blank=True, null=True)

    monthly_utility_bill = models.FloatField(blank=True, null=True)
    requirements_to_hold_unit = models.TextField(blank=True, null=True)

    resident_parking_type = models.CharField(
        choices=RESIDENT_PARKING_TYPE_CHOICES, max_length=64, null=True, blank=True
    )
    apartment_ceiling_height = models.FloatField(blank=True, null=True)
    smoking_allowed = models.BooleanField(default=False)
    smoking_policy_disclaimer = models.TextField(blank=True, null=True)
    club_house_hours_24_hr = models.BooleanField(default=False)
    club_house_hours_start_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    club_house_hours_end_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    fitness_center_hours_24_hr = models.BooleanField(default=False)
    fitness_center_hours_start_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    fitness_center_hours_end_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    pool_hours_24_hr = models.BooleanField(default=False)
    pool_hours_start_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    pool_hours_end_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    community_quiet_hours_24_hr = models.BooleanField(default=False)
    community_quiet_hours_start_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    community_quiet_hours_end_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    moving_hours_24_hr = models.BooleanField(default=False)
    moving_hours_start_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    moving_hours_end_time = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    club_house_alarm_fee = models.FloatField(blank=True, null=True)
    fitness_center_key_deposit = models.FloatField(blank=True, null=True)
    overnight_guest_stay_limit = models.IntegerField(blank=True, null=True)
    pest_control_service_day = models.CharField(choices=PEST_CONTROL_SERVICE_DAY_CHOICES, max_length=20, null=True,
                                                blank=True)
    garage_door_opener_replacement_fee = models.FloatField(blank=True, null=True)
    garage_door_reprogramming_fee = models.FloatField(blank=True, null=True)

    property = models.OneToOneField(Property, related_name='polices', on_delete=models.CASCADE)
    parking_rent = models.FloatField(blank=True, null=True)
    guest_parking_type = models.CharField(choices=GUEST_PARKING_TYPE_CHOICES, max_length=50, blank=True, null=True)
    parking_permit_rent = models.FloatField(blank=True, null=True)
    parking_id_replacement_fee = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.property.name

    class Meta:
        verbose_name_plural = 'Property policies'


class RentableItem(BaseModel):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True, null=True)
    deposit = models.FloatField(blank=True, null=True)
    fee = models.FloatField(blank=True, null=True)
    monthly_rent = models.FloatField(blank=True, null=True)
    property = models.ForeignKey(Property, related_name='rentable_items', on_delete=models.CASCADE)

    def __str__(self):
        return self.property.name


class DurationPricing(BaseModel):
    PERCENT = 'PERCENT'
    FIXED = 'FIXED'
    BASE_RENT_MEASUREMENT = ((PERCENT, 'Percent'), (FIXED, 'Fixed'))

    PLUS = 'PLUS'
    NO_PREMIUM = 'NO_PREMIUM'
    MINUS = 'MINUS'
    BASE_RENT_TYPE = ((PLUS, 'Plus'), (NO_PREMIUM, 'No premium'), (MINUS, 'Minus'))

    DYNAMIC = 'DYNAMIC'
    MANUAL = 'MANUAL'
    PRICING_TERM = ((DYNAMIC, 'Dynamic'), (MANUAL, 'Manual'))

    shortest_lease_term = models.IntegerField(blank=True, null=True)
    longest_lease_term = models.IntegerField(blank=True, null=True)
    is_offer_month_to_month = models.BooleanField(default=True)
    base_rent = models.IntegerField(blank=True, null=True)
    base_rent_type = models.CharField(
        choices=BASE_RENT_TYPE, max_length=32, default=NO_PREMIUM
    )
    base_rent_measurement = models.CharField(
        choices=BASE_RENT_MEASUREMENT, max_length=32, default=FIXED
    )
    pricing_term = models.CharField(
        choices=PRICING_TERM, max_length=32, default=DYNAMIC
    )
    avg_turnover_time = models.IntegerField(blank=True, null=True)
    avg_turnover_costs = models.IntegerField(blank=True, null=True)
    is_offer_discounts = models.BooleanField(default=False)
    term_premiums = models.JSONField(default=list, null=True, blank=True)

    property = models.OneToOneField(Property, related_name='duration_pricing', on_delete=models.CASCADE)

    def __str__(self):
        return self.property.name
