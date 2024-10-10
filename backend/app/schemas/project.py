from pydantic import BaseModel
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class Project(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True