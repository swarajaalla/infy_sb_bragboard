from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.shoutout import ShoutOutCreate
from app.services.shoutout_service import create_shoutout, delete_shoutout
from app.models.shoutout import ShoutOut
from app.models.user import User
from app.models.shoutout_recipient import ShoutOutRecipient

# ✅ ROUTER MUST BE DEFINED FIRST
router = APIRouter(prefix="/shoutouts", tags=["ShoutOuts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def post_shoutout(
    data: ShoutOutCreate,
    db: Session = Depends(get_db)
):
    return create_shoutout(
        db=db,
        sender_id=data.sender_id,
        message=data.message,
        recipients=data.recipient_ids
    )


@router.get("/")
def get_feed(db: Session = Depends(get_db)):
    shoutouts = db.query(ShoutOut).order_by(ShoutOut.created_at.desc()).all()
    feed = []

    for s in shoutouts:
        recipients = (
            db.query(User.name)
            .join(
                ShoutOutRecipient,
                ShoutOutRecipient.recipient_id == User.id
            )
            .filter(ShoutOutRecipient.shoutout_id == s.id)
            .all()
        )

        feed.append({
            "id": s.id,
            "message": s.message,
            "sender": s.sender.name,
            "recipients": [r[0] for r in recipients],
            "created_at": s.created_at
        })

    return feed


@router.delete("/{shoutout_id}")
def remove_shoutout(shoutout_id: int, db: Session = Depends(get_db)):
    delete_shoutout(db, shoutout_id)
    return {"message": "Shout-out deleted"}
