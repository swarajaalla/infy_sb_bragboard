from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 🔒 Admin-only access
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # 🔹 Top contributors (most shoutouts sent)
    top_contributors = (
        db.query(
            models.User.id,
            models.User.name,
            func.count(models.ShoutOut.id).label("count")
        )
        .join(models.ShoutOut, models.ShoutOut.sender_id == models.User.id)
        .group_by(models.User.id)
        .order_by(func.count(models.ShoutOut.id).desc())
        .limit(5)
        .all()
    )

    # 🔹 Most tagged employees (most shoutouts received)
    most_tagged = (
        db.query(
            models.User.id,
            models.User.name,
            func.count(models.ShoutOutRecipient.id).label("count")
        )
        .join(
            models.ShoutOutRecipient,
            models.ShoutOutRecipient.recipient_id == models.User.id
        )
        .group_by(models.User.id)
        .order_by(func.count(models.ShoutOutRecipient.id).desc())
        .limit(5)
        .all()
    )

    return {
        "top_contributors": [
            {
                "user_id": u.id,
                "name": u.name,
                "count": u.count
            }
            for u in top_contributors
        ],
        "most_tagged": [
            {
                "user_id": u.id,
                "name": u.name,
                "count": u.count
            }
            for u in most_tagged
        ]
    }
