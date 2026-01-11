from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.reaction import Reaction
from app.schemas.reaction import ReactionCreate

router = APIRouter(prefix="/reactions", tags=["Reactions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def react(data: ReactionCreate, user_id: int, db: Session = Depends(get_db)):
    existing = (
        db.query(Reaction)
        .filter(
            Reaction.shoutout_id == data.shoutout_id,
            Reaction.user_id == user_id
        )
        .first()
    )

    # 🔁 TOGGLE OFF
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Reaction removed"}

    # ✅ ADD REACTION
    reaction = Reaction(
        shoutout_id=data.shoutout_id,
        user_id=user_id,
        type=data.type
    )
    db.add(reaction)
    db.commit()
    return {"message": "Reaction added"}

@router.get("/{shoutout_id}")
def get_reactions(shoutout_id: int, db: Session = Depends(get_db)):
    reactions = (
        db.query(Reaction.type)
        .filter(Reaction.shoutout_id == shoutout_id)
        .all()
    )

    counts = {}
    for r in reactions:
        counts[r[0]] = counts.get(r[0], 0) + 1

    return counts
