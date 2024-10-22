from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    password: str | None = None

class UserProfileCreate(BaseModel):
    bio: str | None = None
    preferences: dict | None = None

class UserProfileUpdate(BaseModel):
    bio: str | None = None
    preferences: dict | None = None

class UserProfile(UserProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserWithProfile(User):
    profile: UserProfile | None

    class Config:
        from_attributes = True