from passlib.context import CryptContext
from jose import jwt
import os
from datetime import datetime, timedelta, timezone
import bcrypt

# Initialize passlib context but we'll use bcrypt directly
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    # Bcrypt has a 72 byte limit, truncate if necessary
    truncated_password = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(truncated_password, salt)
    return hashed.decode('utf-8')

def verify_password(plain, hashed):
    # Bcrypt has a 72 byte limit, truncate if necessary
    truncated_plain = plain[:72].encode('utf-8')
    return bcrypt.checkpw(truncated_plain, hashed.encode('utf-8'))


ACCESS_SECRET = os.getenv("ACCESS_TOKEN_SECRET")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, ACCESS_SECRET, "HS256")

def verify_token(token: str):
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, ACCESS_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if user_id is None:
            return None
        return user_id
    except:
        return None
