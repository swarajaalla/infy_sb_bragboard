from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User, ShoutOut, ShoutOutRecipient


async def get_users(session: AsyncSession) -> List[User]:
    result = await session.execute(select(User))
    return result.scalars().all()


async def create_user(session: AsyncSession, email: str, name: Optional[str] = None) -> User:
    user = User(email=email, name=name)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def create_shoutout(session: AsyncSession, author_id: int, message: str, recipient_ids: Optional[List[int]] = None) -> ShoutOut:
    if recipient_ids is None:
        recipient_ids = []
    shout = ShoutOut(author_id=author_id, message=message)
    session.add(shout)
    await session.flush()

    # attach recipients
    for rid in recipient_ids:
        r = ShoutOutRecipient(shoutout_id=shout.id, user_id=rid)
        session.add(r)

    await session.commit()
    await session.refresh(shout)
    return shout


async def list_shoutouts(session: AsyncSession, limit: int = 20, offset: int = 0) -> List[ShoutOut]:
    q = await session.execute(select(ShoutOut).order_by(ShoutOut.created_at.desc()).limit(limit).offset(offset))
    return q.scalars().all()
