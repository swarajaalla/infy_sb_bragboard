from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_session
from .. import models, schemas
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[schemas.UserOut])
async def list_users(
    department: str | None = None,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    List users, optionally filtered by department.
    Excludes the current user from results.
    """
    try:
        q = select(models.User)

        # exclude current user
        q = q.where(models.User.id != current_user.id)

        # optional department filter
        if department:
            q = q.where(models.User.department == department)

        result = await session.execute(q)
        users = result.scalars().all()

        print(f"[LIST_USERS] Found {len(users)} users (dept={department}, current_user_id={current_user.id})")
        return users
    
    except Exception as e:
        print(f"[LIST_USERS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.get("/me", response_model=schemas.UserOut)
async def read_me(current=Depends(get_current_user)):
    return current
