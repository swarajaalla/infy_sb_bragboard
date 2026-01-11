from sqlalchemy.orm import Session
from app.models.shoutout import ShoutOut
from app.models.shoutout_recipient import ShoutOutRecipient

def create_shoutout(db: Session, sender_id: int, message: str, recipients: list[int]):
    shoutout = ShoutOut(
        message=message,
        sender_id=sender_id
    )
    db.add(shoutout)
    db.commit()
    db.refresh(shoutout)

    for rid in recipients:
        db.add(
            ShoutOutRecipient(
                shoutout_id=shoutout.id,
                recipient_id=rid
            )
        )

    db.commit()
    return shoutout


def delete_shoutout(db: Session, shoutout_id: int):
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if shoutout:
        db.delete(shoutout)
        db.commit()

