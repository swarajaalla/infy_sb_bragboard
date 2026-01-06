# app/crud.py
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from collections import defaultdict

from . import models, schemas


# =======================
# Users CRUD
# =======================

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(
    db: Session,
    user: schemas.UserCreate,
    hashed_password: str
) -> models.User:
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        department=user.department,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users_by_department(db: Session, department: str) -> List[models.User]:
    return db.query(models.User).filter(models.User.department == department).all()


def get_all_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()


def get_users_grouped_by_department(db: Session):
    users = get_all_users(db)
    grouped = defaultdict(list)
    for u in users:
        grouped[u.department or "Unknown"].append(u)
    return dict(grouped)


# =======================
# ShoutOuts CRUD
# =======================

def create_shoutout(
    db: Session,
    sender_id: int,
    message: str
) -> models.ShoutOut:
    shoutout = models.ShoutOut(
        sender_id=sender_id,
        message=message
    )
    db.add(shoutout)
    db.commit()
    db.refresh(shoutout)
    return shoutout


def add_shoutout_recipients(
    db: Session,
    shoutout_id: int,
    recipient_ids: List[int]
):
    for rid in recipient_ids:
        db.add(
            models.ShoutOutRecipient(
                shoutout_id=shoutout_id,
                recipient_id=rid
            )
        )
    db.commit()


# =======================
# Comments CRUD  ✅ NEW
# =======================

def create_comment(
    db: Session,
    shoutout_id: int,
    user_id: int,
    content: str
) -> models.Comment:
    comment = models.Comment(
        shoutout_id=shoutout_id,
        user_id=user_id,
        content=content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comment_by_id(
    db: Session,
    comment_id: int
) -> Optional[models.Comment]:
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()


def get_comments_by_shoutout(
    db: Session,
    shoutout_id: int
) -> List[models.Comment]:
    return (
        db.query(models.Comment)
        .filter(models.Comment.shoutout_id == shoutout_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


def update_comment(
    db: Session,
    comment: models.Comment,
    content: str
) -> models.Comment:
    comment.content = content
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(
    db: Session,
    comment: models.Comment
):
    db.delete(comment)
    db.commit()


# Reactions CRUD

def get_reaction_by_user_and_shoutout(
    db: Session,
    user_id: int,
    shoutout_id: int
) -> Optional[models.Reaction]:
    return (
        db.query(models.Reaction)
        .filter(
            models.Reaction.user_id == user_id,
            models.Reaction.shoutout_id == shoutout_id
        )
        .first()
    )


def create_or_update_reaction(
    db: Session,
    user_id: int,
    shoutout_id: int,
    reaction_type: str
) -> models.Reaction:
    reaction = get_reaction_by_user_and_shoutout(db, user_id, shoutout_id)

    if reaction:
        # Update existing reaction
        reaction.type = reaction_type
    else:
        # Create new reaction
        reaction = models.Reaction(
            user_id=user_id,
            shoutout_id=shoutout_id,
            type=reaction_type
        )
        db.add(reaction)

    db.commit()
    db.refresh(reaction)
    return reaction


def get_reactions_by_shoutout(
    db: Session,
    shoutout_id: int
) -> List[models.Reaction]:
    return (
        db.query(models.Reaction)
        .filter(models.Reaction.shoutout_id == shoutout_id)
        .all()
    )


def delete_reaction(
    db: Session,
    reaction: models.Reaction
):
    db.delete(reaction)
    db.commit()
