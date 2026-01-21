from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta


from app.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.shoutout import ShoutOut
from app.models.reactions import Reaction
from app.models.comments import Comment
from app.utils.admin_logger import log_admin_action
from app.models.admin_log import AdminLog
from app.models.report import Report


from app.database import get_db
from app.core.security import hash_password

from app.schemas.user import AdminCreateUser


router = APIRouter(prefix="/admin", tags=["Admin"])



@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return {
        "total_users": db.query(User).count(),
        "total_shoutouts": db.query(ShoutOut).count(),
        "total_reactions": db.query(Reaction).count(),
        "total_comments": db.query(Comment).count(),
    }


@router.get("/top-contributors")
def get_top_contributors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔐 Admin check
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    results = (
        db.query(
            User.id,
            User.name,
            User.department,
            func.count(ShoutOut.id).label("shoutout_count")
        )
        .join(ShoutOut, ShoutOut.from_user_id == User.id)
        .group_by(User.id)
        .order_by(func.count(ShoutOut.id).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "user_id": r.id,
            "name": r.name,
            "department": r.department,
            "count": r.shoutout_count
        }
        for r in results
    ]


@router.get("/most-tagged")
def most_tagged_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    results = (
        db.query(
            User.id.label("user_id"),
            User.name,
            User.department,
            func.count(ShoutOut.id).label("count")
        )
        .join(ShoutOut, ShoutOut.to_user_id == User.id)
        .group_by(User.id)
        .order_by(func.count(ShoutOut.id).desc())
        .all()
    )
    return [
    {
        "user_id": r.user_id,
        "name": r.name,
        "department": r.department,
        "count": r.count
    }
    for r in results
]


@router.get("/shoutouts")
def get_all_shoutouts_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    shoutouts = (
        db.query(ShoutOut)
        .options(
            joinedload(ShoutOut.from_user),
            joinedload(ShoutOut.to_user),
            joinedload(ShoutOut.comments).joinedload(Comment.user)
        )
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    result = []
    for s in shoutouts:
        result.append({
            "id": s.id,
            "message": s.message,
            "created_at": s.created_at,
            "from_user": {
                "id": s.from_user.id,
                "name": s.from_user.name
            },
            "to_user": {
                "id": s.to_user.id,
                "name": s.to_user.name
            },
            "comments": [
                {
                    "id": c.id,
                    "content": c.content,
                    "user": {
                        "id": c.user.id,
                        "name": c.user.name
                    }
                }
                for c in s.comments
            ]
        })

    return result


@router.delete("/shoutouts/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    # delete related comments & reactions
    db.query(Comment).filter(Comment.shoutout_id == shoutout_id).delete()
    db.query(Reaction).filter(Reaction.shoutout_id == shoutout_id).delete()
    db.delete(shoutout)

    log_admin_action(
        db,
        current_user.id,
        "Deleted shoutout",
        shoutout_id,
        "shoutout"
    )

    db.commit()

    return {"message": "Shoutout deleted successfully"}

@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if current_user.role != "admin" and comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(comment)
    
    log_admin_action(
        db,
        current_user.id,
        "Deleted comment",
        comment_id,
        "comment"
    )

    db.commit()

    return {"message": "Comment deleted successfully"}


#--------------------- REPORTED SHOUTOUTS -----------------
@router.get("/reported-shoutouts")
def get_reported_shoutouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    reports = (
        db.query(Report, ShoutOut, User)
        .join(ShoutOut, Report.shoutout_id == ShoutOut.id)
        .join(User, User.id == Report.reported_by)
        .filter(Report.status == "pending")
        .all()
    )

    return [
    {
        "report_id": report.id,
        "reason": report.reason,
        "reported_by": user.name,
        "shoutout": {
            "id": shoutout.id,
            "message": shoutout.message,
            "from_user": shoutout.from_user.name,
            "to_user": shoutout.to_user.name,
        }
    }
    for report, shoutout, user in reports
]



@router.post("/reports/{report_id}/resolve")
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = "resolved"
    
    log_admin_action(
        db,
        current_user.id,
        "Resolved report",
        report_id,
        "report"
    )

    db.commit()
    return {"message": "Report resolved"}


#--------------- ADMIN LOGS -----------------
@router.get("/logs")
def get_admin_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    logs = (
        db.query(AdminLog)
        .join(User, User.id == AdminLog.admin_id)
        .order_by(AdminLog.timestamp.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": log.id,
            "admin": log.admin_id,  # frontend can map ID → name later if needed
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "timestamp": log.timestamp
        }
        for log in logs
    ]

@router.get("/department-activity")
def department_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    results = (
        db.query(
            User.department.label("department"),
            func.count(ShoutOut.id).label("count")
        )
        .join(ShoutOut, ShoutOut.from_user_id == User.id)  # ⚠️ fixed field
        .group_by(User.department)
        .order_by(func.count(ShoutOut.id).desc())
        .all()
    )

    return [
        {
            "department": r.department,
            "count": r.count
        }
        for r in results
    ]

@router.get("/notifications")
def admin_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    pending_reports = (
        db.query(Report)
        .filter(Report.status == "pending")
        .count()
    )

    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    recent_reactions = (
        db.query(Reaction)
        .filter(Reaction.created_at >= one_hour_ago)
        .count()
    )

    return {
        "pending_reports": pending_reports,
        "recent_reactions": recent_reactions
    }


def admin_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


#---------------------CREATE USERS-----------------------

@router.get("/users")
def get_all_users_admin(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only)
):
    users = db.query(User).order_by(User.id.desc()).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": u.department,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


@router.post("/users")
def create_user(
    payload: AdminCreateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        department=payload.department,
        role=payload.role,
        password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user_id": user.id
    }

@router.delete("/users/{user_id}")
def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ❌ Prevent deleting admins
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")

    # ❌ Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db.delete(user)

    log_admin_action(
        db,
        current_user.id,
        "Deleted user",
        user_id,
        "user"
    )

    db.commit()
    return {"message": "User deleted successfully"}


@router.patch("/users/{user_id}/disable")
def disable_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()

    return {"message": "User disabled"}


@router.patch("/users/{user_id}/enable")
def enable_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    return {"message": "User enabled"}

