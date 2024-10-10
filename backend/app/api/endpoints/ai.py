from fastapi import APIRouter, Depends, HTTPException, status
from app.services.ai_service import AIService
from app.services.auth_service import AuthService
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class APIKeyUpdate(BaseModel):
    api_key: str

@router.post("/set-api-key")
async def set_api_key(
    api_key_update: APIKeyUpdate,
    current_user: User = Depends(AuthService.get_current_user),
    ai_service: AIService = Depends()
):
    success = await ai_service.set_api_key(api_key_update.api_key)
    if success:
        return {"message": "API key set successfully"}
    raise HTTPException(status_code=400, detail="Failed to set API key")

@router.post("/remove-api-key")
async def remove_api_key(
    current_user: User = Depends(AuthService.get_current_user),
    ai_service: AIService = Depends()
):
    success = await ai_service.remove_api_key()
    if success:
        return {"message": "API key removed successfully"}
    raise HTTPException(status_code=400, detail="Failed to remove API key")

# ... (other AI-related endpoints)