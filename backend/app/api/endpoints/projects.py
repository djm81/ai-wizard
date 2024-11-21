"""projects module for AI Wizard backend."""

from typing import List, Annotated

from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.ai_interaction import AIInteraction, AIInteractionCreate
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.services.auth_service import AuthService, AuthCredentials
from app.services.project_service import ProjectService

router = APIRouter()
security = HTTPBearer()

# Add DBSession type alias if not already present
DBSession = Annotated[Session, Depends(get_db)]


async def get_current_user(
    credentials: AuthCredentials,
    db: DBSession,
) -> User:
    """Get current authenticated user"""
    auth_service = AuthService(db)
    return await auth_service.get_current_user(credentials, db)


@router.get("/", response_model=List[Project])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all projects for the current user"""
    service = ProjectService(db)
    return service.get_user_projects(current_user.id)


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new project"""
    service = ProjectService(db)
    return service.create_project(current_user.id, project)


@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
    db: Session = Depends(get_db),
):
    """List all AI interactions for a project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return service.get_project_interactions(project_id)


@router.post(
    "/{project_id}/ai-interactions",
    response_model=AIInteraction,
    status_code=status.HTTP_201_CREATED,
)
async def create_project_interaction(
    project_id: int,
    interaction: AIInteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
    db: Session = Depends(get_db),
):
    """Delete a specific project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    service.delete_project(project_id)
    return None


@router.get(
    "/{project_id}/ai-interactions/{interaction_id}",
    response_model=AIInteraction,
)
async def read_project_interaction(
    project_id: int,
    interaction_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific AI interaction for a project"""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")

    interaction = service.get_project_interaction(project_id, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="AI Interaction not found")
    return interaction
