from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm

from ..database import get_session
from .. import models, schemas
from datetime import datetime, timedelta, timezone
import secrets
from ..core import security

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut)
async def register(payload: schemas.UserCreate, session: AsyncSession = Depends(get_session)):
    # check exists
    q = await session.execute(select(models.User).where(models.User.email == payload.email))
    existing = q.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = security.get_password_hash(payload.password)
    user = models.User(email=payload.email, name=payload.name, password_hash=hashed, department=payload.department)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    q = await session.execute(select(models.User).where(models.User.email == form_data.username))
    user = q.scalar_one_or_none()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # create access token (JWT)
    access = security.create_access_token(user.id)

    # create opaque refresh token, store hashed value in DB
    raw_rt = secrets.token_urlsafe(32)
    rt_hash = security.get_password_hash(raw_rt)
    expires = datetime.now(timezone.utc) + timedelta(days=int(security.settings.REFRESH_TOKEN_EXPIRE_DAYS))
    rt = models.RefreshToken(user_id=user.id, token_hash=rt_hash, expires_at=expires)
    session.add(rt)
    await session.commit()
    await session.refresh(rt)

    return {"access_token": access, "refresh_token": raw_rt, "token_type": "bearer"}


@router.post("/refresh", response_model=schemas.Token)
async def refresh(body: dict, session: AsyncSession = Depends(get_session)):
    # Expect a JSON body {"refresh_token": "..."}
    rt = body.get("refresh_token") if isinstance(body, dict) else None
    if not rt:
        raise HTTPException(status_code=400, detail="Missing refresh token")

    # find candidate refresh tokens that are not revoked and not expired for any user
    q = await session.execute(select(models.RefreshToken).where(models.RefreshToken.revoked == 0))
    candidates = q.scalars().all()
    matched = None
    for cand in candidates:
        # check expiry
        if cand.expires_at and cand.expires_at < datetime.now(timezone.utc):
            continue
        try:
            if security.verify_password(rt, cand.token_hash):
                matched = cand
                break
        except Exception:
            continue

    if not matched:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # load user
    q2 = await session.execute(select(models.User).where(models.User.id == matched.user_id))
    user = q2.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # rotate: revoke old token and issue new opaque token
    matched.revoked = 1
    raw_rt = secrets.token_urlsafe(32)
    rt_hash = security.get_password_hash(raw_rt)
    expires = datetime.now(timezone.utc) + timedelta(days=int(security.settings.REFRESH_TOKEN_EXPIRE_DAYS))
    new_rt = models.RefreshToken(user_id=user.id, token_hash=rt_hash, expires_at=expires)
    session.add(new_rt)
    await session.commit()
    await session.refresh(new_rt)

    access = security.create_access_token(user.id)
    return {"access_token": access, "refresh_token": raw_rt, "token_type": "bearer"}


from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    try:
        data = security.decode_token(token)
        user_id = int(data.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    q = await session.execute(select(models.User).where(models.User.id == user_id))
    user = q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/users/me", response_model=schemas.UserOut)
async def read_users_me(current=Depends(get_current_user)):
    return current

