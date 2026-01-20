from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"))
    reported_by = Column(Integer, ForeignKey("users.id"))
    reason = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending | resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
