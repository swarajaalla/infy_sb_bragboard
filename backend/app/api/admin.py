from fastapi import APIRouter, Depends, HTTPException, status, Query  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import func, desc, and_  # type: ignore
from pydantic import BaseModel, EmailStr  # type: ignore
from typing import List, Optional
from datetime import datetime
import csv
import io
from app.db.database import get_db
from app.db.models import (
    User, ShoutOut, ShoutOutRecipient, Comment, Reaction, Report, AdminLog, RoleEnum, Notification
)
from app.api.auth import get_current_user
from app.utils.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])

# Pydantic Schemas
class ReportResponse(BaseModel):
    id: int
    shoutout_id: int
    reported_by: int
    reason: str
    created_at: datetime
    shoutout: Optional[dict] = None  # Include shout-out details
    
    class Config:
        from_attributes = True

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    role: RoleEnum = RoleEnum.employee

class TopContributorResponse(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    department: str
    sent_count: int
    received_count: int
    comment_count: int

class MostTaggedUserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    department: str
    tagged_count: int

class EngagementMetricsResponse(BaseModel):
    total_shoutouts: int
    total_comments: int
    total_reactions: int
    unique_contributors: int
    average_reactions_per_post: float
    average_comments_per_post: float

class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_id: int
    target_type: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


# Middleware: Verify admin access
def verify_admin(current_user: User = Depends(get_current_user)):
    """Check if current user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ============ MODERATION ENDPOINTS ============

@router.post("/{shoutout_id}/delete", status_code=status.HTTP_200_OK)
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Delete a shout-out (admin only)"""
    
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    # Get the sender ID to send notification
    sender_id = shoutout.sender_id
    
    # Get all reporters of this shoutout to notify them
    reports = db.query(Report).filter(Report.shoutout_id == shoutout_id).all()
    reporter_ids = [report.reported_by for report in reports]
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="deleted_shoutout",
        target_id=shoutout_id,
        target_type="shoutout"
    )
    
    # Send notification to the sender
    sender_notification = Notification(
        user_id=sender_id,
        message=f"Your shout-out #{shoutout_id} has been deleted by an admin for violating community guidelines.",
        type="post_deleted",
        related_id=shoutout_id
    )
    
    # Send notification to all reporters
    for reporter_id in reporter_ids:
        reporter_notification = Notification(
            user_id=reporter_id,
            message=f"The shout-out #{shoutout_id} that you reported has been deleted by an admin.",
            type="post_deleted",
            related_id=shoutout_id
        )
        db.add(reporter_notification)
    
    db.delete(shoutout)
    db.add(admin_log)
    db.add(sender_notification)
    db.commit()
    
    return {"message": f"Shout-out {shoutout_id} deleted successfully"}


