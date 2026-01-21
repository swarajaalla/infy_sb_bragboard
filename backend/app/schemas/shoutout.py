from pydantic import BaseModel
from datetime import datetime
from typing import List,Optional

from app.schemas.reactions import ReactionResponse

# ---------------- BASIC USER INFO ----------------
class UserMini(BaseModel):
    id: int
    name: str
    department: str | None

    class Config:
        from_attributes = True


# ---------------- CREATE SHOUTOUT ----------------
class ShoutOutCreate(BaseModel):
    to_user_id: int
    message: str
    attachment_url: Optional[str] = None  # <-- new optional field

# ---------------- SIMPLE RESPONSE ----------------
class ShoutOutResponse(BaseModel):
    id: int
    message: str
    attachment_url: Optional[str] = None  # ✅ ADD THIS
    created_at: datetime
    from_user: UserMini
    reactions: list[ReactionResponse]
    comment_count: int

    class Config:
        from_attributes = True


# ---------------- FEED RESPONSE ----------------
class ShoutOutFeedResponse(BaseModel):
    id: int
    message: str
    created_at: datetime
    from_user: UserMini
    to_user: UserMini
    reactions: list[ReactionResponse] = []  # ✅ ADD

    class Config:
        from_attributes = True
