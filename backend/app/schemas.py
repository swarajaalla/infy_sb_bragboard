from pydantic import BaseModel, EmailStr
from typing import Literal, List
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


class ShoutOutCreate(BaseModel):
    message: str
    recipient_ids: list[int] | None = []


class ShoutOutOut(BaseModel):
    id: int
    message: str
    created_at: datetime
    author: UserOut
    recipients: List[UserOut]

    class Config:
        from_attributes = True


class ReactionCreate(BaseModel):
    reaction_type: Literal["like", "clap", "star"]


class ReactionOut(BaseModel):
    id: int
    shoutout_id: int
    user_id: int
    reaction_type: Literal["like", "clap", "star"]
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: int | None = None


class CommentOut(BaseModel):
    id: int
    shoutout_id: int
    user_id: int
    parent_id: int | None
    content: str
    created_at: datetime
    updated_at: datetime | None
    author: UserOut

    class Config:
        from_attributes = True


class ShoutOutWithReactionsAndComments(BaseModel):
    id: int
    message: str
    created_at: datetime
    author: UserOut
    recipients: List[UserOut]
    reactions: dict[str, int]  # {"like": 5, "clap": 3, "star": 2}
    user_reaction: str | None  # Current user's reaction if any
    comments: List[CommentOut]

    class Config:
        from_attributes = True
        orm_mode = True 