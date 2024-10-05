from fastapi import FastAPI
from app.api.endpoints import users, projects, ai_interactions
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(ai_interactions.router, prefix="/ai-interactions", tags=["ai-interactions"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Wizard"}