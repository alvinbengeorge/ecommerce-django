import jwt
import datetime
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from .models import StoreUser

# Hardcoded secret since we removed SIMPLE_JWT settings
JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_LIFETIME = datetime.timedelta(minutes=60)

def hash_pass(password):
    return make_password(password)

def verify_pass(plain, hashed):
    return check_password(plain, hashed)

def create_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'tenant_id': user.tenant.id if user.tenant else None,
        'exp': datetime.datetime.utcnow() + ACCESS_TOKEN_LIFETIME,
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def get_user_from_token(token):
    payload = decode_token(token)
    if not payload:
        return None
    try:
        return StoreUser.objects.get(id=payload['user_id'])
    except StoreUser.DoesNotExist:
        return None
