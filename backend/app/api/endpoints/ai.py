"""AI-related endpoints for code generation and refinement."""

from dataclasses import dataclass
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.services.ai_service import AIService
from app.services.auth_service import AuthService

router = APIRouter()


@dataclass
class APIKeyUpdate:
    """Data transfer object for API key updates.

    This class is intentionally minimal as it serves only as a data container.
    """

    api_key: str


class MessageResponse(BaseModel):
    message: str


class GenerateCodeRequest(BaseModel):
    """Schema for code generation request"""

    prompt: str


@router.post("/set-api-key", response_model=MessageResponse)
async def set_api_key(
    api_key_update: APIKeyUpdate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
):
    """Set OpenAI API key for the service"""
    ai_service = AIService(db)
    success = ai_service.set_api_key(api_key_update.api_key)
    if success:
        return MessageResponse(message="API key set successfully")
    raise HTTPException(status_code=400, detail="Failed to set API key")


@router.post("/remove-api-key", response_model=MessageResponse)
async def remove_api_key(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
):
    """Remove OpenAI API key from the service"""
    ai_service = AIService(db)
    success = ai_service.remove_api_key()
    if success:
        return MessageResponse(message="API key removed successfully")
    raise HTTPException(status_code=400, detail="Failed to remove API key")


@router.post("/refine-requirements")
async def refine_requirements(
    conversation: list[str],
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
):
    """Refine project requirements based on conversation history"""
    ai_service = AIService(db)
    # Initialize with test key for testing
    if not settings.IS_LAMBDA:
        await ai_service.set_api_key("test-key")
    else:
        await ai_service.set_api_key(settings.OPENAI_API_KEY)
    return await ai_service.refine_requirements(conversation)


@router.post("/generate-code")
async def generate_code(
    request: GenerateCodeRequest,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
):
    """Generate code based on the given prompt"""
    ai_service = AIService(db)
    # Initialize with test key for testing
    if not settings.IS_LAMBDA:
        await ai_service.set_api_key("test-key")
    else:
        await ai_service.set_api_key(settings.OPENAI_API_KEY)
    return await ai_service.generate_code(request.prompt)


# ... (other AI-related endpoints)
