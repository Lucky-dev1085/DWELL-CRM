import secrets

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

from .base import BaseModel


class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email__iexact=email)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                user.login_count += 1
                user.last_login = timezone.now()
                user.save(update_fields=['last_login', 'login_count'])
                return user
        return None


class VendorAuth(BaseModel):
    client_id = models.CharField(blank=True, max_length=32)
    secret_key = models.CharField(blank=True, max_length=32)
    source = models.CharField(blank=True, max_length=64)
    partner = models.CharField(blank=True, max_length=64)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.client_id = secrets.token_hex(16)
            self.secret_key = secrets.token_hex(16)
        super(VendorAuth, self).save(*args, **kwargs)
