from fastapi import APIRouter, Depends, HTTPException, status, Query  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import and_, or_, desc  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.db.models import ShoutOut, ShoutOutRecipient, User, Comment, Reaction, Report, Attachment
from app.api.auth import get_current_user

router = APIRouter(prefix="/shoutouts", tags=["ShoutOuts"])

# Pydantic Schemas
class UserForTag(BaseModel):
    id: int
    name: str
    email: str
    department: str
    
    class Config:
        from_attributes = True

class AttachmentResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_data: str
    file_size: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ShoutOutRecipientResponse(BaseModel):
    id: int
    recipient: UserForTag
    
    class Config:
        from_attributes = True

class SenderResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    
    class Config:
        from_attributes = True

class CommentUserResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: int
    content: str
    user: CommentUserResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReactionResponse(BaseModel):
    id: int
    type: str
    user: CommentUserResponse
    
    class Config:
        from_attributes = True

class CreateShoutOut(BaseModel):
    message: str
    recipient_ids: List[int]
    attachments: Optional[List[dict]] = None  # List of {file_name, file_type, file_data, file_size}

class CreateComment(BaseModel):
    content: str

class ShoutOutResponse(BaseModel):
    id: int
    sender: SenderResponse
    message: str
    recipients: List[ShoutOutRecipientResponse]
    created_at: datetime
    comments: List[CommentResponse] = []
    reactions: List[ReactionResponse] = []
    attachments: List[AttachmentResponse] = []
    
    class Config:
        from_attributes = True

# Search users for tagging
@router.get("/users/search", response_model=List[UserForTag])
def search_users(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for users to tag in shout-out"""
    users = db.query(User).filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%")
        )
    ).limit(10).all()
    return users

# Get all users (public endpoint)
@router.get("/users/all", response_model=List[UserForTag])
def get_all_users(
    db: Session = Depends(get_db)
):
    """Get all users in the system (public)"""
    users = db.query(User).order_by(User.department, User.name).all()
    return users

# Create shout-out
@router.post("/", response_model=ShoutOutResponse, status_code=status.HTTP_201_CREATED)
def create_shoutout(
    shoutout_data: CreateShoutOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new shout-out with tagged recipients and optional attachments"""
    
    if not shoutout_data.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )
    
    if not shoutout_data.recipient_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one recipient must be tagged"
        )
    
    # Verify all recipients exist
    recipients = db.query(User).filter(User.id.in_(shoutout_data.recipient_ids)).all()
    if len(recipients) != len(shoutout_data.recipient_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more recipients not found"
        )
    
    # Create shout-out
    new_shoutout = ShoutOut(
        sender_id=current_user.id,
        message=shoutout_data.message
    )
    db.add(new_shoutout)
    db.flush()
    
    # Add recipients
    for recipient_id in shoutout_data.recipient_ids:
        recipient = ShoutOutRecipient(
            shoutout_id=new_shoutout.id,
            recipient_id=recipient_id
        )
        db.add(recipient)
    
    # Add attachments if provided
    if shoutout_data.attachments:
        for attachment_data in shoutout_data.attachments:
            attachment = Attachment(
                shoutout_id=new_shoutout.id,
                file_name=attachment_data.get("file_name", "attachment"),
                file_type=attachment_data.get("file_type", "file"),
                file_data=attachment_data.get("file_data", ""),
                file_size=attachment_data.get("file_size")
            )
            db.add(attachment)
    
    db.commit()
    db.refresh(new_shoutout)
    
    return new_shoutout

# ============ LITERAL ROUTES (more specific, must come before {id} routes) ============

