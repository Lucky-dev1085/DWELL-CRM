from django.db import models
from .base import BaseModel


class Customer(BaseModel):
    logo = models.ImageField(blank=True, upload_to='customerLogo/', null=True)
    customer_name = models.CharField(max_length=30, blank=True, unique=True)

    def __str__(self):
        return self.customer_name


class CompanyPolices(BaseModel):
    SCREENING_PROCESS_TIME_CHOICES = (('24_HOURS', '24 hours'), ('48_HOURS', '48 hours'), ('72_HOURS', '72 hours'),)

    customer = models.OneToOneField(Customer, related_name='company_polices', on_delete=models.CASCADE)
    basic_qualification_requirements = models.TextField(blank=True, null=True)
    accept_section_eight = models.BooleanField(default=False)
    section_eight_disclaimer = models.TextField(blank=True, null=True)
    accept_unemployment_as_income = models.BooleanField(default=True)
    unemployment_income_disclaimer = models.TextField(blank=True, null=True)
    accept_applicant_without_ssn = models.BooleanField(default=True)
    ssn_disclaimer = models.TextField(blank=True, null=True)
    accept_applicant_with_misdemeanors_or_felonies = models.BooleanField(default=True)
    misdemeanor_or_felony_disclaimer = models.TextField(blank=True, null=True)
    is_hard_inquiry_on_credit_report = models.BooleanField(default=True)
    screening_process_time = models.CharField(choices=SCREENING_PROCESS_TIME_CHOICES, max_length=32,
                                              blank=True, null=True)
    is_valet_waste_service_optional = models.BooleanField(default=False)
    is_alley_waste_service_optional = models.BooleanField(default=False)
    application_refund_policy = models.TextField(blank=True, null=True)
    package_policy = models.TextField(blank=True, null=True)
    lease_break_policy = models.TextField(blank=True, null=True)
    transfer_policy = models.TextField(blank=True, null=True)
    about_customer = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.customer.customer_name
