from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    department: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department: Optional[str] = None   
    joined_at: Optional[datetime] = None  

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ShoutOutCreate(BaseModel):
    message: str
    recipients: list[int]

class ReactionCreate(BaseModel):
    type: str  # like | clap | star


class CommentCreate(BaseModel):
    content: str

