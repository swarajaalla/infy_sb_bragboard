from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas, crud

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"]
)


@router.post("", response_model=schemas.ReportOut)
def report_shoutout(
    report_in: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    shoutout = (
        db.query(models.ShoutOut)
        .filter(models.ShoutOut.id == report_in.shoutout_id)
        .first()
    )

    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    if shoutout.sender_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot report your own shout-out"
        )

    report = crud.create_report(
        db=db,
        shoutout_id=report_in.shoutout_id,
        reported_by=current_user.id,
        reason=report_in.reason
    )

    return {
        "id": report.id,
        "shoutout_id": report.shoutout_id,
        "reason": report.reason,
        "resolved": report.resolved,
        "created_at": report.created_at,
        "reported_by": {
            "id": current_user.id,
            "name": current_user.name
        }
    }


@router.get("", response_model=list[schemas.ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    reports = crud.get_reports(db)

    return [
        {
            "id": r.id,
            "shoutout_id": r.shoutout_id,
            "reason": r.reason,
            "resolved": r.resolved,
            "created_at": r.created_at,
            "reported_by": {
                "id": r.reporter.id,
                "name": r.reporter.name
            }
        }
        for r in reports
    ]


@router.patch("/{report_id}/resolve", status_code=204)
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    report = db.query(models.Report).filter(models.Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    crud.resolve_report(db, report)
    return None