# Get all shout-outs with filters
@router.get("/", response_model=List[ShoutOutResponse])
def get_shoutouts(
    sender_id: Optional[int] = Query(None),
    recipient_id: Optional[int] = Query(None),
    department: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all shout-outs with optional filters"""
    
    query = db.query(ShoutOut)
    
    # Filter by sender
    if sender_id:
        query = query.filter(ShoutOut.sender_id == sender_id)
    
    # Filter by department (sender's department) - use explicit join
    if department and department.strip():
        query = query.join(User, ShoutOut.sender_id == User.id, isouter=False).filter(
            User.department == department.strip()
        )
    
    # Filter by recipient
    if recipient_id:
        query = query.join(ShoutOutRecipient, isouter=False).filter(
            ShoutOutRecipient.recipient_id == recipient_id
        )
    
    # Order by most recent first
    query = query.order_by(desc(ShoutOut.created_at))
    
    shoutouts = query.offset(offset).limit(limit).all()
    
    return shoutouts

# Get shout-outs for current user (received)
@router.get("/my/received", response_model=List[ShoutOutResponse])
def get_my_shoutouts(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shout-outs received by current user"""
    
    shoutouts = db.query(ShoutOut).join(
        ShoutOutRecipient
    ).filter(
        ShoutOutRecipient.recipient_id == current_user.id
    ).order_by(desc(ShoutOut.created_at)).offset(offset).limit(limit).all()
    
    return shoutouts

# Get shout-outs sent by current user
@router.get("/my/sent", response_model=List[ShoutOutResponse])
def get_my_sent_shoutouts(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shout-outs sent by current user"""
    
    shoutouts = db.query(ShoutOut).filter(
        ShoutOut.sender_id == current_user.id
    ).order_by(desc(ShoutOut.created_at)).offset(offset).limit(limit).all()
    
    return shoutouts

# Get all departments for filtering
@router.get("/departments/all", response_model=List[str])
def get_all_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unique departments in the system"""
    departments = db.query(User.department).distinct().all()
    return sorted([d[0] for d in departments if d[0]])

# ============ COMMENTS ENDPOINTS (more specific than generic {id} routes) ============

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only by comment author or admin)"""
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check authorization - allow if user is comment author OR is admin
    user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    
    if comment.user_id != current_user.id and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    db.delete(comment)
    db.commit()

# Report a comment
@router.post("/comments/{comment_id}/report", status_code=status.HTTP_201_CREATED)
def report_comment(
    comment_id: int,
    reason: str = Query(..., min_length=5, max_length=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a comment for violation"""
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user already reported this comment
    from app.db.models import CommentReport
    existing_report = db.query(CommentReport).filter(
        CommentReport.comment_id == comment_id,
        CommentReport.reported_by == current_user.id
    ).first()
    
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reported this comment"
        )
    
    new_report = CommentReport(
        comment_id=comment_id,
        reported_by=current_user.id,
        reason=reason.strip()
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return {
        "id": new_report.id,
        "message": "Comment reported successfully"
    }

# React to a comment
@router.post("/comments/{comment_id}/react/{reaction_type}", status_code=status.HTTP_201_CREATED)
def react_to_comment(
    comment_id: int,
    reaction_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a reaction to a comment"""
    
    # Verify reaction type
    valid_types = ["heart", "thumbs_up", "clap"]
    if reaction_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reaction type. Must be one of: {', '.join(valid_types)}"
        )
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user already reacted with this type
    from app.db.models import CommentReaction
    existing_reaction = db.query(CommentReaction).filter(
        CommentReaction.comment_id == comment_id,
        CommentReaction.user_id == current_user.id,
        CommentReaction.type == reaction_type
    ).first()
    
    if existing_reaction:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already reacted with this emoji"
        )
    
    new_reaction = CommentReaction(
        comment_id=comment_id,
        user_id=current_user.id,
        type=reaction_type
    )
    
    db.add(new_reaction)
    db.commit()
    
    return {"message": "Reaction added successfully"}

# Remove reaction from comment
@router.delete("/comments/{comment_id}/react/{reaction_type}", status_code=status.HTTP_204_NO_CONTENT)
def remove_comment_reaction(
    comment_id: int,
    reaction_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a reaction from a comment"""
    
    # Verify reaction type
    valid_types = ["heart", "thumbs_up", "clap"]
    if reaction_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reaction type. Must be one of: {', '.join(valid_types)}"
        )
    
    reaction = db.query(CommentReaction).filter(
        CommentReaction.comment_id == comment_id,
        CommentReaction.user_id == current_user.id,
        CommentReaction.type == reaction_type
    ).first()
    
    if not reaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reaction not found"
        )
    
    db.delete(reaction)
    db.commit()

