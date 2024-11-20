"""ai_interaction_service module for AI Wizard backend."""

from app.db.database import get_db
from app.models.ai_interaction import AIInteraction
from app.schemas.ai_interaction import AIInteractionCreate
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session


class AIInteractionService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_ai_interaction(
        self, user_id: int, project_id: int, interaction: AIInteractionCreate
    ) -> AIInteraction:
        db_interaction = AIInteraction(
            **interaction.model_dump(), user_id=user_id, project_id=project_id
        )
        self.db.add(db_interaction)
        self.db.commit()
        self.db.refresh(db_interaction)
        return db_interaction

    def get_ai_interaction(self, interaction_id: int) -> AIInteraction:
        interaction = (
            self.db.query(AIInteraction).filter(AIInteraction.id == interaction_id).first()
        )
        if not interaction:
            raise HTTPException(status_code=404, detail="AI Interaction not found")
        return interaction

    def get_project_interactions(self, project_id: int) -> list[AIInteraction]:
        return self.db.query(AIInteraction).filter(AIInteraction.project_id == project_id).all()

    def get_user_interactions(self, user_id: int) -> list[AIInteraction]:
        return self.db.query(AIInteraction).filter(AIInteraction.user_id == user_id).all()
