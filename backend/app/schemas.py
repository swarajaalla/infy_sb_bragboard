from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str
    department: str | None = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str | None
    department: str | None
    role: Literal["employee", "admin"] = "employee"
    joined_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: int | None = None
    exp: int | None = None
# (end of schemas)