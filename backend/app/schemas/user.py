from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str   # ✅ NEW

# schemas/user.py
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    department: str
    is_active: bool  # ✅ ADD THIS

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminCreateUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str | None = None
    role: str = "employee"