from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import relationship
import enum

# Enum for user roles
class RoleEnum(str, enum.Enum):
    employee = "employee"
    admin = "admin"

# User table model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    department = Column(String, nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.employee)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

class ShoutOut(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User")
    recipients = relationship(
        "ShoutOutRecipient",
        back_populates="shoutout",
        cascade="all, delete"
    )


class ShoutOutRecipient(Base):
    __tablename__ = "shoutout_recipients"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    shoutout = relationship("ShoutOut", back_populates="recipients")
    recipient = relationship("User")


# Comments
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(
        Integer,
        ForeignKey("shoutouts.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    shoutout = relationship("ShoutOut")


# Reactions

class ReactionType(str, enum.Enum):
    like = "like"
    clap = "clap"
    star = "star"


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(
        Integer,
        ForeignKey("shoutouts.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    type = Column(Enum(ReactionType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        # One reaction per user per shout-out
        {'sqlite_autoincrement': True},
    )

    # Relationships
    user = relationship("User")
    shoutout = relationship("ShoutOut")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(
        Integer,
        ForeignKey("shoutouts.id", ondelete="CASCADE"),
        nullable=False
    )
    reported_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    reason = Column(Text, nullable=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    shoutout = relationship("ShoutOut")
    reporter = relationship("User")
