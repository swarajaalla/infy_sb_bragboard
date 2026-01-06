from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from .. import schemas, crud, models

router = APIRouter(
    prefix="/api/shoutouts",
    tags=["shoutouts"]
)

@router.post("", response_model=schemas.ShoutOutResponse)
def create_shoutout(
    shoutout_in: schemas.ShoutOutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not shoutout_in.message.strip():
        raise HTTPException(status_code=400, detail="Shout-out message cannot be empty")

    if not shoutout_in.recipient_ids:
        raise HTTPException(status_code=400, detail="At least one recipient must be selected")

    recipients = (
        db.query(models.User)
        .filter(models.User.id.in_(shoutout_in.recipient_ids))
        .all()
    )

    if len(recipients) != len(shoutout_in.recipient_ids):
        raise HTTPException(status_code=400, detail="One or more recipients do not exist")

    shoutout = crud.create_shoutout(
        db=db,
        sender_id=current_user.id,
        message=shoutout_in.message
    )

    crud.add_shoutout_recipients(
        db=db,
        shoutout_id=shoutout.id,
        recipient_ids=shoutout_in.recipient_ids
    )

    return {
        "status": "success",
        "shoutout_id": shoutout.id,
        "created_at": shoutout.created_at
    }


@router.get("")
def get_shoutouts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Global feed: returns ALL shout-outs.
    Segregation is handled on the frontend.
    """

    shoutouts = (
        db.query(models.ShoutOut)
        .order_by(models.ShoutOut.created_at.desc())
        .all()
    )

    response = []

    for s in shoutouts:
        sender = db.query(models.User).filter(models.User.id == s.sender_id).first()

        recipients = (
            db.query(models.User)
            .join(models.ShoutOutRecipient)
            .filter(models.ShoutOutRecipient.shoutout_id == s.id)
            .all()
        )

        response.append({
            "id": s.id,
            "message": s.message,
            "created_at": s.created_at,
            "sender": {
                "id": sender.id,
                "name": sender.name,
                "department": sender.department
            } if sender else None,
            "recipients": [
                {
                    "id": r.id,
                    "name": r.name,
                    "department": r.department
                }
                for r in recipients
            ]
        })

    return response
