from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User


async def get_users(session: AsyncSession) -> List[User]:
    result = await session.execute(select(User))
    return result.scalars().all()


async def create_user(session: AsyncSession, email: str, name: Optional[str] = None) -> User:
    user = User(email=email, name=name)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
