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
