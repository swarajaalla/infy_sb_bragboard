from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate

router = APIRouter(prefix="/comments", tags=["Comments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def add_comment(data: CommentCreate, user_id: int, db: Session = Depends(get_db)):
    comment = Comment(
        shoutout_id=data.shoutout_id,
        user_id=user_id,
        text=data.text
    )
    db.add(comment)
    db.commit()
    return {"message": "Comment added"}

@router.get("/{shoutout_id}")
def get_comments(shoutout_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(Comment.text, User.name)
        .join(User, User.id == Comment.user_id)
        .filter(Comment.shoutout_id == shoutout_id)
        .order_by(Comment.created_at)
        .all()
    )

    return [{"user": r[1], "text": r[0]} for r in results]
