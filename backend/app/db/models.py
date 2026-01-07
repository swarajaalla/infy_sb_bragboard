from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Enum # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from sqlalchemy.sql import func # type: ignore
from app.db.database import Base
import enum

class RoleEnum(str, enum.Enum):
    employee = "employee"
    admin = "admin"

class ReactionTypeEnum(str, enum.Enum):
    heart = "heart"
    thumbs_up = "thumbs_up"
    clap = "clap"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    department = Column(String(100))
    role = Column(Enum(RoleEnum), default=RoleEnum.employee)
    joined_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    sent_shoutouts = relationship("ShoutOut", back_populates="sender", foreign_keys="ShoutOut.sender_id")
    received_shoutouts = relationship("ShoutOutRecipient", back_populates="recipient")
    comments = relationship("Comment", back_populates="user")
    reactions = relationship("Reaction", back_populates="user")
    reports = relationship("Report", back_populates="reporter")
    admin_logs = relationship("AdminLog", back_populates="admin")

class ShoutOut(Base):
    __tablename__ = "shoutouts"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    sender = relationship("User", back_populates="sent_shoutouts", foreign_keys=[sender_id])
    recipients = relationship("ShoutOutRecipient", back_populates="shoutout", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="shoutout", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="shoutout", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="shoutout", cascade="all, delete-orphan")

class ShoutOutRecipient(Base):
    __tablename__ = "shoutout_recipients"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="recipients")
    recipient = relationship("User", back_populates="received_shoutouts")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # Changed from Enum to String
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="reports")
    reporter = relationship("User", back_populates="reports")

class AdminLog(Base):
    __tablename__ = "admin_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Text, nullable=False)
    target_id = Column(Integer)
    target_type = Column(String(50))
    timestamp = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    admin = relationship("User", back_populates="admin_logs")