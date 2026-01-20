from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.shoutout import ShoutOut

from app.models.comments import Comment
from app.schemas.comments import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
)
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/comments", tags=["Comments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ CREATE COMMENT
@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_comment = Comment(
        shoutout_id=comment.shoutout_id,
        user_id=current_user.id,
        content=comment.content,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


# ✅ GET SINGLE COMMENT
@router.get("/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


# ✅ LIST COMMENTS FOR A SHOUTOUT
@router.get("/", response_model=list[CommentResponse])
def list_comments(
    shoutout_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Comment)
        .filter(Comment.shoutout_id == shoutout_id)
        .order_by(Comment.created_at.desc())
        .all()
    )


# ✅ UPDATE COMMENT
@router.patch("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.content = payload.content
    db.commit()
    db.refresh(comment)
    return comment


# ✅ DELETE COMMENT
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete")

    db.delete(comment)
    db.commit()
    return {"detail": "Comment deleted"}
