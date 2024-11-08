from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    """Base schema for Project data"""
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass

class ProjectUpdate(ProjectBase):
    """Schema for updating a project"""
    name: Optional[str] = None

class Project(ProjectBase):
    """Schema for project response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime