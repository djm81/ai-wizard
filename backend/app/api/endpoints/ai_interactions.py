"""ai_interactions module for AI Wizard backend."""

from app.models.user import User
from app.schemas.ai_interaction import AIInteraction, AIInteractionCreate
from app.services.ai_interaction_service import AIInteractionService
from app.services.auth_service import AuthService
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.post("/", response_model=AIInteraction)
def create_ai_interaction(
    interaction: AIInteractionCreate,
    project_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    ai_interaction_service: AIInteractionService = Depends(),
):
    return ai_interaction_service.create_ai_interaction(
        current_user.id, project_id, interaction
    )


@router.get("/{interaction_id}", response_model=AIInteraction)
def read_ai_interaction(
    interaction_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    ai_interaction_service: AIInteractionService = Depends(),
):
    interaction = ai_interaction_service.get_ai_interaction(interaction_id)
    if interaction.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this AI Interaction",
        )
    return interaction


@router.get("/project/{project_id}", response_model=list[AIInteraction])
def read_project_interactions(
    project_id: int,
    current_user: User = Depends(AuthService.get_current_user),
    ai_interaction_service: AIInteractionService = Depends(),
):
    interactions = ai_interaction_service.get_project_interactions(project_id)
    if not interactions or interactions[0].user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access these AI Interactions",
        )
    return interactions


@router.get("/user/me", response_model=list[AIInteraction])
def read_user_interactions(
    current_user: User = Depends(AuthService.get_current_user),
    ai_interaction_service: AIInteractionService = Depends(),
):
    return ai_interaction_service.get_user_interactions(current_user.id)
