"""router module for AI Wizard backend."""

from fastapi import APIRouter

from app.api.endpoints import ai, projects, users

router = APIRouter()

router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
