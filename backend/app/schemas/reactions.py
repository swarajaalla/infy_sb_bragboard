from pydantic import BaseModel

class ReactionCreate(BaseModel):
    shoutout_id: int
    type: str

class ReactionResponse(BaseModel):
    id: int
    user_id: int
    shoutout_id: int
    type: str

    class Config:
        from_attributes = True
