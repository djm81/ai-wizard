from fastapi import APIRouter, Depends, HTTPException, status
from app.services.project_service import ProjectService
from app.services.auth_service import AuthService
from app.schemas.project import ProjectCreate, ProjectUpdate, Project
from app.schemas.ai_interaction import AIInteractionCreate, AIInteraction
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=Project)
def create_project(project: ProjectCreate, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    return project_service.create_project(current_user.id, project)

@router.get("/", response_model=list[Project])
def read_user_projects(current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    return project_service.get_user_projects(current_user.id)

@router.get("/{project_id}", response_model=Project)
def read_project(project_id: int, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    project = project_service.get_project(project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return project

@router.put("/{project_id}", response_model=Project)
def update_project(project_id: int, project: ProjectUpdate, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    db_project = project_service.get_project(project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this project")
    return project_service.update_project(project_id, project)

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    db_project = project_service.get_project(project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    return project_service.delete_project(project_id)

@router.post("/{project_id}/interactions", response_model=AIInteraction)
def create_ai_interaction(project_id: int, interaction: AIInteractionCreate, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    db_project = project_service.get_project(project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add interactions to this project")
    return project_service.create_ai_interaction(current_user.id, project_id, interaction)

@router.get("/{project_id}/interactions", response_model=list[AIInteraction])
def read_project_interactions(project_id: int, current_user: User = Depends(AuthService.get_current_user), project_service: ProjectService = Depends()):
    db_project = project_service.get_project(project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view interactions for this project")
    return project_service.get_project_interactions(project_id)