from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm import aliased
from typing import Optional
from sqlalchemy import func

from app.models.report import Report
from datetime import datetime

from app.database import SessionLocal
from app.models.shoutout import ShoutOut
from app.schemas.shoutout import (
    ShoutOutCreate,
    ShoutOutResponse,
    ShoutOutFeedResponse
)
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.comments import Comment


router = APIRouter(prefix="/shoutouts", tags=["ShoutOuts"])


# ---------------- DB DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- CREATE SHOUTOUT ----------------
@router.post("/", response_model=ShoutOutResponse)
def create_shoutout(
    shoutout: ShoutOutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if shoutout.to_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot shoutout yourself")

    new_shoutout = ShoutOut(
        from_user_id=current_user.id,
        to_user_id=shoutout.to_user_id,
        message=shoutout.message
    )

    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)

    return {
        "id": new_shoutout.id,
        "message": new_shoutout.message,
        "created_at": new_shoutout.created_at,
        "from_user": {
            "id": current_user.id,
            "name": current_user.name,
            "department": current_user.department,
        },
        "reactions": [],
        "comment_count": 0,
    }

# ---------------- MY SHOUTOUTS ----------------
@router.get("/me")
def get_my_shoutouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            ShoutOut,
            func.count(Comment.id).label("comment_count")
        )
        .outerjoin(Comment, Comment.shoutout_id == ShoutOut.id)
        .filter(ShoutOut.to_user_id == current_user.id)
        .group_by(ShoutOut.id)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    response = []

    for shoutout, comment_count in rows:
        response.append({
            "id": shoutout.id,
            "message": shoutout.message,
            "created_at": shoutout.created_at,
            "from_user": {
                "id": shoutout.from_user.id,
                "name": shoutout.from_user.name,
                "department": shoutout.from_user.department,
            },
            "reactions": shoutout.reactions,
            "comment_count": comment_count,
        })

    return response



# ---------------- GLOBAL SHOUTOUT FEED ----------------


@router.get("/feed", response_model=list[ShoutOutResponse])
def get_feed(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(
            ShoutOut,
            func.count(Comment.id).label("comment_count")
        )
        .join(User, ShoutOut.from_user_id == User.id)
        .outerjoin(Comment, Comment.shoutout_id == ShoutOut.id)
    )

    if department:
        query = query.filter(User.department == department)

    rows = (
        query
        .group_by(ShoutOut.id)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )


    response = []

    for shoutout, comment_count in rows:
        response.append({
            "id": shoutout.id,
            "message": shoutout.message,
            "created_at": shoutout.created_at,
            "from_user": {
                "id": shoutout.from_user.id,
                "name": shoutout.from_user.name,
                "department": shoutout.from_user.department,
            },
            "reactions": shoutout.reactions,
            "comment_count": comment_count,
        })

    return response

# ---------------- RECEIVED SHOUTOUTS ----------------
@router.get("/received", response_model=list[ShoutOutResponse])
def get_received_shoutouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    rows = (
        db.query(
            ShoutOut,
            func.count(Comment.id).label("comment_count")
        )
        .outerjoin(Comment, Comment.shoutout_id == ShoutOut.id)
        .filter(ShoutOut.to_user_id == current_user.id)
        .group_by(ShoutOut.id)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    response = []

    for shoutout, comment_count in rows:
        response.append({
            "id": shoutout.id,
            "message": shoutout.message,
            "created_at": shoutout.created_at,
            "from_user": {
                "id": shoutout.from_user.id,
                "name": shoutout.from_user.name,
                "department": shoutout.from_user.department,
            },
            "reactions": shoutout.reactions,
            "comment_count": comment_count,
        })

    return response


#-------------------- SENT SHOUTOUTS -------------------------
@router.get("/sent")
def get_sent_shoutouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            ShoutOut,
            func.count(Comment.id).label("comment_count")
        )
        .outerjoin(Comment, Comment.shoutout_id == ShoutOut.id)
        .filter(ShoutOut.from_user_id == current_user.id)
        .group_by(ShoutOut.id)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    response = []
    for shoutout, comment_count in rows:
        response.append({
            "id": shoutout.id,
            "message": shoutout.message,
            "created_at": shoutout.created_at,

            # 🔥 IMPORTANT CHANGE
            "to_user": {
                "id": shoutout.to_user.id,
                "name": shoutout.to_user.name,
                "department": shoutout.to_user.department,
            },

            "reactions": shoutout.reactions,
            "comment_count": comment_count,
        })

    return response
