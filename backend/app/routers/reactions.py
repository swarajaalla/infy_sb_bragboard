from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from .. import schemas, crud, models

router = APIRouter(
    prefix="/api/reactions",
    tags=["reactions"]
)

VALID_REACTIONS = {"like", "clap", "star"}

# ---------------------------------
# POST /reactions → Add / Update reaction
# ---------------------------------
@router.post("", response_model=schemas.ReactionResponse)
def add_reaction(
    reaction_in: schemas.ReactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if reaction_in.type not in VALID_REACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid reaction type. Allowed: like, clap, star"
        )

    shoutout = (
        db.query(models.ShoutOut)
        .filter(models.ShoutOut.id == reaction_in.shoutout_id)
        .first()
    )
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    reaction = crud.create_or_update_reaction(
        db=db,
        user_id=current_user.id,
        shoutout_id=reaction_in.shoutout_id,
        reaction_type=reaction_in.type
    )

    return {
        "id": reaction.id,
        "shoutout_id": reaction.shoutout_id,
        "type": reaction.type,
        "created_at": reaction.created_at,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "department": current_user.department
        }
    }


# ---------------------------------
# GET /reactions?shoutout_id={id}
# ---------------------------------
@router.get("")
def list_reactions(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reactions = crud.get_reactions_by_shoutout(db, shoutout_id)

    counts = {"like": 0, "clap": 0, "star": 0}
    user_reaction = None

    for r in reactions:
        counts[r.type] += 1
        if r.user_id == current_user.id:
            user_reaction = r.type

    return {
        "shoutout_id": shoutout_id,
        "counts": counts,
        "current_user_reaction": user_reaction
    }


# ---------------------------------
# DELETE /reactions/{reaction_id}
# ---------------------------------
@router.delete("/{reaction_id}", status_code=204)
def delete_reaction(
    reaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reaction = (
        db.query(models.Reaction)
        .filter(models.Reaction.id == reaction_id)
        .first()
    )
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    if reaction.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this reaction"
        )

    crud.delete_reaction(db, reaction)
    return None
