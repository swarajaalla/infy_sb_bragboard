# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    role: str  # 'employee' or 'admin'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: Optional[str] = None
    role: str
    joined_at: datetime

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

from typing import List

class ShoutOutCreate(BaseModel):
    message: str
    recipient_ids: List[int]


class ShoutOutResponse(BaseModel):
    status: str
    shoutout_id: int
    created_at: datetime

class CommentCreate(BaseModel):
    shoutout_id: int
    content: str


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    shoutout_id: int
    content: str
    created_at: datetime
    user: dict

    model_config = {
        "from_attributes": True
    }

# Reactions Schemas


class ReactionCreate(BaseModel):
    shoutout_id: int
    type: str  # like | clap | star


class ReactionResponse(BaseModel):
    id: int
    shoutout_id: int
    type: str
    created_at: datetime
    user: dict

    model_config = {
        "from_attributes": True
    }
