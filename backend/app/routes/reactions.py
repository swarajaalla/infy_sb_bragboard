from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.models.reactions import Reaction
from app.schemas.reactions import ReactionCreate, ReactionResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reactions", tags=["Reactions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- ADD REACTION ----------------
@router.post("/", response_model=ReactionResponse)
def add_reaction(
    reaction: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Reaction).filter_by(
        user_id=current_user.id,
        shoutout_id=reaction.shoutout_id,
        type=reaction.type
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Reaction already exists")

    new_reaction = Reaction(
        user_id=current_user.id,
        shoutout_id=reaction.shoutout_id,
        type=reaction.type
    )

    db.add(new_reaction)
    db.commit()
    db.refresh(new_reaction)
    return new_reaction


# ---------------- LIST REACTIONS ----------------
@router.get("/", response_model=List[ReactionResponse])
def list_reactions(
    shoutout_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id
    ).all()


# ---------------- DELETE REACTION ----------------
@router.delete("/{reaction_id}")
def delete_reaction(
    reaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reaction = db.query(Reaction).filter(
        Reaction.id == reaction_id,
        Reaction.user_id == current_user.id
    ).first()

    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    db.delete(reaction)
    db.commit()
    return {"detail": "Reaction deleted"}
