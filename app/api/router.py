from fastapi import APIRouter
from app.api.endpoints import users, ai, projects

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])