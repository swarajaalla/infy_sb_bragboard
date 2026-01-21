from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from typing import List
from app.schemas.user import UserResponse

from sqlalchemy import func, desc
from app.models.shoutout import ShoutOut
from app.models.reactions import Reaction

from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.dependencies import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(prefix="/users", tags=["Users"])


# ------------------ DATABASE DEPENDENCY ------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------ REGISTER USER ------------------
@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="employee",
        department=user.department   # ✅ NEW
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ------------------ LOGIN USER (OAuth2) ------------------
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.email == form_data.username,
            User.is_active == True
        )
        .first()
    )

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ------------------ CURRENT LOGGED-IN USER ------------------
@router.get("/me", response_model=UserResponse)
def read_logged_in_user(
    current_user: User = Depends(get_current_user)
):
    return current_user

# ------------------ GET ALL USERS EXCEPT CURRENT ------------------

@router.get("/all", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(User)
        .filter(
            User.id != current_user.id,
            User.is_active == True
        )
        .all()
    )

# ------------------ USER STATS ------------------
@router.get("/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sent_count = db.query(func.count(ShoutOut.id)) \
        .filter(ShoutOut.from_user_id == current_user.id) \
        .scalar()

    received_count = db.query(func.count(ShoutOut.id)) \
        .filter(ShoutOut.to_user_id == current_user.id) \
        .scalar()

    reaction_count = db.query(func.count(Reaction.id)) \
        .filter(Reaction.user_id == current_user.id) \
        .scalar()

    return {
        "sent": sent_count,
        "received": received_count,
        "reactions": reaction_count,
    }


@router.get("/me/department-rank")
def get_department_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns rank of current user within their department
    based on shoutouts received
    """

    # Step 1: get shoutout counts per user in same department
    results = (
        db.query(
            User.id.label("user_id"),
            func.count(ShoutOut.id).label("shoutout_count")
        )
        .join(ShoutOut, ShoutOut.to_user_id == User.id, isouter=True)
        .filter(User.department == current_user.department)
        .group_by(User.id)
        .order_by(desc("shoutout_count"))
        .all()
    )

    # Step 2: calculate rank
    rank = 1
    for row in results:
        if row.user_id == current_user.id:
            break
        rank += 1

    return {
        "department": current_user.department,
        "rank": rank,
        "total_users": len(results)
    }