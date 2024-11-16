from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class AIInteractionBase(BaseModel):
    """Base schema for AI Interaction data"""
    prompt: str = Field(..., min_length=10, max_length=1000)

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
    response: str
    created_at: datetime
    updated_at: datetime