import os
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Any
from jose import jwt

from ..database import Settings

# PBKDF2 settings
_PBKDF2_ITER = 100_000
_SALT_SIZE = 16

settings = Settings()


def get_password_hash(password: str) -> str:
    pw = str(password).encode("utf-8")
    salt = os.urandom(_SALT_SIZE)
    dk = hashlib.pbkdf2_hmac("sha256", pw, salt, _PBKDF2_ITER)
    return base64.b64encode(salt + dk).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        raw = base64.b64decode(hashed_password.encode("utf-8"))
        salt = raw[:_SALT_SIZE]
        dk = raw[_SALT_SIZE:]
        new_dk = hashlib.pbkdf2_hmac("sha256", str(plain_password).encode("utf-8"), salt, _PBKDF2_ITER)
        return hmac.compare_digest(new_dk, dk)
    except Exception:
        return False


def create_access_token(subject: Any) -> str:
    expires_delta = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", settings.ACCESS_TOKEN_EXPIRE_MINUTES)))
    to_encode = {"sub": str(subject), "exp": datetime.utcnow() + expires_delta}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(subject: Any) -> str:
    expires_delta = timedelta(days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", settings.REFRESH_TOKEN_EXPIRE_DAYS)))
    to_encode = {"sub": str(subject), "exp": datetime.utcnow() + expires_delta}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
