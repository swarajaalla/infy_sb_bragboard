from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from .models import User, ShoutOut, ShoutOutRecipient, Reaction, Comment, ReactionTypeEnum


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


# Reactions
async def add_reaction(session: AsyncSession, shoutout_id: int, user_id: int, reaction_type: str) -> Reaction:
    # Remove existing reaction by this user on this shoutout
    await session.execute(
        delete(Reaction).where(
            Reaction.shoutout_id == shoutout_id,
            Reaction.user_id == user_id
        )
    )
    
    # Add new reaction
    reaction = Reaction(
        shoutout_id=shoutout_id,
        user_id=user_id,
        reaction_type=ReactionTypeEnum[reaction_type]
    )
    session.add(reaction)
    await session.commit()
    await session.refresh(reaction)
    return reaction


async def remove_reaction(session: AsyncSession, shoutout_id: int, user_id: int) -> bool:
    result = await session.execute(
        delete(Reaction).where(
            Reaction.shoutout_id == shoutout_id,
            Reaction.user_id == user_id
        )
    )
    await session.commit()
    return result.rowcount > 0


async def get_reaction_counts(session: AsyncSession, shoutout_id: int) -> dict:
    result = await session.execute(
        select(Reaction.reaction_type, func.count(Reaction.id))
        .where(Reaction.shoutout_id == shoutout_id)
        .group_by(Reaction.reaction_type)
    )
    counts = {row[0].value: row[1] for row in result}
    return counts


async def get_user_reaction(session: AsyncSession, shoutout_id: int, user_id: int) -> Optional[str]:
    result = await session.execute(
        select(Reaction.reaction_type)
        .where(Reaction.shoutout_id == shoutout_id, Reaction.user_id == user_id)
    )
    reaction = result.scalar_one_or_none()
    return reaction.value if reaction else None


# Comments
async def add_comment(session: AsyncSession, shoutout_id: int, user_id: int, content: str, parent_id: Optional[int] = None) -> Comment:
    comment = Comment(
        shoutout_id=shoutout_id,
        user_id=user_id,
        content=content,
        parent_id=parent_id
    )
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    return comment


async def get_comments(session: AsyncSession, shoutout_id: int) -> List[Comment]:
    result = await session.execute(
        select(Comment)
        .where(Comment.shoutout_id == shoutout_id)
        .order_by(Comment.created_at.asc())
    )
    return result.scalars().all()


async def delete_comment(session: AsyncSession, comment_id: int, user_id: int) -> bool:
    """Delete a comment if the user is the author"""
    result = await session.execute(
        delete(Comment).where(
            Comment.id == comment_id,
            Comment.user_id == user_id
        )
    )
    await session.commit()
    return result.rowcount > 0
