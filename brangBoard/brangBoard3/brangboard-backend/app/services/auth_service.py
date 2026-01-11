from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, name: str, email: str, password: str, department: str):
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        department=department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def generate_token(user: User):
    return create_access_token({"sub": user.email})

