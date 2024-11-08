from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    """Base schema for User data"""
    email: EmailStr
    full_name: str

    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str

class UserUpdate(BaseModel):
    """Schema for updating a user"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    """Schema for user response"""
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

class UserProfileBase(BaseModel):
    """Base schema for UserProfile data"""
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class UserProfileCreate(UserProfileBase):
    """Schema for creating a new user profile"""
    pass

class UserProfileUpdate(UserProfileBase):
    """Schema for updating a user profile"""
    pass

class UserProfile(UserProfileBase):
    """Schema for user profile response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

class UserWithProfile(User):
    """Schema for user with profile response"""
    profile: Optional[UserProfile] = None