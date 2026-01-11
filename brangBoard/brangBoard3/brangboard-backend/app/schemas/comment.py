from pydantic import BaseModel

class CommentCreate(BaseModel):
    shoutout_id: int
    text: str
