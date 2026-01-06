from sqlalchemy.orm import Session
from . import models


def get_users_by_department(db: Session, department: str):
    return db.query(models.User).filter(
        models.User.department == department
    ).all()


def get_users_grouped_by_department(db: Session):
    users = db.query(models.User).all()
    grouped = {}

    for user in users:
        grouped.setdefault(user.department, []).append(user)

    return grouped
