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

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

    most_appreciated = (
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
            {"id": u.id, "name": u.name, "count": u.count}
            for u in top_contributors
        ],
        "most_appreciated": [
            {"id": u.id, "name": u.name, "count": u.count}
            for u in most_appreciated
        ],
    }

@router.get("/employees")
def get_all_employees_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 🔒 Admin-only
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    users = db.query(models.User).all()

    result = []

    for u in users:
        # Contributions (shoutouts sent)
        contributions = (
            db.query(func.count(models.ShoutOut.id))
            .filter(models.ShoutOut.sender_id == u.id)
            .scalar()
        )

        # Reports made by user
        reports_made = (
            db.query(func.count(models.Report.id))
            .filter(models.Report.reported_by == u.id)
            .scalar()
        )

        # Reports on this user (his shoutouts reported)
        reports_on_him = (
            db.query(func.count(models.Report.id))
            .join(models.ShoutOut, models.Report.shoutout_id == models.ShoutOut.id)
            .filter(models.ShoutOut.sender_id == u.id)
            .scalar()
        )

        # Most appreciated (times received)
        most_appreciated = (
            db.query(func.count(models.ShoutOutRecipient.id))
            .filter(models.ShoutOutRecipient.recipient_id == u.id)
            .scalar()
        )

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "joined_at": u.joined_at,
            "contributions": contributions,
            "reports_made": reports_made,
            "reports_on_him": reports_on_him,
            "most_appreciated": most_appreciated
        })

    return result

