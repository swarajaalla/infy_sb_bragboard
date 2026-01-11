from pydantic import BaseModel
from typing import List

class ShoutOutCreate(BaseModel):
    sender_id: int
    message: str
    recipient_ids: List[int]
