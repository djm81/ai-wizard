from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AIInteractionBase(BaseModel):
    """Base schema for AI Interaction data"""
    prompt: str
    response: str

    model_config = ConfigDict(from_attributes=True)

class AIInteractionCreate(AIInteractionBase):
    """Schema for creating a new AI interaction"""
    pass

class AIInteractionUpdate(AIInteractionBase):
    """Schema for updating an AI interaction"""
    prompt: Optional[str] = None
    response: Optional[str] = None

class AIInteraction(AIInteractionBase):
    """Schema for AI interaction response"""
    id: int
    user_id: int
    project_id: int
    created_at: datetime
    updated_at: datetime