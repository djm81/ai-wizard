from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.project_service import ProjectService
from app.schemas.project import ProjectCreate, ProjectUpdate, Project
from app.schemas.ai_interaction import AIInteractionCreate, AIInteraction
from typing import List

router = APIRouter()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    auth_service = AuthService(db)
    return await auth_service.get_current_user(credentials)

@router.get("/", response_model=List[Project])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all projects for the current user"""
    service = ProjectService(db)
    return service.get_user_projects(current_user.id)

@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    service = ProjectService(db)
    return service.create_project(current_user.id, project)

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return project

@router.get("/{project_id}/ai-interactions", response_model=List[AIInteraction])
async def list_project_interactions(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all AI interactions for a project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return service.get_project_interactions(project_id)

@router.post("/{project_id}/ai-interactions", response_model=AIInteraction, status_code=status.HTTP_201_CREATED)
async def create_project_interaction(
    project_id: int,
    interaction: AIInteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new AI interaction for a project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return service.create_ai_interaction(current_user.id, project_id, interaction)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    service.delete_project(project_id)
    return None