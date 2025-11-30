from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_session
from .. import models, schemas
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserOut])
async def list_users(department: str | None = None, session: AsyncSession = Depends(get_session), current=Depends(get_current_user)):
    """List users. If `department` is provided, scope to that department."""
    q = select(models.User)
    if department:
        q = q.where(models.User.department == department)
    result = await session.execute(q)
    users = result.scalars().all()
    return users


@router.get("/me", response_model=schemas.UserOut)
async def read_me(current=Depends(get_current_user)):
    return current
