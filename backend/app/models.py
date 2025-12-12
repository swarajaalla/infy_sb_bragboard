from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from .database import Base
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
