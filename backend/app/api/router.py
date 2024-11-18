"""router module for AI Wizard backend."""

from app.api.endpoints import ai, projects, users
from fastapi import APIRouter

router = APIRouter()

router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
