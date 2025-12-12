# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from .. import schemas, crud, models
from ..database import get_db
from ..auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_in.password)
    new_user = crud.create_user(db, user_in, hashed_password)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, login_data.email)
    if not user:
        # Explicit message requested: prompt to register first
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/department-peers")
def get_department_peers(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    If current_user.role == 'admin' -> return grouped users by department
    Else -> return list of users in same department (excluding current user)
    """
    if current_user.role == "admin":
        grouped = crud.get_users_grouped_by_department(db)
        # Convert to serializable dict of lists of UserOut like objects
        result = {}
        for dept, users in grouped.items():
            result[dept] = [{
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "department": u.department,
                "role": u.role,
                "joined_at": u.joined_at
            } for u in users]
        return {"grouped": result}
    else:
        peers = crud.get_users_by_department(db, current_user.department)
        # exclude the current user
        peers = [u for u in peers if u.id != current_user.id]
        return {"peers": [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": u.department,
            "role": u.role,
            "joined_at": u.joined_at
        } for u in peers]}
