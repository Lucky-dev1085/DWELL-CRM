from datetime import timedelta

import redis
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super(CustomJWTAuthentication, self).get_user(validated_token)
        r = redis.Redis.from_url(settings.LAST_ACTIVITY_REDIS)
        r.set('last_activity-{}'.format(user.id), timezone.now().isoformat(), ex=timedelta(hours=34))
        return user
