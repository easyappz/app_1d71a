from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import Member
from api.tokens import Token


class TokenAuthentication(BaseAuthentication):
    """
    Custom token-based authentication.
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Token ". For example:
        Authorization: Token 401f7ac837da42b97f613d789819ff93537bee6a
    """

    keyword = 'Token'

    def authenticate(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth:
            return None

        parts = auth.split()

        if len(parts) == 0:
            return None

        if parts[0].lower() != self.keyword.lower():
            return None

        if len(parts) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(parts) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        try:
            token_key = parts[1]
        except UnicodeError:
            raise AuthenticationFailed('Invalid token header. Token string should not contain invalid characters.')

        return self.authenticate_credentials(token_key)

    def authenticate_credentials(self, key):
        try:
            token = Token.objects.select_related('user').get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        if not token.user:
            raise AuthenticationFailed('Token has no associated user.')

        return (token.user, token)

    def authenticate_header(self, request):
        return self.keyword
