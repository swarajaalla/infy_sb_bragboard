from passlib.context import CryptContext
from jose import jwt
import os
from datetime import datetime, timedelta, timezone
import bcrypt
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app import models


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


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid auth scheme")

    user_id = verify_token(token)
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    print("Authorization header:", authorization)
    print("Decoded user_id:", user_id)

    return user
