from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_session
from .. import models, schemas, crud
from ..routers.auth import get_current_user

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])


@router.post("", response_model=schemas.ShoutOutOut)
async def create_shoutout(
    payload: schemas.ShoutOutCreate,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """
    Create a new shoutout with optional recipient tagging.
    """
    try:
        recipient_ids = payload.recipient_ids or []

        # Validate recipients exist
        if recipient_ids:
            q = await session.execute(
                select(models.User).where(models.User.id.in_(recipient_ids))
            )
            recipients = q.scalars().all()
            
            # Verify all recipients were found
            found_ids = {r.id for r in recipients}
            invalid_ids = set(recipient_ids) - found_ids
            if invalid_ids:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid recipient IDs: {invalid_ids}"
                )
        else:
            recipients = []

        # Create shoutout
        shout = await crud.create_shoutout(
            session,
            author_id=int(current.id),
            message=payload.message,
            recipient_ids=recipient_ids
        )

        print(f"[CREATE_SHOUTOUT] User {current.id} created shoutout {shout.id} for {len(recipients)} recipients")

        return {
            "id": shout.id,
            "message": shout.message,
            "created_at": shout.created_at,
            "author": current,
            "recipients": recipients
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[CREATE_SHOUTOUT] Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to create shoutout: {str(e)}")


@router.get("", response_model=List[schemas.ShoutOutOut])
async def get_shoutouts(
    limit: int = 50,
    offset: int = 0,
    department: str | None = None,
    sender_id: int | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """
    Get shoutouts with optional filters:
    - department: filter by author's department
    - sender_id: filter by specific author
    - from_date: filter shoutouts from this date (ISO format: YYYY-MM-DD)
    - to_date: filter shoutouts until this date (ISO format: YYYY-MM-DD)
    """
    try:
        from datetime import datetime
        
        q = select(models.ShoutOut).order_by(models.ShoutOut.created_at.desc())

        # Filter by author's department
        if department:
            q = q.join(models.User, models.ShoutOut.author_id == models.User.id).where(
                models.User.department == department
            )

        # Filter by specific sender
        if sender_id:
            q = q.where(models.ShoutOut.author_id == sender_id)

        # Filter by date range
        if from_date:
            try:
                from_dt = datetime.fromisoformat(from_date)
                q = q.where(models.ShoutOut.created_at >= from_dt)
            except ValueError:
                pass  # ignore invalid date format
        
        if to_date:
            try:
                to_dt = datetime.fromisoformat(to_date)
                # Add one day to include the entire to_date
                to_dt = to_dt.replace(hour=23, minute=59, second=59)
                q = q.where(models.ShoutOut.created_at <= to_dt)
            except ValueError:
                pass  # ignore invalid date format

        # Apply pagination
        q = q.limit(limit).offset(offset)

        result = await session.execute(q)
        shoutouts = result.scalars().all()

        response = []

        for s in shoutouts:
            # Load author
            aq = await session.execute(
                select(models.User).where(models.User.id == s.author_id)
            )
            author = aq.scalar_one_or_none()

            # Load recipients
            rq = await session.execute(
                select(models.User)
                .join(models.ShoutOutRecipient)
                .where(models.ShoutOutRecipient.shoutout_id == s.id)
            )
            recipients = rq.scalars().all()

            if author:  # Only include if author exists
                response.append({
                    "id": s.id,
                    "message": s.message,
                    "created_at": s.created_at,
                    "author": author,
                    "recipients": recipients
                })

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Reaction endpoints
@router.post("/{shoutout_id}/reactions", response_model=schemas.ReactionOut)
async def add_reaction_to_shoutout(
    shoutout_id: int,
    payload: schemas.ReactionCreate,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Add or update a reaction to a shoutout"""
    # Verify shoutout exists
    result = await session.execute(
        select(models.ShoutOut).where(models.ShoutOut.id == shoutout_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    reaction = await crud.add_reaction(
        session, 
        shoutout_id=shoutout_id, 
        user_id=int(current.id), 
        reaction_type=payload.reaction_type
    )
    return reaction


@router.delete("/{shoutout_id}/reactions")
async def remove_reaction_from_shoutout(
    shoutout_id: int,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Remove user's reaction from a shoutout"""
    removed = await crud.remove_reaction(session, shoutout_id, int(current.id))
    if not removed:
        raise HTTPException(status_code=404, detail="Reaction not found")
    return {"message": "Reaction removed"}


@router.get("/{shoutout_id}/reactions")
async def get_shoutout_reactions(
    shoutout_id: int,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Get reaction counts and current user's reaction for a shoutout"""
    counts = await crud.get_reaction_counts(session, shoutout_id)
    user_reaction = await crud.get_user_reaction(session, shoutout_id, int(current.id))
    return {
        "reactions": counts,
        "user_reaction": user_reaction
    }


# Comment endpoints
@router.post("/{shoutout_id}/comments", response_model=schemas.CommentOut)
async def add_comment_to_shoutout(
    shoutout_id: int,
    payload: schemas.CommentCreate,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Add a comment to a shoutout"""
    # Verify shoutout exists
    result = await session.execute(
        select(models.ShoutOut).where(models.ShoutOut.id == shoutout_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # If parent_id is provided, verify parent comment exists
    if payload.parent_id:
        parent_result = await session.execute(
            select(models.Comment).where(models.Comment.id == payload.parent_id)
        )
        if not parent_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    comment = await crud.add_comment(
        session,
        shoutout_id=shoutout_id,
        user_id=int(current.id),
        content=payload.content,
        parent_id=payload.parent_id
    )
    
    # Load author
    author_result = await session.execute(
        select(models.User).where(models.User.id == comment.user_id)
    )
    author = author_result.scalar_one()
    
    return {
        "id": comment.id,
        "shoutout_id": comment.shoutout_id,
        "user_id": comment.user_id,
        "parent_id": comment.parent_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "author": author
    }


@router.get("/{shoutout_id}/comments", response_model=List[schemas.CommentOut])
async def get_shoutout_comments(
    shoutout_id: int,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Get all comments for a shoutout"""
    comments = await crud.get_comments(session, shoutout_id)
    
    response = []
    for comment in comments:
        # Load author for each comment
        author_result = await session.execute(
            select(models.User).where(models.User.id == comment.user_id)
        )
        author = author_result.scalar_one()
        
        response.append({
            "id": comment.id,
            "shoutout_id": comment.shoutout_id,
            "user_id": comment.user_id,
            "parent_id": comment.parent_id,
            "content": comment.content,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author": author
        })
    
    return response


@router.delete("/{shoutout_id}/comments/{comment_id}")
async def delete_comment_from_shoutout(
    shoutout_id: int,
    comment_id: int,
    session: AsyncSession = Depends(get_session),
    current=Depends(get_current_user)
):
    """Delete a comment (only the author can delete)"""
    deleted = await crud.delete_comment(session, comment_id, int(current.id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
    return {"message": "Comment deleted"}
