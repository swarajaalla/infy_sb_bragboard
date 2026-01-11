from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    department: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str

    class Config:
        from_attributes = True
