from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existed = db.query(models.User).filter(models.User.email == user.email).first()
    if existed:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed,
        department=user.department
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "department": db_user.department,
            "role": db_user.role
        }
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