# POST comment
@router.post("/{shoutout_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    shoutout_id: int,
    comment_data: CreateComment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a shout-out"""
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    if not comment_data.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment cannot be empty"
        )
    
    new_comment = Comment(
        shoutout_id=shoutout_id,
        user_id=current_user.id,
        content=comment_data.content.strip()
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment

# GET comments
@router.get("/{shoutout_id}/comments", response_model=List[CommentResponse])
def get_comments(
    shoutout_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a shout-out"""
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    comments = db.query(Comment).filter(
        Comment.shoutout_id == shoutout_id
    ).order_by(desc(Comment.created_at)).offset(offset).limit(limit).all()
    
    return comments

# POST reaction
@router.post("/{shoutout_id}/react/{reaction_type}", status_code=status.HTTP_201_CREATED)
def add_reaction(
    shoutout_id: int,
    reaction_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a reaction to a shout-out"""
    
    # Verify reaction type
    valid_types = ["heart", "thumbs_up", "clap"]
    if reaction_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reaction type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    # Check if user already reacted with this type
    existing = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.user_id == current_user.id,
        Reaction.type == reaction_type
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already reacted with this type"
        )
    
    new_reaction = Reaction(
        shoutout_id=shoutout_id,
        user_id=current_user.id,
        type=reaction_type
    )
    
    db.add(new_reaction)
    db.commit()
    
    return {"message": "Reaction added successfully"}

# DELETE reaction (must come before generic DELETE /{id})
@router.delete("/{shoutout_id}/react/{reaction_type}", status_code=status.HTTP_204_NO_CONTENT)
def remove_reaction(
    shoutout_id: int,
    reaction_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a reaction from a shout-out"""
    
    # Verify reaction type
    valid_types = ["heart", "thumbs_up", "clap"]
    if reaction_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reaction type. Must be one of: {', '.join(valid_types)}"
        )
    
    reaction = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.user_id == current_user.id,
        Reaction.type == reaction_type
    ).first()
    
    if not reaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reaction not found"
        )
    
    db.delete(reaction)
    db.commit()
    
    return None

# GET reactions
@router.get("/{shoutout_id}/reactions", response_model=List[ReactionResponse])
def get_reactions(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reactions for a shout-out"""
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    reactions = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id
    ).all()
    
    return reactions

# POST report
@router.post("/{shoutout_id}/report", status_code=status.HTTP_201_CREATED)
def report_shoutout(
    shoutout_id: int,
    reason: str = Query(..., min_length=5, max_length=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a shout-out for inappropriate content"""
    
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
    
    return {
        "id": new_report.id,
        "message": "Shout-out reported successfully",
        "report_id": new_report.id
    }

# GET reports
@router.get("/{shoutout_id}/reports")
def get_shoutout_reports(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get report count for a shout-out (shown to admins)"""
    
    # Verify shout-out exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    # Check if user is admin to see detailed reports
    is_admin = current_user.get("role") == "admin"
    
    reports = db.query(Report).filter(
        Report.shoutout_id == shoutout_id
    ).all()
    
    if is_admin:
        return {
            "shoutout_id": shoutout_id,
            "report_count": len(reports),
            "reports": [
                {
                    "id": r.id,
                    "reported_by": r.reported_by,
                    "reason": r.reason,
                    "created_at": r.created_at
                }
                for r in reports
            ]
        }
    else:
        return {
            "shoutout_id": shoutout_id,
            "report_count": len(reports)
        }

# DELETE shout-out (GENERIC, must come LAST)
@router.delete("/{shoutout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a shout-out (only the creator can delete)"""
    
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    # Only allow the sender to delete
    if shoutout.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own shout-outs"
        )
    
    db.delete(shoutout)
    db.commit()

# GET single shout-out (GENERIC, after DELETE but before end)
@router.get("/{shoutout_id}", response_model=ShoutOutResponse)
def get_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific shout-out"""
    
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shout-out not found"
        )
    
    return shoutout
