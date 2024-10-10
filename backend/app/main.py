from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import projects, ai_interactions
from app.core.config import settings

app = FastAPI()

# CORS-Konfiguration hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Fügen Sie hier die URL Ihres Frontends hinzu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(ai_interactions.router, prefix="/api/ai-interactions", tags=["ai-interactions"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Wizard"}