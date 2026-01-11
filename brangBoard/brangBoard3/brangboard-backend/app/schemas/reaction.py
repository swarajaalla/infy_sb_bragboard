from pydantic import BaseModel

class ReactionCreate(BaseModel):
    shoutout_id: int
    type: str
