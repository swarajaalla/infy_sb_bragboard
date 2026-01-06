from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..auth import get_current_user
from .. import schemas, crud, models

router = APIRouter(
    prefix="/api/comments",
    tags=["comments"]
)


@router.post("", response_model=schemas.CommentResponse)
def create_comment(
    comment_in: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not comment_in.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    # Check shoutout exists
    shoutout = (
        db.query(models.ShoutOut)
        .filter(models.ShoutOut.id == comment_in.shoutout_id)
        .first()
    )
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    comment = crud.create_comment(
        db=db,
        shoutout_id=comment_in.shoutout_id,
        user_id=current_user.id,
        content=comment_in.content
    )

    return {
        "id": comment.id,
        "shoutout_id": comment.shoutout_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "department": current_user.department
        }
    }



@router.get("/{comment_id}", response_model=schemas.CommentResponse)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return {
        "id": comment.id,
        "shoutout_id": comment.shoutout_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "user": {
            "id": comment.user.id,
            "name": comment.user.name,
            "department": comment.user.department
        }
    }



@router.get("", response_model=List[schemas.CommentResponse])
def list_comments(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comments = crud.get_comments_by_shoutout(db, shoutout_id)

    return [
        {
            "id": c.id,
            "shoutout_id": c.shoutout_id,
            "content": c.content,
            "created_at": c.created_at,
            "user": {
                "id": c.user.id,
                "name": c.user.name,
                "department": c.user.department
            }
        }
        for c in comments
    ]



@router.patch("/{comment_id}", response_model=schemas.CommentResponse)
def update_comment(
    comment_id: int,
    comment_in: schemas.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )

    if not comment_in.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    updated = crud.update_comment(
        db=db,
        comment=comment,
        content=comment_in.content
    )

    return {
        "id": updated.id,
        "shoutout_id": updated.shoutout_id,
        "content": updated.content,
        "created_at": updated.created_at,
        "user": {
            "id": updated.user.id,
            "name": updated.user.name,
            "department": updated.user.department
        }
    }



@router.delete("/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    crud.delete_comment(db, comment)
    return None
