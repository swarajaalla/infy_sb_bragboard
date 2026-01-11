from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base


class ShoutOutRecipient(Base):
    __tablename__ = "shoutout_recipients"

    id = Column(Integer, primary_key=True)
    shoutout_id = Column(
        Integer,
        ForeignKey("shoutouts.id", ondelete="CASCADE")
    )
    recipient_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )
