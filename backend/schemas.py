from pydantic import BaseModel

class RegisterSchema(BaseModel):
    username: str
    password: str
    role: str
    department: str


class LoginSchema(BaseModel):
    username: str
    password: str


class ShoutOutCreate(BaseModel):
    message: str
    department: str
