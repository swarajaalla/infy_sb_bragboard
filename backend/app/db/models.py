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
    notifications = relationship("Notification", back_populates="user")

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
    attachments = relationship("Attachment", back_populates="shoutout", cascade="all, delete-orphan")

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
    reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")
    reports = relationship("CommentReport", back_populates="comment", cascade="all, delete-orphan")

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
    action = Column(String(255), nullable=False)
    target_id = Column(Integer, nullable=False)
    target_type = Column(String(100), nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    admin = relationship("User", back_populates="admin_logs")


class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'image', 'emoji', 'file', etc.
    file_data = Column(Text, nullable=False)  # Base64 encoded file data
    file_size = Column(Integer)  # Size in bytes
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="attachments")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # 'report_resolved', 'post_deleted', etc.
    related_id = Column(Integer)  # ID of report, shoutout, etc.
    is_read = Column(Integer, default=0)  # 0 = unread, 1 = read
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class CommentReaction(Base):
    __tablename__ = "comment_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # 'heart', 'thumbs_up', 'clap'
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="reactions")
    user = relationship("User")


class CommentReport(Base):
    __tablename__ = "comment_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="reports")
    reporter = relationship("User")