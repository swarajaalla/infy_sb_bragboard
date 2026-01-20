from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    shoutout_id: int
    content: str

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    shoutout_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
