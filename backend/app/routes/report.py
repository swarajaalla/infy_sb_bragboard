from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.report import Report
from app.models.shoutout import ShoutOut
from app.models.user import User

router = APIRouter(
    prefix="/shoutouts",
    tags=["Reports"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{shoutout_id}/report", status_code=status.HTTP_200_OK)
def report_shoutout(
    shoutout_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("✅ CORRECT REPORT ENDPOINT HIT")

    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shoutout not found"
        )

    existing = db.query(Report).filter(
        Report.shoutout_id == shoutout_id,
        Report.reported_by == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already reported"
        )

    report = Report(
        shoutout_id=shoutout_id,
        reported_by=current_user.id,
        reason=reason
    )

    db.add(report)
    db.commit()

    return {"message": "Shoutout reported successfully"}
