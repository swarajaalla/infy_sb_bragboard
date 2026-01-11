from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    department = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ShoutOut(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    sender_id = Column(Integer, ForeignKey("users.id"))
    department = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
