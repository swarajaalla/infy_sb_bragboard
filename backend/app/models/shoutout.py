from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base
from app.models.reactions import Reaction

from app.models.comments import Comment



class ShoutOut(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)

    from_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    to_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    message = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    from_user = relationship(
        "User",
        foreign_keys=[from_user_id],
        backref="sent_shoutouts"
    )

    to_user = relationship(
        "User",
        foreign_keys=[to_user_id],
        backref="received_shoutouts"
    )

# ✅ ADD THIS
    reactions = relationship(
        "Reaction",
        cascade="all, delete",
        lazy="joined"
    )

    # ✅ ADD THIS BELOW reactions
    comments = relationship(
        "Comment",
        cascade="all, delete",
        lazy="select"
    )
