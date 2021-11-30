import random

from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from backend.api.models import User


class TokenObtainPairAndProcessXNameView(TokenObtainPairView, JWTAuthentication):

    def post(self, request, *args, **kwargs):

        try:
            user = User.objects.get(email__iexact=request.data.get('email'))
        except User.DoesNotExist:
            return Response(dict(error='Invalid email address.'), status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
        except TokenError as e:
            raise InvalidToken(e.args[0])

        properties = user.properties.filter(user.properties_queryset())

        last_login_property = properties.filter(external_id=request.data.get('last_login_property')).first()
        if not last_login_property:
            last_login_property = random.choice(properties)
        data['last_login_property'] = {
            'name': last_login_property.external_id,
            'domain': last_login_property.domain,
            'platform': last_login_property.platform,
        }
        data['role'] = user.role
        data['is_superuser'] = user.is_superuser
        data.pop('refresh', None)
        return Response(data, status=status.HTTP_200_OK)
