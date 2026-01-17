from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = "../.env"  # path from backend/app/ to project root

settings = Settings()


def create_report(
    db: Session,
    shoutout_id: int,
    reported_by: int,
    reason: str
):
    report = models.Report(
        shoutout_id=shoutout_id,
        reported_by=reported_by,
        reason=reason
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_reports(db: Session):
    return (
        db.query(models.Report)
        .order_by(models.Report.created_at.desc())
        .all()
    )


def resolve_report(db: Session, report: models.Report):
    report.resolved = True
    db.commit()
    db.refresh(report)
    return report
