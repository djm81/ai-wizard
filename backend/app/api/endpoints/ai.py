from fastapi import APIRouter, Depends, HTTPException, status
from app.services.ai_service import AIService
from app.services.auth_service import AuthService
from app.models.user import User
from app.db.database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel

router = APIRouter()

class APIKeyUpdate(BaseModel):
    api_key: str

class MessageResponse(BaseModel):
    message: str

@router.post("/set-api-key", response_model=MessageResponse)
async def set_api_key(
    api_key_update: APIKeyUpdate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    """Remove OpenAI API key from the service"""
    ai_service = AIService(db)
    success = ai_service.remove_api_key()
    if success:
        return MessageResponse(message="API key removed successfully")
    raise HTTPException(status_code=400, detail="Failed to remove API key")

@router.post("/refine-requirements", response_model=str)
async def refine_requirements(
    conversation_history: list[str],
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Refine project requirements based on conversation history"""
    ai_service = AIService(db)
    return await ai_service.refine_requirements(conversation_history)

@router.post("/generate-code", response_model=str)
async def generate_code(
    prompt: str,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Generate code based on the given prompt"""
    ai_service = AIService(db)
    return await ai_service.generate_code(prompt)

# ... (other AI-related endpoints)