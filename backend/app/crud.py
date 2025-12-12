# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional, List, Dict
from collections import defaultdict

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str) -> models.User:
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        department=user.department,
        role=user.role  # accept supplied role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users_by_department(db: Session, department: str) -> List[models.User]:
    return db.query(models.User).filter(models.User.department == department).all()

def get_all_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()

def get_users_grouped_by_department(db: Session):
    users = get_all_users(db)
    grouped = defaultdict(list)
    for u in users:
        grouped[u.department or "Unknown"].append(u)
    return dict(grouped)
