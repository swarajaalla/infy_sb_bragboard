from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, crud, schemas
from ..auth import hash_password, verify_password, create_access_token, verify_token

from app import models
from app.dependencies import get_current_user_dep

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_current_user_dep(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")

    user_id = verify_token(token)
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user


@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existed = db.query(models.User).filter(models.User.email == user.email).first()
    if existed:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        department=user.department,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.LoginResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user_dep)):
    return current_user

@router.get("/department-peers")
def get_department_peers(
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    if current_user.role == "HR":
        users = db.query(models.User).all()

    elif current_user.role == "Employee":
        users = db.query(models.User).filter(
            models.User.role.in_(["Employee", "HR"])
        ).all()

    elif current_user.role == "Trainee":
        users = db.query(models.User).filter(
            models.User.role.in_(["Trainee", "HR"])
        ).all()

    elif current_user.role == "Intern":
        users = db.query(models.User).filter(
            models.User.role.in_(["Intern", "HR"])
        ).all()

    else:
        users = []

    peers = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "department": u.department
        }
        for u in users if u.id != current_user.id
    ]

    return {"peers": peers}



@router.get("/users/by-role")
def get_users_by_role(
    role: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_dep)
):
    if current_user.role == "HR":
        users = db.query(models.User).all()

    elif current_user.role == "Employee":
        users = db.query(models.User).filter(
            models.User.role.in_(["Employee", "Trainee", "Intern"])
        ).all()

    elif current_user.role == "Trainee":
        users = db.query(models.User).filter(
            models.User.role.in_(["Employee", "Trainee"])
        ).all()

    else:  # Intern
        users = db.query(models.User).filter(
            models.User.role.in_(["Employee", "Intern"])
        ).all()

    return users

