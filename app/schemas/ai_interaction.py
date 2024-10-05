from pydantic import BaseModel
from datetime import datetime

class AIInteractionCreate(BaseModel):
    prompt: str
    response: str

class AIInteraction(BaseModel):
    id: int
    user_id: int
    project_id: int
    prompt: str
    response: str
    created_at: datetime

    class Config:
        orm_mode = True