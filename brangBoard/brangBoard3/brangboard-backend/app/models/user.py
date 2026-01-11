from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    department = Column(String(100))
    role = Column(String(20), default="employee")
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # ✅ ONLY back_populates (NO backref)
    sent_shoutouts = relationship(
        "ShoutOut",
        back_populates="sender",
        cascade="all, delete-orphan"
    )