@router.post("/comments/{comment_id}/delete", status_code=status.HTTP_200_OK)
def delete_comment_admin(
    comment_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Delete a comment (admin only)"""
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="deleted_comment",
        target_id=comment_id,
        target_type="comment"
    )
    
    db.delete(comment)
    db.add(admin_log)
    db.commit()
    
    return {"message": f"Comment {comment_id} deleted successfully"}


# ============ REPORTING SYSTEM ============

@router.post("/reports/create", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def report_shoutout(
    shoutout_id: int = Query(...),
    reason: str = Query(..., min_length=5, max_length=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a shout-out for moderation"""
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    # Check if user already reported this
    existing = db.query(Report).filter(
        Report.shoutout_id == shoutout_id,
        Report.reported_by == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reported this shout-out"
        )
    
    new_report = Report(
        shoutout_id=shoutout_id,
        reported_by=current_user.id,
        reason=reason.strip()
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return new_report


@router.get("/reports", response_model=List[ReportResponse])
def get_reports(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get all reports (admin only)"""
    
    reports = db.query(Report).order_by(
        desc(Report.created_at)
    ).offset(offset).limit(limit).all()
    
    # Add shout-out details to each report
    result = []
    for report in reports:
        report_dict = {
            "id": report.id,
            "shoutout_id": report.shoutout_id,
            "reported_by": report.reported_by,
            "reason": report.reason,
            "created_at": report.created_at,
            "shoutout": {
                "message": report.shoutout.message if report.shoutout else None,
                "id": report.shoutout.id if report.shoutout else None,
            } if report.shoutout else None
        }
        result.append(report_dict)
    
    return result


@router.delete("/reports/{report_id}", status_code=status.HTTP_200_OK)
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Resolve/dismiss a report (admin only)"""
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Get the reporter's ID to send notification
    reporter_id = report.reported_by
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="resolved_report",
        target_id=report_id,
        target_type="report"
    )
    
    # Send notification to the reporter
    notification = Notification(
        user_id=reporter_id,
        message=f"Your report for shout-out #{report.shoutout_id} has been reviewed and resolved by an admin.",
        type="report_resolved",
        related_id=report.shoutout_id
    )
    
    db.delete(report)
    db.add(admin_log)
    db.add(notification)
    db.commit()
    
    return {"message": f"Report {report_id} resolved successfully"}


# ============ ANALYTICS ENDPOINTS ============

@router.get("/analytics/metrics", response_model=EngagementMetricsResponse)
def get_engagement_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get overall engagement metrics"""
    
    total_shoutouts = db.query(func.count(ShoutOut.id)).scalar() or 0
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    total_reactions = db.query(func.count(Reaction.id)).scalar() or 0
    unique_contributors = db.query(func.count(func.distinct(ShoutOut.sender_id))).scalar() or 0
    
    avg_reactions = 0.0
    avg_comments = 0.0
    
    if total_shoutouts > 0:
        avg_reactions = float(total_reactions / total_shoutouts)
        avg_comments = float(total_comments / total_shoutouts)
    
    return EngagementMetricsResponse(
        total_shoutouts=total_shoutouts,
        total_comments=total_comments,
        total_reactions=total_reactions,
        unique_contributors=unique_contributors,
        average_reactions_per_post=avg_reactions,
        average_comments_per_post=avg_comments
    )


@router.get("/analytics/top-contributors", response_model=List[TopContributorResponse])
def get_top_contributors(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get top contributors by shout-outs sent and received"""
    
    # Get users with their stats
    top_contributors = db.query(
        User.id,
        User.name,
        User.email,
        User.department,
        func.count(ShoutOut.id).label("sent_count")
    ).outerjoin(
        ShoutOut, User.id == ShoutOut.sender_id
    ).group_by(
        User.id, User.name, User.email, User.department
    ).order_by(
        desc("sent_count")
    ).offset(offset).limit(limit).all()
    
    result = []
    for user_id, name, email, department, sent_count in top_contributors:
        # Count received shout-outs
        received_count = db.query(func.count(ShoutOutRecipient.id)).filter(
            ShoutOutRecipient.recipient_id == user_id
        ).scalar() or 0
        
        # Count comments
        comment_count = db.query(func.count(Comment.id)).filter(
            Comment.user_id == user_id
        ).scalar() or 0
        
        result.append(TopContributorResponse(
            user_id=user_id,
            user_name=name,
            user_email=email,
            department=department or "N/A",
            sent_count=sent_count or 0,
            received_count=received_count,
            comment_count=comment_count
        ))
    
    return result


@router.get("/analytics/most-tagged", response_model=List[MostTaggedUserResponse])
def get_most_tagged_users(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get users who are tagged most frequently"""
    
    most_tagged = db.query(
        User.id,
        User.name,
        User.email,
        User.department,
        func.count(ShoutOutRecipient.id).label("tagged_count")
    ).join(
        ShoutOutRecipient, User.id == ShoutOutRecipient.recipient_id
    ).group_by(
        User.id, User.name, User.email, User.department
    ).order_by(
        desc("tagged_count")
    ).offset(offset).limit(limit).all()
    
    return [
        MostTaggedUserResponse(
            user_id=user_id,
            name=name,
            email=email,
            department=department or "N/A",
            tagged_count=tagged_count
        )
        for user_id, name, email, department, tagged_count in most_tagged
    ]


@router.get("/analytics/department-stats")
def get_department_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get engagement stats by department"""
    
    departments = db.query(User.department).distinct().all()
    stats = []
    
    for (dept,) in departments:
        if not dept:
            continue
        
        dept_users = db.query(User.id).filter(User.department == dept).all()
        dept_user_ids = [u[0] for u in dept_users]
        
        shoutouts_sent = db.query(func.count(ShoutOut.id)).filter(
            ShoutOut.sender_id.in_(dept_user_ids)
        ).scalar() or 0
        
        shoutouts_received = db.query(func.count(ShoutOutRecipient.id)).filter(
            ShoutOutRecipient.recipient_id.in_(dept_user_ids)
        ).scalar() or 0
        
        comments = db.query(func.count(Comment.id)).filter(
            Comment.user_id.in_(dept_user_ids)
        ).scalar() or 0
        
        reactions = db.query(func.count(Reaction.id)).filter(
            Reaction.user_id.in_(dept_user_ids)
        ).scalar() or 0
        
        stats.append({
            "department": dept,
            "shoutouts_sent": shoutouts_sent,
            "shoutouts_received": shoutouts_received,
            "total_comments": comments,
            "total_reactions": reactions,
            "user_count": len(dept_user_ids)
        })
    
    return sorted(stats, key=lambda x: x["shoutouts_sent"], reverse=True)


@router.get("/logs", response_model=List[AdminLogResponse])
def get_admin_logs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get admin activity logs"""
    
    logs = db.query(AdminLog).order_by(
        desc(AdminLog.timestamp)
    ).offset(offset).limit(limit).all()
    
    return logs


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get gamified leaderboard of top appreciators"""
    
    # Calculate appreciation score: sent shout-outs * 10 + received * 5 + reactions * 2 + comments * 1
    leaderboard = db.query(
        User.id,
        User.name,
        User.email,
        User.department,
        func.count(ShoutOut.id).label("sent_shoutouts")
    ).outerjoin(
        ShoutOut, User.id == ShoutOut.sender_id
    ).group_by(
        User.id
    ).all()
    
    result = []
    for user_id, name, email, department, sent_count in leaderboard:
        if sent_count is None:
            sent_count = 0
        
        received_count = db.query(func.count(ShoutOutRecipient.id)).filter(
            ShoutOutRecipient.recipient_id == user_id
        ).scalar() or 0
        
        reactions_count = db.query(func.count(Reaction.id)).filter(
            Reaction.user_id == user_id
        ).scalar() or 0
        
        comments_count = db.query(func.count(Comment.id)).filter(
            Comment.user_id == user_id
        ).scalar() or 0
        
        # Calculate score
        score = (sent_count * 10) + (received_count * 5) + (reactions_count * 2) + comments_count
        
        result.append({
            "user_id": user_id,
            "name": name,
            "email": email,
            "department": department or "N/A",
            "score": score,
            "sent_shoutouts": sent_count,
            "received_shoutouts": received_count,
            "reactions_given": reactions_count,
            "comments_made": comments_count
        })
    
    # Sort by score and return top N
    result.sort(key=lambda x: x["score"], reverse=True)
    return result[:limit]


@router.get("/users", response_model=List[dict])
def list_all_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Get list of all users (admin only)"""
    
    users = db.query(User).offset(offset).limit(limit).all()
    
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "joined_at": user.joined_at
        })
    
    return result


@router.post("/users/{user_id}/toggle-role", status_code=status.HTTP_200_OK)
def toggle_user_role(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Toggle user role between employee and admin"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="toggled_user_role",
        target_id=user_id,
        target_type="user"
    )
    
    # Toggle role
    new_role = RoleEnum.admin if user.role == RoleEnum.employee else RoleEnum.employee
    user.role = new_role
    
    db.add(admin_log)
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User role updated to {new_role.value}",
        "user_id": user_id,
        "new_role": new_role.value
    }


@router.post("/users/create", status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: CreateUserRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Create a new user (admin only)"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        department=user_data.department,
        role=user_data.role
    )
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="created_user",
        target_id=None,  # Will be updated after user is created
        target_type="user"
    )
    
    db.add(new_user)
    db.flush()  # Flush to get the new user ID
    admin_log.target_id = new_user.id
    db.add(admin_log)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "department": new_user.department,
        "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
        "joined_at": new_user.joined_at,
        "message": "User created successfully"
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Delete a user (admin only)"""
    
    # Prevent admin from deleting themselves
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log admin action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="deleted_user",
        target_id=user_id,
        target_type="user"
    )
    
    # Delete user (cascade will handle related records)
    db.delete(user)
    db.add(admin_log)
    db.commit()
    
    return {"message": f"User {user_id} deleted successfully"}

# ============ CSV EXPORT ENDPOINT ============

@router.get("/export/csv")
def export_all_data_csv(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """Export all platform data as CSV (admin only)"""
    
    # Create in-memory CSV file
    output = io.StringIO()
    
    # Get all data
    users = db.query(User).all()
    shoutouts = db.query(ShoutOut).all()
    comments = db.query(Comment).all()
    reactions = db.query(Reaction).all()
    reports = db.query(Report).all()
    
    # ===== Users CSV =====
    output.write("=== USERS DATA ===\n")
    users_csv = csv.writer(output)
    users_csv.writerow(["User ID", "Name", "Email", "Department", "Role", "Joined At"])
    for user in users:
        users_csv.writerow([
            user.id,
            user.name,
            user.email,
            user.department or "N/A",
            user.role.value if hasattr(user.role, 'value') else str(user.role),
            user.joined_at.strftime("%Y-%m-%d %H:%M:%S") if user.joined_at else "N/A"
        ])
    
    output.write("\n\n=== SHOUTOUTS DATA ===\n")
    shoutouts_csv = csv.writer(output)
    shoutouts_csv.writerow(["Shoutout ID", "Sender ID", "Sender Name", "Message", "Recipients Count", "Created At"])
    for shoutout in shoutouts:
        recipients_count = len(shoutout.recipients) if shoutout.recipients else 0
        sender_name = shoutout.sender.name if shoutout.sender else "Unknown"
        shoutouts_csv.writerow([
            shoutout.id,
            shoutout.sender_id,
            sender_name,
            shoutout.message[:100] + "..." if len(shoutout.message) > 100 else shoutout.message,
            recipients_count,
            shoutout.created_at.strftime("%Y-%m-%d %H:%M:%S") if shoutout.created_at else "N/A"
        ])
    
    output.write("\n\n=== COMMENTS DATA ===\n")
    comments_csv = csv.writer(output)
    comments_csv.writerow(["Comment ID", "Shoutout ID", "User ID", "User Name", "Comment Content", "Created At"])
    for comment in comments:
        user_name = comment.user.name if comment.user else "Unknown"
        comments_csv.writerow([
            comment.id,
            comment.shoutout_id,
            comment.user_id,
            user_name,
            comment.content[:100] + "..." if len(comment.content) > 100 else comment.content,
            comment.created_at.strftime("%Y-%m-%d %H:%M:%S") if comment.created_at else "N/A"
        ])
    
    output.write("\n\n=== REACTIONS DATA ===\n")
    reactions_csv = csv.writer(output)
    reactions_csv.writerow(["Reaction ID", "Shoutout ID", "User ID", "User Name", "Reaction Type"])
    for reaction in reactions:
        user_name = reaction.user.name if reaction.user else "Unknown"
        reactions_csv.writerow([
            reaction.id,
            reaction.shoutout_id,
            reaction.user_id,
            user_name,
            reaction.type
        ])
    
    output.write("\n\n=== REPORTS DATA ===\n")
    reports_csv = csv.writer(output)
    reports_csv.writerow(["Report ID", "Shoutout ID", "Reported By", "Reporter Name", "Reason", "Created At"])
    for report in reports:
        reporter_name = report.reporter.name if report.reporter else "Unknown"
        reports_csv.writerow([
            report.id,
            report.shoutout_id,
            report.reported_by,
            reporter_name,
            report.reason[:100] + "..." if len(report.reason) > 100 else report.reason,
            report.created_at.strftime("%Y-%m-%d %H:%M:%S") if report.created_at else "N/A"
        ])
    
    output.write("\n\n=== SUMMARY STATISTICS ===\n")
    stats_csv = csv.writer(output)
    stats_csv.writerow(["Metric", "Value"])
    stats_csv.writerow(["Total Users", len(users)])
    stats_csv.writerow(["Total Shoutouts", len(shoutouts)])
    stats_csv.writerow(["Total Comments", len(comments)])
    stats_csv.writerow(["Total Reactions", len(reactions)])
    stats_csv.writerow(["Total Reports", len(reports)])
    stats_csv.writerow(["Export Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    
    # Log the export action
    admin_log = AdminLog(
        admin_id=admin_user.id,
        action="exported_data_csv",
        target_id=0,
        target_type="system"
    )
    db.add(admin_log)
    db.commit()
    
    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bragboard_data_export.csv"}
    )